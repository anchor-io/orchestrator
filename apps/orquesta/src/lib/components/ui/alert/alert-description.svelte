<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  import { cn, type WithElementRef } from '../../../utils.js';

  let {
    ref = $bindable(null),
    class: className,
    children,
    ...restProps
  }: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();
</script>

<div
  bind:this={ref}
  data-slot="alert-description"
  class={cn(
    'text-muted-foreground text-xs/relaxed text-balance md:text-pretty [&_p:not(:last-child)]:mb-2 [&_a]:text-link [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground',
    className
  )}
  {...restProps}
>
  {@render children?.()}
</div>
