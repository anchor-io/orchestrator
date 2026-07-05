import type { AiAssistantContent, AiMessage, AiRunPhase, AiToolResultContent } from './types.js';

export function formatJson(value: unknown) {
  if (value === undefined) return '';
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export function getMessageKey(message: AiMessage, index: number) {
  if (message.id) return message.id;
  if (message.role === 'toolResult')
    return `${message.role}-${message.toolCallId}-${message.timestamp}`;
  return `${message.role}-${message.timestamp}-${index}`;
}

export function isVisibleAssistantContent(content: AiAssistantContent) {
  switch (content.type) {
    case 'text':
      return content.text.trim().length > 0;
    case 'thinking':
      return content.redacted || content.thinking.trim().length > 0;
    case 'toolCall':
      return content.name.trim().length > 0;
  }

  return false;
}

export function isVisibleToolResultContent(content: AiToolResultContent) {
  return content.type === 'image' || content.text.trim().length > 0;
}

export function formatToolArguments(args: Record<string, unknown>) {
  const entries = Object.entries(args);
  if (entries.length === 0) return '';

  const primitivesOnly = entries.every(([, value]) => isPrimitiveValue(value));
  if (primitivesOnly) {
    return entries.map(([key, value]) => `${key}: ${formatPrimitiveValue(value)}`).join(' | ');
  }

  const json = formatJson(args).replace(/\s+/g, ' ');
  return json.length > 180 ? `${json.slice(0, 177)}...` : json;
}

function isPrimitiveValue(value: unknown) {
  return value === null || ['string', 'number', 'boolean'].includes(typeof value);
}

function formatPrimitiveValue(value: unknown) {
  if (typeof value === 'string') return value;
  if (value === null) return 'null';
  return String(value);
}

export function getRunPhaseLabel(phase: AiRunPhase) {
  switch (phase) {
    case 'idle':
      return 'Idle';
    case 'running_agent':
      return 'Agent running';
    case 'running_turn':
      return 'Turn running';
    case 'streaming_message':
      return 'Streaming';
    case 'executing_tools':
      return 'Tools running';
    case 'compacting':
      return 'Compacting';
    case 'retrying':
      return 'Retrying';
    case 'aborted':
      return 'Aborted';
    case 'error':
      return 'Error';
    case 'settled':
      return 'Settled';
  }
}

export function getRunPhaseTone(phase: AiRunPhase) {
  if (phase === 'error' || phase === 'aborted') return 'destructive';
  if (phase === 'idle' || phase === 'settled') return 'muted';
  return 'active';
}
