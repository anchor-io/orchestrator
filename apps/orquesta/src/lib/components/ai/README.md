# AI workbench usage

The AI workbench is a UI harness. It does not run an agent, own auth, open files, or
talk to Pi directly. Your wrapper owns those concerns and feeds the workbench two
things:

- `snapshot`: the current renderable state
- `actions`: callbacks the UI can call when a developer prompts, steers, aborts, or
  changes run settings

```svelte
<script lang="ts">
  import {
    AiWorkbench,
    createInitialSnapshot,
    reduceAiEvent,
    type AiAssistantMessage,
    type AiEvent,
    type AiWorkbenchActions,
    type AiWorkbenchSession,
    type AiWorkbenchSnapshot
  } from '$lib/components/ai/index.js';

  let snapshot = $state<AiWorkbenchSnapshot>(
    createInitialSnapshot({
      model: { id: 'pi-default', name: 'Pi default', provider: 'pi' },
      models: [{ id: 'pi-default', name: 'Pi default', provider: 'pi' }],
      thinkingLevel: 'medium',
      tools: [
        { name: 'read', description: 'Read a file from the active workspace.' },
        { name: 'grep', description: 'Search workspace text.' }
      ],
      activeToolNames: ['read', 'grep'],
      session: {
        name: 'wrapper dev session',
        cwd: '/workspace/project'
      }
    })
  );

  const sessions: AiWorkbenchSession[] = [
    {
      id: 'sess_main',
      name: 'wrapper dev session',
      status: 'running'
    }
  ];

  const actions: AiWorkbenchActions = {
    prompt: (text) => pi.prompt(text),
    steer: (text) => pi.steer(text),
    followUp: (text) => pi.followUp(text),
    abort: () => pi.abort(),
    clearQueue: () => pi.clearQueue(),
    setModel: (modelId) => pi.setModel(modelId),
    setThinkingLevel: (level) => pi.setThinkingLevel(level),
    setActiveTools: (toolNames) => pi.setTools(toolNames),
    compact: (instructions) => pi.compact({ instructions })
  };

  pi.onEvent((piEvent) => {
    const event = toAiEvent(piEvent);
    if (event) snapshot = reduceAiEvent(snapshot, event);
  });

  function toAiEvent(piEvent: PiEvent): AiEvent | undefined {
    // Translate your wrapper's event shape into the structural AiEvent union.
    // Keep this adapter thin; do not put UI behavior in the Pi wrapper.
  }
</script>

<AiWorkbench {snapshot} {actions} {sessions} activeSessionId="sess_main" />
```

## The adapter loop

Use `createInitialSnapshot` once when the wrapper mounts. Put stable capabilities
there: available models, selected model, thinking levels, tools, active tools, and
session metadata.

After that, treat Pi events as the source of truth:

```ts
snapshot = reduceAiEvent(snapshot, aiEvent);
```

The reducer updates:

- transcript messages and the currently streaming assistant message
- run phase, retry state, active tool ids, and error state
- queue state for steering/follow-up/next-turn messages
- tool execution status and partial/final results
- compacting and thinking-level state
- a capped debug event log

The center chat renders user-facing text plus compact reasoning, tool-call, and
tool-result activity. Token usage and raw provider/tool payloads remain available in
the debug rail through the snapshot.

## Minimum useful event mapping

For a first real Pi wrapper, you do not need perfect streaming. This sequence is
enough to prove the integration:

```ts
const ingest = (event: AiEvent) => {
  snapshot = reduceAiEvent(snapshot, event);
};

ingest({ type: 'agent_start' });
ingest({ type: 'message_start', message: userMessage });
ingest({ type: 'message_start', message: assistantPartial });
ingest({ type: 'message_end', message: assistantFinal });
ingest({ type: 'settled' });
```

Then add tool visibility:

```ts
ingest({
  type: 'tool_execution_start',
  toolCallId: 'toolu_01',
  toolName: 'grep',
  args: { pattern: 'AiWorkbenchSnapshot' }
});

ingest({
  type: 'tool_execution_end',
  toolCallId: 'toolu_01',
  toolName: 'grep',
  result: { matches: 3 },
  isError: false
});
```

Then add real streaming with `message_update`. The workbench expects the update to
carry a renderable assistant `partial`, so your Pi wrapper can keep assembling the
partial message while it translates provider deltas:

```ts
const partial = {
  role: 'assistant',
  id: 'msg_01',
  timestamp: Date.now(),
  provider: 'pi',
  model: 'pi-default',
  content: [{ type: 'text', text: 'Working through the file tree...' }]
} satisfies AiAssistantMessage;

snapshot = reduceAiEvent(snapshot, {
  type: 'message_update',
  message: partial,
  assistantMessageEvent: {
    type: 'text_delta',
    contentIndex: 0,
    delta: ' file tree...',
    partial
  }
});
```

## Action callbacks

The UI calls `actions`; your wrapper decides what those mean:

- `prompt(text)`: start a new user turn from the idle `Send` action
- `steer(text)`: send steering text into an active run via `Ctrl+Enter`
- `followUp(text)`: queue typed composer text after the active run
- `abort()`: cancel the active run from the `Stop` action
- `clearQueue()`: clear pending steering/follow-up queues
- `setModel(modelId)`: switch wrapper/provider model
- `setThinkingLevel(level)`: switch reasoning budget
- `setActiveTools(toolNames)`: enable/disable wrapper tools
- `compact(instructions?)`: request context compaction

Prefer reflecting action outcomes back through events. For example, after
`setThinkingLevel('high')`, emit:

```ts
snapshot = reduceAiEvent(snapshot, {
  type: 'thinking_level_changed',
  level: 'high'
});
```

## Practical adapter shape

Keep the Pi wrapper in its own module and expose a small UI-facing surface:

```ts
export type PiWorkbenchAdapter = {
  getInitialSnapshot(): AiWorkbenchSnapshot;
  getSessions(): AiWorkbenchSession[];
  subscribe(handler: (event: AiEvent) => void): () => void;
  actions: AiWorkbenchActions;
};
```

Then the Svelte component stays small:

```svelte
<script lang="ts">
  import { AiWorkbench, reduceAiEvent } from '$lib/components/ai/index.js';
  import { createPiWorkbenchAdapter } from '$lib/pi/workbench-adapter.js';

  const adapter = createPiWorkbenchAdapter();
  let snapshot = $state(adapter.getInitialSnapshot());
  let sessions = $state(adapter.getSessions());

  $effect(() => {
    return adapter.subscribe((event) => {
      snapshot = reduceAiEvent(snapshot, event);
      sessions = adapter.getSessions();
    });
  });
</script>

<AiWorkbench
  {snapshot}
  {sessions}
  activeSessionId={snapshot.session?.id}
  actions={adapter.actions}
/>
```

That boundary keeps this package useful as a development harness: components render
snapshots, the reducer interprets structural events, and the Pi wrapper remains the
only place that knows how runs actually execute.

## Three-panel layout

`AiWorkbench` renders sessions on the left, chat in the middle, and runtime/debug
data on the right. Model and effort selectors live with the prompt so the right rail
can stay focused on tools and raw state.

If you omit `sessions`, the left rail falls back to `snapshot.session`. For a real
wrapper, pass `sessions`, `activeSessionId`, and `onSelectSession`:

```svelte
<AiWorkbench
  {snapshot}
  {sessions}
  activeSessionId={snapshot.session?.id}
  onSelectSession={(sessionId) => pi.openSession(sessionId)}
  actions={adapter.actions}
/>
```
