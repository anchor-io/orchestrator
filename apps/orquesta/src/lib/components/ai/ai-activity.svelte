<script lang="ts">
  import BrainIcon from 'phosphor-svelte/lib/BrainIcon';
  import CaretRightIcon from 'phosphor-svelte/lib/CaretRightIcon';
  import CheckCircleIcon from 'phosphor-svelte/lib/CheckCircleIcon';
  import FunctionIcon from 'phosphor-svelte/lib/FunctionIcon';
  import WarningCircleIcon from 'phosphor-svelte/lib/WarningCircleIcon';
  import type { Snippet } from 'svelte';
  import * as Collapsible from '$lib/components/ui/collapsible/index.js';
  import { cn } from '$lib/utils.js';

  type ActivityVariant = 'reasoning' | 'tool-call' | 'tool-result' | 'tool-error';

  // Shared disclosure row for reasoning, tool calls, and tool results.
  interface Props {
    /** Activity category; controls only the small muted icon. */
    variant: ActivityVariant;
    /** Primary row text, e.g. "Reasoning" or "Tool result". */
    label: string;
    /** Optional secondary row text such as a tool name. */
    meta?: string;
    /** Slot name for targeted tests and styling hooks. */
    dataSlot?: string;
    /** Opens details initially for important states like tool errors. */
    defaultOpen?: boolean;
    /** Optional detail body rendered inside the dropdown. */
    detail?: Snippet;
    /** Optional root class for transcript layout. */
    class?: string;
  }

  let {
    variant,
    label,
    meta,
    dataSlot = 'ai-activity',
    defaultOpen = false,
    detail,
    class: className
  }: Props = $props();

  let open = $derived(defaultOpen);
  const hasDetail = $derived(Boolean(detail));
</script>

{#snippet icon()}
  {#if variant === 'reasoning'}
    <BrainIcon class="size-3 shrink-0 opacity-70" />
  {:else if variant === 'tool-call'}
    <FunctionIcon class="size-3 shrink-0 opacity-70" />
  {:else if variant === 'tool-error'}
    <WarningCircleIcon class="size-3 shrink-0 opacity-80" />
  {:else}
    <CheckCircleIcon class="size-3 shrink-0 opacity-70" />
  {/if}
{/snippet}

{#snippet summary()}
  <span
    class={cn(
      'inline-flex min-w-0 items-center gap-1.5 text-sm leading-6',
      variant === 'tool-error' ? 'text-destructive/80' : 'text-muted-foreground/75'
    )}
  >
    {@render icon()}
    <span class="shrink-0">{label}</span>
    {#if meta}
      <span class="truncate text-muted-foreground/55">{meta}</span>
    {/if}
  </span>
{/snippet}

<div data-slot={dataSlot} class={cn('text-sm', className)}>
  {#if hasDetail}
    <Collapsible.Root bind:open class="border-0 bg-transparent text-sm">
      <Collapsible.Trigger
        class="group inline-flex h-6 w-fit justify-start gap-1 border-b-0 bg-transparent px-0 py-0 text-sm font-normal text-muted-foreground/75 hover:bg-transparent hover:text-muted-foreground focus-visible:ring-0"
      >
        <CaretRightIcon
          class={cn(
            'size-3 shrink-0 text-muted-foreground/45 transition-transform',
            open && 'rotate-90'
          )}
        />
        {@render summary()}
      </Collapsible.Trigger>
      <Collapsible.Content class="border-0 bg-transparent px-0 py-0 text-sm">
        <div class="ml-5 mt-0.5 max-w-3xl text-sm/relaxed text-muted-foreground/75">
          {@render detail?.()}
        </div>
      </Collapsible.Content>
    </Collapsible.Root>
  {:else}
    <div class="inline-flex h-6 items-center gap-1 pl-4">
      {@render summary()}
    </div>
  {/if}
</div>
