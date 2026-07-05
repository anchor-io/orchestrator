<script lang="ts">
  import { cn, type WithElementRef } from '../../../utils.js';
  import type { HTMLAttributes } from 'svelte/elements';

  let {
    ref = $bindable(null),
    class: className,
    children,
    ...restProps
  }: WithElementRef<HTMLAttributes<HTMLDivElement>> & {} = $props();
</script>

<div
  bind:this={ref}
  data-slot="select-label"
  class={cn(
    'border-b border-border px-3 py-2  text-xs font-medium  text-muted-foreground/50 ',
    className
  )}
  {...restProps}
>
  {@render children?.()}
</div>
