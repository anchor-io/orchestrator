<script lang="ts">
  import { cn, type WithElementRef, type WithoutChildren } from '../../../utils.js';
  import type { HTMLTextareaAttributes } from 'svelte/elements';

  let {
    ref = $bindable(null),
    value = $bindable(),
    class: className,
    'data-slot': dataSlot = 'textarea',
    ...restProps
  }: WithoutChildren<WithElementRef<HTMLTextareaAttributes>> = $props();
</script>

<textarea
  bind:this={ref}
  data-slot={dataSlot}
  class={cn(
    'border-border bg-muted text-foreground placeholder:text-muted-foreground/50 focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/25 aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 resize-none rounded-none border px-3 py-2.5 text-base transition-[color,border-color,box-shadow] md:text-sm flex field-sizing-content min-h-20 w-full outline-none disabled:cursor-not-allowed disabled:opacity-50',
    className
  )}
  bind:value
  {...restProps}></textarea>
