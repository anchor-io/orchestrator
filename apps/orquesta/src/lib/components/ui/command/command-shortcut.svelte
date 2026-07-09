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
  data-slot="command-shortcut"
  class={cn(
    'ml-auto  text-[11px]   text-muted-foreground/50 group-data-selected/command-item:text-link',
    className
  )}
  {...restProps}
>
  {@render children?.()}
</span>
