import { describe, expect, test } from 'vitest';
import { createInitialSnapshot, reduceAiEvent } from './state.js';
import type { AiAssistantMessage, AiToolResultMessage } from './types.js';

const timestamp = new Date('2026-06-30T15:00:00.000Z').getTime();

const assistant: AiAssistantMessage = {
  role: 'assistant',
  timestamp,
  provider: 'deepseek',
  model: 'deepseek-v4-flash',
  stopReason: 'toolUse',
  content: [
    {
      type: 'text',
      text: 'Reading the current component boundary.'
    },
    {
      type: 'toolCall',
      id: 'toolu_read',
      name: 'read',
      arguments: {
        path: 'src/lib/components/ai/state.ts'
      }
    }
  ]
};

const toolResult: AiToolResultMessage = {
  role: 'toolResult',
  timestamp: timestamp + 200,
  toolCallId: 'toolu_read',
  toolName: 'read',
  isError: false,
  content: [
    {
      type: 'text',
      text: 'export function reduceAiEvent'
    }
  ],
  details: {
    bytes: 1024
  }
};

describe('AI workbench reducer', () => {
  test('tracks streaming assistant messages and finalizes them', () => {
    let snapshot = createInitialSnapshot();

    snapshot = reduceAiEvent(snapshot, {
      type: 'agent_start',
      timestamp
    });
    snapshot = reduceAiEvent(snapshot, {
      type: 'message_update',
      timestamp: timestamp + 100,
      assistantMessageEvent: {
        type: 'text_delta',
        contentIndex: 0,
        delta: 'Reading',
        partial: assistant
      }
    });

    expect(snapshot.run.phase).toBe('streaming_message');
    expect(snapshot.streamingMessage?.content).toHaveLength(2);

    snapshot = reduceAiEvent(snapshot, {
      type: 'message_end',
      timestamp: timestamp + 150,
      message: assistant
    });

    expect(snapshot.streamingMessage).toBeUndefined();
    expect(snapshot.messages).toContainEqual(assistant);
  });

  test('tracks tool execution lifecycle', () => {
    let snapshot = createInitialSnapshot();

    snapshot = reduceAiEvent(snapshot, {
      type: 'tool_execution_start',
      toolCallId: 'toolu_read',
      toolName: 'read',
      args: { path: 'src/lib/components/ai/state.ts' },
      timestamp
    });

    expect(snapshot.run.phase).toBe('executing_tools');
    expect(snapshot.run.activeToolCallIds).toEqual(['toolu_read']);

    snapshot = reduceAiEvent(snapshot, {
      type: 'tool_execution_end',
      toolCallId: 'toolu_read',
      toolName: 'read',
      result: { bytes: 1024 },
      isError: false,
      timestamp: timestamp + 100
    });
    snapshot = reduceAiEvent(snapshot, {
      type: 'message_end',
      message: toolResult,
      timestamp: timestamp + 200
    });

    expect(snapshot.run.activeToolCallIds).toEqual([]);
    expect(snapshot.toolExecutions[0]).toMatchObject({
      toolCallId: 'toolu_read',
      status: 'completed'
    });
    expect(snapshot.messages).toContainEqual(toolResult);
  });

  test('updates queue and retry states', () => {
    let snapshot = createInitialSnapshot();

    snapshot = reduceAiEvent(snapshot, {
      type: 'queue_update',
      steering: ['Keep the API thin.'],
      followUp: ['Render tool details next.'],
      nextTurn: ['Compact after this turn.']
    });
    snapshot = reduceAiEvent(snapshot, {
      type: 'auto_retry_start',
      attempt: 1,
      maxAttempts: 3,
      delayMs: 1200,
      errorMessage: 'Provider returned 429.'
    });

    expect(snapshot.queue).toEqual({
      steering: ['Keep the API thin.'],
      followUp: ['Render tool details next.'],
      nextTurn: ['Compact after this turn.']
    });
    expect(snapshot.run).toMatchObject({
      phase: 'retrying',
      retry: {
        attempt: 1,
        maxAttempts: 3,
        delayMs: 1200
      }
    });
  });

  test('records terminal errors', () => {
    const snapshot = reduceAiEvent(createInitialSnapshot(), {
      type: 'error',
      message: 'Fixture transport disconnected.'
    });

    expect(snapshot.run.phase).toBe('error');
    expect(snapshot.error?.message).toBe('Fixture transport disconnected.');
  });
});
