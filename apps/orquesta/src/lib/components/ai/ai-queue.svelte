<script lang="ts">
  import ListChecksIcon from 'phosphor-svelte/lib/ListChecksIcon';
  import { Button } from '$lib/components/ui/button/index.js';
  import { cn } from '$lib/utils.js';
  import type { AiQueueState, AiWorkbenchActions } from './types.js';

  // Lists pending steering, follow-up, and next-turn text.
  interface Props {
    /** Queue buckets mirrored from the wrapper state. */
    queue: AiQueueState;
    /** Optional clearQueue callback. */
    actions?: AiWorkbenchActions;
    /** Optional class for rail placement. */
    class?: string;
  }

  let { queue, actions, class: className }: Props = $props();

  const rows = $derived([
    ...queue.steering.map((text, index) => ({ id: `steer-${index}`, type: 'steer', text })),
    ...queue.followUp.map((text, index) => ({ id: `follow-up-${index}`, type: 'follow-up', text })),
    ...queue.nextTurn.map((text, index) => ({ id: `next-turn-${index}`, type: 'next-turn', text }))
  ]);
</script>

<section data-slot="ai-queue" class={cn('grid gap-2', className)}>
  <div class="flex items-center justify-between gap-2">
    <h2 class="text-xs font-medium text-muted-foreground">Queue</h2>
    {#if rows.length > 0 && actions?.clearQueue}
      <Button variant="ghost" size="xs" onclick={() => actions?.clearQueue?.()}>Clear</Button>
    {/if}
  </div>
  {#if rows.length === 0}
    <div class="flex items-center gap-2 py-1 text-xs text-muted-foreground">
      <ListChecksIcon class="size-3.5" />
      <span>No queued messages</span>
    </div>
  {:else}
    <div class="grid border-t border-border/70">
      {#each rows as row (row.id)}
        <div class="grid gap-1 border-b border-border/70 py-2">
          <span class="text-[10px] font-medium text-muted-foreground">{row.type}</span>
          <p class="line-clamp-3 text-xs/relaxed text-foreground">{row.text}</p>
        </div>
      {/each}
    </div>
  {/if}
</section>
