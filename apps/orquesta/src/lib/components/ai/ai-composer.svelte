<script lang="ts">
  import PaperPlaneTiltIcon from 'phosphor-svelte/lib/PaperPlaneTiltIcon';
  import StopCircleIcon from 'phosphor-svelte/lib/StopCircleIcon';
  import { Button } from '$lib/components/ui/button/index.js';
  import { Textarea } from '$lib/components/ui/textarea/index.js';
  import { cn } from '$lib/utils.js';
  import AiModelControls from './ai-model-controls.svelte';
  import AiRunStatus from './ai-run-status.svelte';
  import type {
    AiModel,
    AiQueueState,
    AiRunState,
    AiThinkingLevel,
    AiWorkbenchActions
  } from './types.js';

  // Prompt surface for starting, steering, or queueing agent work.
  interface Props {
    /** Current run state; controls prompt mode and abort visibility. */
    run: AiRunState;
    /** Current queue state, shown as transient status above the prompt. */
    queue: AiQueueState;
    /** Current model shown beside the prompt. */
    model?: AiModel;
    /** Model choices exposed by the wrapper. */
    models: AiModel[];
    /** Current reasoning/effort setting. */
    thinkingLevel?: AiThinkingLevel;
    /** Effort choices exposed by the wrapper. */
    thinkingLevels: AiThinkingLevel[];
    /** Command callbacks for prompt, steering, follow-up, abort, and settings. */
    actions?: AiWorkbenchActions;
    /** Optional shell class for layout integration. */
    class?: string;
  }

  let {
    run,
    queue,
    model,
    models,
    thinkingLevel,
    thinkingLevels,
    actions,
    class: className
  }: Props = $props();

  let text = $state('');
  const busy = $derived(
    run.isStreaming ||
      run.phase === 'running_agent' ||
      run.phase === 'running_turn' ||
      run.phase === 'streaming_message' ||
      run.phase === 'executing_tools' ||
      run.phase === 'compacting' ||
      run.phase === 'retrying'
  );
  const trimmedText = $derived(text.trim());
  const hasText = $derived(trimmedText.length > 0);
  const submitLabel = $derived(busy ? (hasText ? 'Queue' : 'Stop') : 'Send');
  const canSubmit = $derived(
    busy
      ? hasText
        ? Boolean(actions?.followUp)
        : Boolean(actions?.abort)
      : hasText && Boolean(actions?.prompt)
  );

  async function submit() {
    if (busy) {
      if (hasText) {
        if (!actions?.followUp) return;
        await actions.followUp(trimmedText);
        text = '';
      } else {
        await actions?.abort?.();
      }
      return;
    }

    if (!hasText || !actions?.prompt) return;
    await actions.prompt(trimmedText);
    text = '';
  }

  async function steer() {
    if (!busy || !hasText || !actions?.steer) return;
    await actions.steer(trimmedText);
    text = '';
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && event.ctrlKey) {
      event.preventDefault();
      void steer();
    }
  }
</script>

<form
  data-slot="ai-composer"
  class={cn('bg-background px-4 py-3', className)}
  onsubmit={(event) => {
    event.preventDefault();
    void submit();
  }}
>
  <div class="mx-auto grid w-full max-w-5xl gap-2">
    <AiRunStatus class="pb-1" {run} {queue} />
    <Textarea
      bind:value={text}
      class="rounded-none border-border/80 bg-muted/20 text-sm"
      style="field-sizing: fixed; height: 4.5rem; min-height: 4.5rem; max-height: 8rem;"
      placeholder={busy ? 'Queue follow-up' : 'Ask the agent'}
      onkeydown={handleKeydown}
    />
    <div class="flex min-w-0 flex-wrap items-center justify-end gap-2">
      <div class="ml-auto flex min-w-0 flex-wrap items-center justify-end gap-2">
        <AiModelControls
          class="min-w-0"
          {model}
          {models}
          {thinkingLevel}
          {thinkingLevels}
          {actions}
        />
        <Button
          type="submit"
          size="sm"
          variant={busy && !hasText ? 'destructive' : 'default'}
          class="rounded"
          disabled={!canSubmit}
        >
          {#if busy && !hasText}
            <StopCircleIcon data-icon="inline-start" />
          {:else}
            <PaperPlaneTiltIcon data-icon="inline-start" />
          {/if}
          {submitLabel}
        </Button>
      </div>
    </div>
  </div>
</form>
