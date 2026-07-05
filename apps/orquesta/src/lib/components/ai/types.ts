export type AiThinkingLevel = 'off' | 'minimal' | 'low' | 'medium' | 'high' | 'xhigh';

export type AiTextContent = {
  type: 'text';
  text: string;
  textSignature?: string;
};

export type AiThinkingContent = {
  type: 'thinking';
  thinking: string;
  thinkingSignature?: string;
  redacted?: boolean;
};

export type AiImageContent = {
  type: 'image';
  data: string;
  mimeType: string;
  alt?: string;
};

export type AiToolCallContent = {
  type: 'toolCall';
  id: string;
  name: string;
  arguments: Record<string, unknown>;
  thoughtSignature?: string;
};

export type AiAssistantContent = AiTextContent | AiThinkingContent | AiToolCallContent;
export type AiUserContent = string | (AiTextContent | AiImageContent)[];
export type AiToolResultContent = AiTextContent | AiImageContent;

export type AiUsage = {
  input: number;
  output: number;
  cacheRead: number;
  cacheWrite: number;
  reasoning?: number;
  totalTokens: number;
  cost: {
    input: number;
    output: number;
    cacheRead: number;
    cacheWrite: number;
    total: number;
  };
};

export type AiStopReason = 'stop' | 'length' | 'toolUse' | 'error' | 'aborted';

export type AiMessageBase = {
  id?: string;
  timestamp: number;
};

export type AiUserMessage = AiMessageBase & {
  role: 'user';
  content: AiUserContent;
};

export type AiAssistantMessage = AiMessageBase & {
  role: 'assistant';
  content: AiAssistantContent[];
  api?: string;
  provider?: string;
  model?: string;
  responseModel?: string;
  responseId?: string;
  usage?: AiUsage;
  stopReason?: AiStopReason;
  errorMessage?: string;
};

export type AiToolResultMessage<TDetails = unknown> = AiMessageBase & {
  role: 'toolResult';
  toolCallId: string;
  toolName: string;
  content: AiToolResultContent[];
  details?: TDetails;
  isError: boolean;
};

export type AiCustomMessage<TDetails = unknown> = AiMessageBase & {
  role: 'custom';
  customType: string;
  content: string | (AiTextContent | AiImageContent)[];
  display: boolean;
  details?: TDetails;
};

export type AiBashExecutionMessage = AiMessageBase & {
  role: 'bashExecution';
  command: string;
  output: string;
  exitCode: number | undefined;
  cancelled: boolean;
  truncated: boolean;
  fullOutputPath?: string;
  excludeFromContext?: boolean;
};

export type AiBranchSummaryMessage = AiMessageBase & {
  role: 'branchSummary';
  summary: string;
  fromId: string;
};

export type AiCompactionSummaryMessage = AiMessageBase & {
  role: 'compactionSummary';
  summary: string;
  tokensBefore: number;
};

export type AiMessage =
  | AiUserMessage
  | AiAssistantMessage
  | AiToolResultMessage
  | AiCustomMessage
  | AiBashExecutionMessage
  | AiBranchSummaryMessage
  | AiCompactionSummaryMessage;

export type AiAssistantMessageEvent =
  | { type: 'start'; partial: AiAssistantMessage }
  | { type: 'text_start'; contentIndex: number; partial: AiAssistantMessage }
  | { type: 'text_delta'; contentIndex: number; delta: string; partial: AiAssistantMessage }
  | { type: 'text_end'; contentIndex: number; content: string; partial: AiAssistantMessage }
  | { type: 'thinking_start'; contentIndex: number; partial: AiAssistantMessage }
  | { type: 'thinking_delta'; contentIndex: number; delta: string; partial: AiAssistantMessage }
  | { type: 'thinking_end'; contentIndex: number; content: string; partial: AiAssistantMessage }
  | { type: 'toolcall_start'; contentIndex: number; partial: AiAssistantMessage }
  | { type: 'toolcall_delta'; contentIndex: number; delta: string; partial: AiAssistantMessage }
  | {
      type: 'toolcall_end';
      contentIndex: number;
      toolCall: AiToolCallContent;
      partial: AiAssistantMessage;
    }
  | {
      type: 'done';
      reason: Extract<AiStopReason, 'stop' | 'length' | 'toolUse'>;
      message: AiAssistantMessage;
    }
  | {
      type: 'error';
      reason: Extract<AiStopReason, 'aborted' | 'error'>;
      error: AiAssistantMessage;
    };

export type AiToolExecution = {
  toolCallId: string;
  toolName: string;
  args?: unknown;
  partialResult?: unknown;
  result?: unknown;
  isError?: boolean;
  status: 'pending' | 'running' | 'completed' | 'error';
  updatedAt: number;
};

export type AiEvent =
  | { type: 'agent_start'; timestamp?: number }
  | { type: 'agent_end'; messages?: AiMessage[]; willRetry?: boolean; timestamp?: number }
  | { type: 'turn_start'; timestamp?: number }
  | {
      type: 'turn_end';
      message?: AiMessage;
      toolResults?: AiToolResultMessage[];
      timestamp?: number;
    }
  | { type: 'message_start'; message: AiMessage; timestamp?: number }
  | {
      type: 'message_update';
      message?: AiAssistantMessage;
      assistantMessageEvent: AiAssistantMessageEvent;
      timestamp?: number;
    }
  | { type: 'message_end'; message: AiMessage; timestamp?: number }
  | {
      type: 'tool_execution_start';
      toolCallId: string;
      toolName: string;
      args?: unknown;
      timestamp?: number;
    }
  | {
      type: 'tool_execution_update';
      toolCallId: string;
      toolName: string;
      args?: unknown;
      partialResult?: unknown;
      timestamp?: number;
    }
  | {
      type: 'tool_execution_end';
      toolCallId: string;
      toolName: string;
      result?: unknown;
      isError: boolean;
      timestamp?: number;
    }
  | {
      type: 'queue_update';
      steering: readonly string[];
      followUp: readonly string[];
      nextTurn?: readonly string[];
      timestamp?: number;
    }
  | { type: 'compaction_start'; reason: 'manual' | 'threshold' | 'overflow'; timestamp?: number }
  | {
      type: 'compaction_end';
      reason: 'manual' | 'threshold' | 'overflow';
      aborted: boolean;
      willRetry: boolean;
      errorMessage?: string;
      timestamp?: number;
    }
  | { type: 'thinking_level_changed'; level: AiThinkingLevel; timestamp?: number }
  | { type: 'session_info_changed'; name?: string; timestamp?: number }
  | {
      type: 'auto_retry_start';
      attempt: number;
      maxAttempts: number;
      delayMs: number;
      errorMessage: string;
      timestamp?: number;
    }
  | {
      type: 'auto_retry_end';
      success: boolean;
      attempt: number;
      finalError?: string;
      timestamp?: number;
    }
  | { type: 'abort'; timestamp?: number }
  | { type: 'settled'; timestamp?: number }
  | { type: 'error'; message: string; timestamp?: number; cause?: unknown };

export type AiQueuedEvent = AiEvent & {
  id: string;
  receivedAt: number;
};

export type AiRunPhase =
  | 'idle'
  | 'running_agent'
  | 'running_turn'
  | 'streaming_message'
  | 'executing_tools'
  | 'compacting'
  | 'retrying'
  | 'aborted'
  | 'error'
  | 'settled';

export type AiRunState = {
  phase: AiRunPhase;
  isStreaming: boolean;
  activeToolCallIds: string[];
  message?: string;
  retry?: {
    attempt: number;
    maxAttempts?: number;
    delayMs?: number;
  };
};

export type AiQueueState = {
  steering: string[];
  followUp: string[];
  nextTurn: string[];
};

export type AiModel = {
  /** Stable id sent back through setModel. */
  id: string;
  /** Human-readable label for selectors. */
  name?: string;
  /** Optional provider label for debugging and menus. */
  provider?: string;
  /** Optional context size metadata; not required for rendering. */
  contextWindow?: number;
  /** Whether this model supports effort/thinking controls. */
  supportsThinking?: boolean;
};

export type AiTool = {
  /** Stable tool name used by events and activeToolNames. */
  name: string;
  /** Short description shown in the tool checklist. */
  description?: string;
  /** Raw schema or provider-specific parameters for debug panels. */
  parameters?: unknown;
  promptGuidelines?: string[];
  sourceInfo?: unknown;
};

export type AiSessionInfo = {
  id?: string;
  file?: string;
  name?: string;
  cwd?: string;
};

export type AiWorkbenchSession = {
  /** Stable id passed to onSelectSession. */
  id: string;
  /** Label shown in the left session rail. */
  name: string;
  /** Optional visual status; idle is intentionally quiet in the UI. */
  status?: 'idle' | 'running' | 'error' | 'settled';
};

export type AiError = {
  message: string;
  cause?: unknown;
};

export type AiWorkbenchSnapshot = {
  /** Completed messages in transcript order. */
  messages: AiMessage[];
  /** Assistant message currently streaming, if any. */
  streamingMessage?: AiAssistantMessage;
  /** Capped raw event log for adapter debugging. */
  events: AiQueuedEvent[];
  /** Current run phase and active retry/tool state. */
  run: AiRunState;
  /** Pending steering and follow-up text. */
  queue: AiQueueState;
  /** Selected model for the composer control row. */
  model?: AiModel;
  /** Model choices available to the wrapper. */
  models: AiModel[];
  /** Current reasoning/effort level. */
  thinkingLevel?: AiThinkingLevel;
  /** Effort levels available to the wrapper. */
  thinkingLevels: AiThinkingLevel[];
  /** Tool definitions shown in the right rail. */
  tools: AiTool[];
  /** Names of enabled tools. */
  activeToolNames: string[];
  /** Raw tool lifecycle state for debugging. */
  toolExecutions: AiToolExecution[];
  /** Optional current session metadata. */
  session?: AiSessionInfo;
  /** Terminal or latest adapter error. */
  error?: AiError;
};

export type AiWorkbenchActions = {
  /** Start a new user turn. */
  prompt?: (text: string) => Promise<void> | void;
  /** Send guidance into an active run. */
  steer?: (text: string) => Promise<void> | void;
  /** Queue text for after the active run. */
  followUp?: (text: string) => Promise<void> | void;
  /** Cancel the active run. */
  abort?: () => Promise<void> | void;
  /** Clear queued steering and follow-up text. */
  clearQueue?: () => Promise<void> | void;
  /** Switch the selected model. */
  setModel?: (modelId: string) => Promise<void> | void;
  /** Switch the reasoning/effort setting. */
  setThinkingLevel?: (level: AiThinkingLevel) => Promise<void> | void;
  /** Replace the enabled tool set. */
  setActiveTools?: (toolNames: string[]) => Promise<void> | void;
  /** Ask the wrapper to compact context. */
  compact?: (instructions?: string) => Promise<void> | void;
};

export type AiScenario = {
  id: string;
  label: string;
  snapshot: AiWorkbenchSnapshot;
};
