import { createInitialSnapshot, reduceAiEvent } from './state.js';
import type {
  AiAssistantMessage,
  AiEvent,
  AiMessage,
  AiModel,
  AiScenario,
  AiTool,
  AiToolCallContent,
  AiWorkbenchSnapshot
} from './types.js';

const baseTime = new Date('2026-06-30T14:15:00.000Z').getTime();

const models: AiModel[] = [
  {
    id: 'deepseek-v4-flash',
    name: 'DeepSeek V4 Flash',
    provider: 'deepseek',
    contextWindow: 128000,
    supportsThinking: true
  },
  {
    id: 'claude-sonnet-4-5',
    name: 'Claude Sonnet 4.5',
    provider: 'anthropic',
    contextWindow: 200000,
    supportsThinking: true
  },
  {
    id: 'qwen3-coder',
    name: 'Qwen3 Coder',
    provider: 'openrouter',
    contextWindow: 256000,
    supportsThinking: false
  }
];

const tools: AiTool[] = [
  {
    name: 'read',
    description: 'Read a file from the active workspace.',
    parameters: {
      type: 'object',
      properties: {
        path: { type: 'string' }
      },
      required: ['path']
    }
  },
  {
    name: 'grep',
    description: 'Search workspace text with ripgrep semantics.',
    parameters: {
      type: 'object',
      properties: {
        pattern: { type: 'string' },
        path: { type: 'string' }
      },
      required: ['pattern']
    }
  },
  {
    name: 'bash',
    description: 'Run a shell command in the project environment.',
    parameters: {
      type: 'object',
      properties: {
        command: { type: 'string' }
      },
      required: ['command']
    }
  },
  {
    name: 'edit',
    description: 'Apply a targeted file edit.',
    parameters: {
      type: 'object',
      properties: {
        path: { type: 'string' },
        patch: { type: 'string' }
      }
    }
  }
];

const baseSnapshot = createInitialSnapshot({
  models,
  model: models[0],
  thinkingLevel: 'high',
  thinkingLevels: ['off', 'minimal', 'low', 'medium', 'high', 'xhigh'],
  tools,
  activeToolNames: ['read', 'grep', 'bash'],
  session: {
    id: 'sess_01jz7y4d2m5b9vn3k9f7r1c2tq',
    file: '.pi/sessions/orquesta-dev.jsonl',
    name: 'orquesta ai sdk',
    cwd: '/home/caches/Repos/anchor-orchestrator/apps/orquesta'
  }
});

const userMessage: AiMessage = {
  role: 'user',
  content: 'Run /grill-me and read the latest handoff, we need to plan a feature.',
  timestamp: baseTime
};

const assistantMessage: AiAssistantMessage = {
  role: 'assistant',
  provider: 'deepseek',
  model: 'deepseek-v4-flash',
  api: 'responses',
  stopReason: 'toolUse',
  timestamp: baseTime + 2400,
  usage: {
    input: 2314,
    output: 832,
    cacheRead: 1408,
    cacheWrite: 0,
    reasoning: 164,
    totalTokens: 4554,
    cost: {
      input: 0.0018,
      output: 0.0034,
      cacheRead: 0.0005,
      cacheWrite: 0,
      total: 0.0057
    }
  },
  content: [
    {
      type: 'thinking',
      thinking: 'The user wants me to run the grill-me skill and start a planning session.'
    },
    {
      type: 'text',
      text: 'I will run grill-me first then read the handoff.'
    },
    {
      type: 'toolCall',
      id: 'toolu_01grep',
      name: 'grep',
      arguments: {
        pattern: 'AiWorkbenchSnapshot',
        path: 'packages/orquesta-core/src'
      }
    }
  ]
};

const toolResult: AiMessage = {
  role: 'toolResult',
  toolCallId: 'toolu_01grep',
  toolName: 'grep',
  isError: false,
  timestamp: baseTime + 4100,
  content: [
    {
      type: 'text',
      text: 'packages/orquesta-core/src/agent/index.ts: snapshot = reduceAiEvent(snapshot, event)'
    }
  ],
  details: {
    matches: 1,
    elapsedMs: 34
  }
};

const completionMessage: AiAssistantMessage = {
  role: 'assistant',
  provider: 'deepseek',
  model: 'deepseek-v4-flash',
  api: 'responses',
  stopReason: 'stop',
  timestamp: baseTime + 6200,
  usage: {
    input: 5180,
    output: 1048,
    cacheRead: 2000,
    cacheWrite: 0,
    reasoning: 220,
    totalTokens: 8228,
    cost: {
      input: 0.0031,
      output: 0.0042,
      cacheRead: 0.0008,
      cacheWrite: 0,
      total: 0.0081
    }
  },
  content: [
    {
      type: 'text',
      text: 'I am now going to read the handoff.'
    }
  ]
};

const streamingPartial: AiAssistantMessage = {
  role: 'assistant',
  provider: 'anthropic',
  model: 'claude-sonnet-4-5',
  api: 'messages',
  timestamp: baseTime + 9000,
  content: [
    {
      type: 'thinking',
      thinking: 'Check reducer transitions before touching transport.'
    },
    {
      type: 'text',
      text: 'I am streaming a fixture response while the queue accepts follow-up work.'
    }
  ]
};

const errorAssistant: AiAssistantMessage = {
  role: 'assistant',
  provider: 'openrouter',
  model: 'qwen3-coder',
  api: 'responses',
  stopReason: 'error',
  errorMessage: 'Provider returned a retryable 429.',
  timestamp: baseTime + 12000,
  content: [
    {
      type: 'text',
      text: 'The provider returned a retryable rate limit.'
    }
  ]
};

export const fixtureEvents: AiEvent[] = [
  { type: 'agent_start', timestamp: baseTime + 100 },
  { type: 'message_start', message: userMessage, timestamp: baseTime + 200 },
  { type: 'turn_start', timestamp: baseTime + 900 },
  {
    type: 'message_start',
    message: { ...assistantMessage, content: [] },
    timestamp: baseTime + 1100
  },
  {
    type: 'message_update',
    assistantMessageEvent: {
      type: 'thinking_delta',
      contentIndex: 0,
      delta: 'Keep the Pi adapter outside the UI package',
      partial: { ...assistantMessage, content: [assistantMessage.content[0]] }
    },
    timestamp: baseTime + 1400
  },
  {
    type: 'message_update',
    assistantMessageEvent: {
      type: 'text_delta',
      contentIndex: 1,
      delta: 'I will keep the wrapper thin',
      partial: { ...assistantMessage, content: assistantMessage.content.slice(0, 2) }
    },
    timestamp: baseTime + 1800
  },
  {
    type: 'message_update',
    assistantMessageEvent: {
      type: 'toolcall_end',
      contentIndex: 2,
      toolCall: assistantMessage.content[2] as AiToolCallContent,
      partial: assistantMessage
    },
    timestamp: baseTime + 2300
  },
  { type: 'message_end', message: assistantMessage, timestamp: baseTime + 2400 },
  {
    type: 'tool_execution_start',
    toolCallId: 'toolu_01grep',
    toolName: 'grep',
    args: { pattern: 'AiWorkbenchSnapshot', path: 'packages/orquesta-core/src' },
    timestamp: baseTime + 2600
  },
  {
    type: 'tool_execution_update',
    toolCallId: 'toolu_01grep',
    toolName: 'grep',
    partialResult: 'searching workspace',
    timestamp: baseTime + 3300
  },
  {
    type: 'tool_execution_end',
    toolCallId: 'toolu_01grep',
    toolName: 'grep',
    result: { matches: 1 },
    isError: false,
    timestamp: baseTime + 3900
  },
  { type: 'message_end', message: toolResult, timestamp: baseTime + 4100 },
  {
    type: 'turn_end',
    message: assistantMessage,
    toolResults: [toolResult],
    timestamp: baseTime + 4300
  },
  { type: 'message_end', message: completionMessage, timestamp: baseTime + 6200 },
  { type: 'agent_end', willRetry: false, timestamp: baseTime + 7000 }
];

function snapshotFromEvents(events: AiEvent[], overrides: Partial<AiWorkbenchSnapshot> = {}) {
  return events.reduce(
    (snapshot, event) => reduceAiEvent(snapshot, event),
    createInitialSnapshot({
      ...baseSnapshot,
      ...overrides
    })
  );
}

const idleSnapshot = createInitialSnapshot({
  ...baseSnapshot,
  messages: [userMessage, assistantMessage, toolResult, completionMessage],
  run: {
    phase: 'idle',
    isStreaming: false,
    activeToolCallIds: []
  }
});

const streamingSnapshot = createInitialSnapshot({
  ...baseSnapshot,
  messages: [userMessage],
  streamingMessage: streamingPartial,
  run: {
    phase: 'streaming_message',
    isStreaming: true,
    activeToolCallIds: []
  },
  queue: {
    steering: ['Keep the wrapper API tiny.'],
    followUp: ['Add a compact debug panel after the transcript works.'],
    nextTurn: []
  },
  model: models[1]
});

const toolsSnapshot = snapshotFromEvents(fixtureEvents, {
  run: {
    phase: 'executing_tools',
    isStreaming: true,
    activeToolCallIds: ['toolu_01grep']
  }
});

const retrySnapshot = createInitialSnapshot({
  ...baseSnapshot,
  messages: [userMessage, errorAssistant],
  model: models[2],
  run: {
    phase: 'retrying',
    isStreaming: true,
    activeToolCallIds: [],
    retry: {
      attempt: 1,
      maxAttempts: 3,
      delayMs: 1200
    },
    message: 'Provider returned a retryable 429.'
  },
  error: {
    message: 'Provider returned a retryable 429.'
  }
});

const compactionSnapshot = createInitialSnapshot({
  ...baseSnapshot,
  messages: [
    userMessage,
    assistantMessage,
    toolResult,
    {
      role: 'compactionSummary',
      summary: 'Earlier context: keep the UI snapshot-driven and the Pi adapter thin.',
      tokensBefore: 18720,
      timestamp: baseTime + 8000
    }
  ],
  run: {
    phase: 'compacting',
    isStreaming: true,
    activeToolCallIds: []
  }
});

export const fixtureScenarios: AiScenario[] = [
  {
    id: 'idle',
    label: 'Workbench setup',
    snapshot: idleSnapshot
  },
  {
    id: 'streaming',
    label: 'Active run',
    snapshot: streamingSnapshot
  },
  {
    id: 'tools',
    label: 'Tool run',
    snapshot: toolsSnapshot
  },
  {
    id: 'retry',
    label: 'Retry handling',
    snapshot: retrySnapshot
  },
  {
    id: 'compaction',
    label: 'Compaction',
    snapshot: compactionSnapshot
  }
];

export function getDefaultScenario() {
  return fixtureScenarios[0];
}
