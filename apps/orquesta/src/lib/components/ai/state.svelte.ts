import { createInitialSnapshot, reduceAiEvent } from './state.js';
import type { AiEvent, AiScenario, AiWorkbenchActions, AiWorkbenchSnapshot } from './types.js';

export class AiWorkbenchController {
  snapshot = $state<AiWorkbenchSnapshot>(createInitialSnapshot());
  scenarioId = $state<string | undefined>();
  lastCommand = $state<string | undefined>();

  constructor(snapshot?: AiWorkbenchSnapshot) {
    if (snapshot) {
      this.snapshot = snapshot;
    }
  }

  reset = (snapshot: AiWorkbenchSnapshot, scenarioId?: string) => {
    this.snapshot = snapshot;
    this.scenarioId = scenarioId;
    this.lastCommand = undefined;
  };

  setScenario = (scenario: AiScenario) => {
    this.reset(scenario.snapshot, scenario.id);
  };

  ingest = (event: AiEvent) => {
    this.snapshot = reduceAiEvent(this.snapshot, event);
  };

  actions = (): AiWorkbenchActions => ({
    prompt: (text) => {
      this.lastCommand = `prompt:${text}`;
      this.ingest({
        type: 'message_start',
        message: {
          role: 'user',
          content: text,
          timestamp: Date.now()
        }
      });
      this.ingest({
        type: 'queue_update',
        steering: this.snapshot.queue.steering,
        followUp: this.snapshot.queue.followUp
      });
    },
    steer: (text) => {
      this.lastCommand = `steer:${text}`;
      this.ingest({
        type: 'queue_update',
        steering: [...this.snapshot.queue.steering, text],
        followUp: this.snapshot.queue.followUp
      });
    },
    followUp: (text) => {
      this.lastCommand = `followUp:${text}`;
      this.ingest({
        type: 'queue_update',
        steering: this.snapshot.queue.steering,
        followUp: [...this.snapshot.queue.followUp, text]
      });
    },
    abort: () => {
      this.lastCommand = 'abort';
      this.ingest({ type: 'abort' });
    },
    clearQueue: () => {
      this.lastCommand = 'clearQueue';
      this.ingest({ type: 'queue_update', steering: [], followUp: [], nextTurn: [] });
    },
    setModel: (modelId) => {
      this.lastCommand = `model:${modelId}`;
      this.snapshot = {
        ...this.snapshot,
        model: this.snapshot.models.find((model) => model.id === modelId) ?? this.snapshot.model
      };
    },
    setThinkingLevel: (level) => {
      this.lastCommand = `thinking:${level}`;
      this.ingest({ type: 'thinking_level_changed', level });
    },
    setActiveTools: (toolNames) => {
      this.lastCommand = `tools:${toolNames.join(',')}`;
      this.snapshot = {
        ...this.snapshot,
        activeToolNames: toolNames
      };
    },
    compact: (instructions) => {
      this.lastCommand = instructions ? `compact:${instructions}` : 'compact';
      this.ingest({ type: 'compaction_start', reason: 'manual' });
      this.ingest({ type: 'compaction_end', reason: 'manual', aborted: false, willRetry: false });
    }
  });
}
