<script lang="ts">
  import CircleNotchIcon from 'phosphor-svelte/lib/CircleNotchIcon';
  import { cn } from '$lib/utils.js';
  import { getRunPhaseLabel, getRunPhaseTone } from './format.js';
  import type { AiQueueState, AiRunState } from './types.js';

  // Compact transient status strip for active runs only.
  interface Props {
    /** Current run phase and retry/tool activity. */
    run: AiRunState;
    /** Queued steering and follow-up counts to surface while active. */
    queue: AiQueueState;
    /** Optional class for shell placement. */
    class?: string;
  }

  let { run, queue, class: className }: Props = $props();

  const tone = $derived(getRunPhaseTone(run.phase));
  const queuedCount = $derived(
    queue.steering.length + queue.followUp.length + queue.nextTurn.length
  );
  const hasStatus = $derived(
    (run.phase !== 'idle' && run.phase !== 'settled') ||
      queuedCount > 0 ||
      run.activeToolCallIds.length > 0 ||
      Boolean(run.retry) ||
      Boolean(run.message)
  );
  const label = $derived(
    queuedCount > 0 && (run.phase === 'idle' || run.phase === 'settled')
      ? 'Queued'
      : getRunPhaseLabel(run.phase)
  );
</script>

{#if hasStatus}
  <section
    data-slot="ai-run-status"
    class={cn('flex min-w-0 flex-wrap items-center gap-2 text-xs', className)}
  >
    <span
      class={cn(
        'inline-flex items-center gap-1.5 font-medium',
        tone === 'destructive' && 'text-destructive',
        tone === 'muted' && 'text-muted-foreground',
        tone !== 'destructive' && tone !== 'muted' && 'text-primary'
      )}
    >
      {#if run.isStreaming}
        <CircleNotchIcon class="size-3 animate-spin" />
      {:else}
        <span class="size-1.5 bg-current"></span>
      {/if}
      {label}
    </span>
    {#if queuedCount > 0}
      <span class="font-mono text-[10px] text-muted-foreground">{queuedCount} queued</span>
    {/if}
    {#if run.activeToolCallIds.length > 0}
      <span class="font-mono text-[10px] text-muted-foreground">
        {run.activeToolCallIds.length} active tool{run.activeToolCallIds.length === 1 ? '' : 's'}
      </span>
    {/if}
    {#if run.retry}
      <span class="font-mono text-[10px] text-muted-foreground">
        retry {run.retry.attempt}{run.retry.maxAttempts ? `/${run.retry.maxAttempts}` : ''}
      </span>
    {/if}
    {#if run.message}
      <span class="min-w-0 flex-1 truncate text-muted-foreground">{run.message}</span>
    {/if}
  </section>
{/if}
