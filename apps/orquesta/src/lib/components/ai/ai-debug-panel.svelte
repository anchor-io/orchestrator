<script lang="ts">
  import CodeIcon from 'phosphor-svelte/lib/CodeIcon';
  import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
  import { cn } from '$lib/utils.js';
  import { formatJson } from './format.js';
  import type { AiWorkbenchSnapshot } from './types.js';

  // Right-rail raw state viewer for adapter development.
  interface Props {
    /** Full snapshot to inspect as events, state, messages, or tool executions. */
    snapshot: AiWorkbenchSnapshot;
    /** Optional class for rail placement. */
    class?: string;
  }

  let { snapshot, class: className }: Props = $props();
  let tab = $state('events');

  const tabs = [
    { value: 'events', label: 'Events' },
    { value: 'state', label: 'State' },
    { value: 'messages', label: 'Messages' },
    { value: 'tools', label: 'Tools' }
  ];

  const payload = $derived.by(() => {
    if (tab === 'state') {
      return {
        run: snapshot.run,
        queue: snapshot.queue,
        model: snapshot.model,
        thinkingLevel: snapshot.thinkingLevel,
        activeToolNames: snapshot.activeToolNames,
        session: snapshot.session,
        error: snapshot.error
      };
    }

    if (tab === 'messages') return snapshot.messages;
    if (tab === 'tools') return snapshot.toolExecutions;
    return snapshot.events;
  });
</script>

<section data-slot="ai-debug-panel" class={cn('grid min-h-0 gap-2', className)}>
  <div class="flex items-center gap-2">
    <CodeIcon class="size-3.5 text-muted-foreground" />
    <h2 class="text-xs font-medium text-muted-foreground">Debug</h2>
  </div>
  <div class="flex min-w-0 gap-3 border-b border-border/70">
    {#each tabs as item (item.value)}
      <button
        type="button"
        class={cn(
          'border-b border-transparent pb-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground',
          tab === item.value && 'border-primary text-foreground'
        )}
        onclick={() => (tab = item.value)}
      >
        {item.label}
      </button>
    {/each}
  </div>
  <ScrollArea class="h-72">
    <pre class="py-2 font-mono text-[10px] leading-relaxed text-muted-foreground">{formatJson(
        payload
      )}</pre>
  </ScrollArea>
</section>
