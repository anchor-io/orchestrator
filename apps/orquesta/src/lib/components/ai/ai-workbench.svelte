<script lang="ts">
  import { cn } from '$lib/utils.js';
  import AiComposer from './ai-composer.svelte';
  import AiDebugPanel from './ai-debug-panel.svelte';
  import AiQueue from './ai-queue.svelte';
  import AiToolControls from './ai-tool-controls.svelte';
  import AiTranscript from './ai-transcript.svelte';
  import type { AiWorkbenchActions, AiWorkbenchSession, AiWorkbenchSnapshot } from './types.js';

  // Three-panel harness: sessions, chat, and runtime/debug details.
  interface Props {
    /** Renderable state produced by the wrapper or fixture reducer. */
    snapshot: AiWorkbenchSnapshot;
    /** UI callbacks for prompts, controls, and run actions. */
    actions?: AiWorkbenchActions;
    /** Optional session list for the left rail. */
    sessions?: AiWorkbenchSession[];
    /** Selected session id; falls back to snapshot.session.id. */
    activeSessionId?: string;
    /** Opens a session when the developer clicks the left rail. */
    onSelectSession?: (sessionId: string) => void | Promise<void>;
    /** Optional class for embedding the workbench shell. */
    class?: string;
  }

  let {
    snapshot,
    actions,
    sessions = [],
    activeSessionId,
    onSelectSession,
    class: className
  }: Props = $props();

  const fallbackSession = $derived<AiWorkbenchSession>({
    id: snapshot.session?.id ?? 'current',
    name: snapshot.session?.name ?? 'Current session',
    status:
      snapshot.run.phase === 'error'
        ? 'error'
        : snapshot.run.isStreaming
          ? 'running'
          : snapshot.run.phase === 'settled'
            ? 'settled'
            : 'idle'
  });
  const sessionItems = $derived(sessions.length > 0 ? sessions : [fallbackSession]);
  const selectedSessionId = $derived(
    activeSessionId ?? snapshot.session?.id ?? sessionItems[0]?.id
  );
  const activeSession = $derived(
    sessionItems.find((session) => session.id === selectedSessionId) ?? sessionItems[0]
  );
  const queuedCount = $derived(
    snapshot.queue.steering.length + snapshot.queue.followUp.length + snapshot.queue.nextTurn.length
  );
  const hasQueuedMessages = $derived(queuedCount > 0);
</script>

<section
  data-slot="ai-workbench"
  class={cn(
    'grid min-h-dvh overflow-hidden border border-border bg-background text-foreground',
    className
  )}
>
  <div class="grid min-h-dvh lg:grid-cols-[15rem_minmax(0,1fr)_20rem]">
    <aside
      data-slot="ai-session-rail"
      class="order-2 min-h-0 overflow-y-auto border-t border-border bg-muted/10 lg:order-none lg:border-t-0 lg:border-r"
    >
      <div class="flex h-10 items-center border-b border-border px-4">
        <h2 class="text-sm font-medium">Sessions</h2>
      </div>

      <nav aria-label="Sessions" class="grid gap-1 p-2">
        {#each sessionItems as session (session.id)}
          <button
            type="button"
            aria-current={session.id === selectedSessionId ? 'page' : undefined}
            disabled={!onSelectSession}
            class={cn(
              'grid min-h-11 gap-1 border-l border-transparent px-2 py-2 text-left transition-colors hover:bg-muted/35 disabled:cursor-default disabled:hover:bg-transparent',
              session.id === selectedSessionId && 'border-primary bg-primary-wash/20'
            )}
            onclick={() => void onSelectSession?.(session.id)}
          >
            <span class="flex min-w-0 items-center justify-between gap-2">
              <span class="truncate text-xs font-medium text-foreground">{session.name}</span>
              {#if session.status && session.status !== 'idle'}
                <span
                  class={cn(
                    'shrink-0 font-mono text-[10px] text-muted-foreground',
                    session.status === 'running' && 'text-primary',
                    session.status === 'error' && 'text-destructive'
                  )}
                >
                  {session.status}
                </span>
              {/if}
            </span>
          </button>
        {/each}
      </nav>

      {#if hasQueuedMessages}
        <div class="border-t border-border px-3">
          <AiQueue class="py-3" queue={snapshot.queue} {actions} />
        </div>
      {/if}
    </aside>

    <main
      data-slot="ai-chat-panel"
      class="order-1 grid min-h-0 grid-rows-[auto_minmax(0,1fr)_auto] lg:order-none"
    >
      <header class="flex h-10 min-w-0 items-center border-b border-border px-4">
        <div class="min-w-0">
          <h1 class="truncate text-sm font-medium">
            {activeSession?.name ?? snapshot.session?.name ?? 'Pi workbench'}
          </h1>
        </div>
      </header>
      <AiTranscript messages={snapshot.messages} streamingMessage={snapshot.streamingMessage} />
      <AiComposer
        run={snapshot.run}
        queue={snapshot.queue}
        model={snapshot.model}
        models={snapshot.models}
        thinkingLevel={snapshot.thinkingLevel}
        thinkingLevels={snapshot.thinkingLevels}
        {actions}
      />
    </main>

    <aside
      data-slot="ai-inspector-rail"
      class="order-3 min-h-0 overflow-y-auto border-t border-border bg-muted/15 lg:order-none lg:border-t-0 lg:border-l"
    >
      <div class="grid divide-y divide-border/80 px-4">
        <AiToolControls
          class="py-3"
          tools={snapshot.tools}
          activeToolNames={snapshot.activeToolNames}
          {actions}
        />
        <AiDebugPanel class="py-3" {snapshot} />
      </div>
    </aside>
  </div>
</section>
