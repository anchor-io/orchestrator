import type {
  AiAssistantMessage,
  AiEvent,
  AiMessage,
  AiQueuedEvent,
  AiToolExecution,
  AiWorkbenchSnapshot
} from './types.js';

const MAX_EVENTS = 200;

export function createInitialSnapshot(
  overrides: Partial<AiWorkbenchSnapshot> = {}
): AiWorkbenchSnapshot {
  const snapshot: AiWorkbenchSnapshot = {
    messages: [],
    events: [],
    run: {
      phase: 'idle',
      isStreaming: false,
      activeToolCallIds: []
    },
    queue: {
      steering: [],
      followUp: [],
      nextTurn: []
    },
    models: [],
    thinkingLevels: ['off', 'minimal', 'low', 'medium', 'high'],
    tools: [],
    activeToolNames: [],
    toolExecutions: []
  };

  const defaultRun = snapshot.run;
  const defaultQueue = snapshot.queue;
  Object.assign(snapshot, overrides);
  snapshot.run = { ...defaultRun, ...overrides.run };
  snapshot.queue = { ...defaultQueue, ...overrides.queue };

  return snapshot;
}

export function reduceAiEvent(snapshot: AiWorkbenchSnapshot, event: AiEvent): AiWorkbenchSnapshot {
  const receivedAt = Date.now();
  const next: AiWorkbenchSnapshot = {
    ...snapshot,
    messages: [...snapshot.messages],
    events: appendEvent(snapshot.events, event, receivedAt),
    queue: { ...snapshot.queue },
    run: {
      ...snapshot.run,
      activeToolCallIds: [...snapshot.run.activeToolCallIds]
    },
    toolExecutions: [...snapshot.toolExecutions],
    activeToolNames: [...snapshot.activeToolNames]
  };

  switch (event.type) {
    case 'agent_start':
      next.error = undefined;
      next.run = { phase: 'running_agent', isStreaming: true, activeToolCallIds: [] };
      break;
    case 'agent_end':
      if (event.messages) {
        next.messages = event.messages;
      }
      next.streamingMessage = undefined;
      next.run = {
        phase: event.willRetry ? 'retrying' : 'settled',
        isStreaming: false,
        activeToolCallIds: activeToolIds(next.toolExecutions)
      };
      break;
    case 'turn_start':
      next.run = { ...next.run, phase: 'running_turn', isStreaming: true };
      break;
    case 'turn_end':
      if (event.toolResults?.length) {
        next.messages = upsertMessages(next.messages, event.toolResults);
      }
      next.run = { ...next.run, phase: 'running_agent' };
      break;
    case 'message_start':
      next.error = undefined;
      if (event.message.role === 'assistant') {
        next.streamingMessage = event.message;
        next.run = { ...next.run, phase: 'streaming_message', isStreaming: true };
      } else {
        next.messages = upsertMessages(next.messages, [event.message]);
      }
      break;
    case 'message_update':
      next.streamingMessage = getPartialMessage(event);
      next.run = {
        ...next.run,
        phase:
          event.assistantMessageEvent.type === 'toolcall_start' ||
          event.assistantMessageEvent.type === 'toolcall_delta' ||
          event.assistantMessageEvent.type === 'toolcall_end'
            ? 'executing_tools'
            : 'streaming_message',
        isStreaming: true
      };
      break;
    case 'message_end':
      if (event.message.role === 'assistant') {
        next.streamingMessage = undefined;
      }
      next.messages = upsertMessages(next.messages, [event.message]);
      break;
    case 'tool_execution_start':
      next.toolExecutions = upsertToolExecution(next.toolExecutions, {
        toolCallId: event.toolCallId,
        toolName: event.toolName,
        args: event.args,
        status: 'running',
        updatedAt: event.timestamp ?? receivedAt
      });
      next.run = {
        ...next.run,
        phase: 'executing_tools',
        isStreaming: true,
        activeToolCallIds: activeToolIds(next.toolExecutions)
      };
      break;
    case 'tool_execution_update':
      next.toolExecutions = upsertToolExecution(next.toolExecutions, {
        toolCallId: event.toolCallId,
        toolName: event.toolName,
        args: event.args,
        partialResult: event.partialResult,
        status: 'running',
        updatedAt: event.timestamp ?? receivedAt
      });
      break;
    case 'tool_execution_end':
      next.toolExecutions = upsertToolExecution(next.toolExecutions, {
        toolCallId: event.toolCallId,
        toolName: event.toolName,
        result: event.result,
        isError: event.isError,
        status: event.isError ? 'error' : 'completed',
        updatedAt: event.timestamp ?? receivedAt
      });
      next.run = { ...next.run, activeToolCallIds: activeToolIds(next.toolExecutions) };
      break;
    case 'queue_update':
      next.queue = {
        steering: [...event.steering],
        followUp: [...event.followUp],
        nextTurn: [...(event.nextTurn ?? [])]
      };
      break;
    case 'compaction_start':
      next.run = { ...next.run, phase: 'compacting', isStreaming: true };
      break;
    case 'compaction_end':
      next.run = {
        ...next.run,
        phase: event.errorMessage ? 'error' : event.willRetry ? 'retrying' : 'settled',
        isStreaming: event.willRetry
      };
      if (event.errorMessage) {
        next.error = { message: event.errorMessage };
      }
      break;
    case 'thinking_level_changed':
      next.thinkingLevel = event.level;
      break;
    case 'session_info_changed':
      next.session = {
        ...next.session,
        name: event.name
      };
      break;
    case 'auto_retry_start':
      next.run = {
        ...next.run,
        phase: 'retrying',
        retry: {
          attempt: event.attempt,
          maxAttempts: event.maxAttempts,
          delayMs: event.delayMs
        },
        message: event.errorMessage
      };
      break;
    case 'auto_retry_end':
      next.run = {
        ...next.run,
        phase: event.success ? 'running_agent' : 'error',
        retry: { attempt: event.attempt },
        message: event.finalError
      };
      if (event.finalError) {
        next.error = { message: event.finalError };
      }
      break;
    case 'abort':
      next.streamingMessage = undefined;
      next.run = { ...next.run, phase: 'aborted', isStreaming: false, activeToolCallIds: [] };
      break;
    case 'settled':
      next.streamingMessage = undefined;
      next.run = { ...next.run, phase: 'settled', isStreaming: false, activeToolCallIds: [] };
      break;
    case 'error':
      next.error = { message: event.message, cause: event.cause };
      next.run = { ...next.run, phase: 'error', isStreaming: false };
      break;
  }

  return next;
}

function appendEvent(events: AiQueuedEvent[], event: AiEvent, receivedAt: number): AiQueuedEvent[] {
  const queued = {
    ...event,
    id: `${receivedAt}-${events.length}-${event.type}`,
    receivedAt
  } as AiQueuedEvent;

  return [...events, queued].slice(-MAX_EVENTS);
}

function getPartialMessage(
  event: Extract<AiEvent, { type: 'message_update' }>
): AiAssistantMessage {
  const messageEvent = event.assistantMessageEvent;
  if (messageEvent.type === 'done') return messageEvent.message;
  if (messageEvent.type === 'error') return messageEvent.error;
  return messageEvent.partial;
}

function upsertMessages(messages: AiMessage[], incoming: AiMessage[]) {
  let next = [...messages];
  for (const message of incoming) {
    const index = next.findIndex(
      (item) => getMessageIdentity(item) === getMessageIdentity(message)
    );
    if (index === -1) {
      next = [...next, message];
    } else {
      next[index] = message;
    }
  }
  return next;
}

function getMessageIdentity(message: AiMessage) {
  if (message.id) return message.id;
  if (message.role === 'toolResult') return `toolResult:${message.toolCallId}:${message.timestamp}`;
  return `${message.role}:${message.timestamp}`;
}

function upsertToolExecution(executions: AiToolExecution[], execution: AiToolExecution) {
  const index = executions.findIndex((item) => item.toolCallId === execution.toolCallId);
  if (index === -1) return [...executions, execution];
  const next = [...executions];
  next[index] = { ...next[index], ...execution };
  return next;
}

function activeToolIds(executions: AiToolExecution[]) {
  return executions
    .filter((execution) => execution.status === 'pending' || execution.status === 'running')
    .map((execution) => execution.toolCallId);
}
