<script lang="ts">
  import { cn, type WithElementRef } from '../../../utils.js';
  import type { HTMLAttributes } from 'svelte/elements';

  let {
    ref = $bindable(null),
    class: className,
    children,
    ...restProps
  }: WithElementRef<HTMLAttributes<HTMLSpanElement>> = $props();
</script>

<span
  bind:this={ref}
  data-slot="input-group-text"
  class={cn(
    "gap-2  text-xs font-medium  text-muted-foreground/50  [&_svg:not([class*='size-'])]:size-3.5 flex items-center [&_svg]:pointer-events-none",
    className
  )}
  {...restProps}
>
  {@render children?.()}
</span>
