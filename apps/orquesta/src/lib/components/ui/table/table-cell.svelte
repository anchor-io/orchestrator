<script lang="ts">
  import { cn, type WithElementRef } from '../../../utils.js';
  import type { HTMLTdAttributes } from 'svelte/elements';

  let {
    ref = $bindable(null),
    class: className,
    children,
    ...restProps
  }: WithElementRef<HTMLTdAttributes> = $props();
</script>

<td
  bind:this={ref}
  data-slot="table-cell"
  class={cn(
    'border-r border-border px-3 py-2.5 align-middle whitespace-nowrap text-muted-foreground last:border-r-0 [&:has([role=checkbox])]:pr-0',
    className
  )}
  {...restProps}
>
  {@render children?.()}
</td>
