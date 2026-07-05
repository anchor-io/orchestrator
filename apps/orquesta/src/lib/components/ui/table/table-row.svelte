<script lang="ts">
  import { cn, type WithElementRef } from '../../../utils.js';
  import type { HTMLAttributes } from 'svelte/elements';

  let {
    ref = $bindable(null),
    class: className,
    children,
    ...restProps
  }: WithElementRef<HTMLAttributes<HTMLTableRowElement>> = $props();
</script>

<tr
  bind:this={ref}
  data-slot="table-row"
  class={cn(
    'border-b border-border transition-colors hover:bg-accent data-[state=selected]:bg-primary-wash',
    className
  )}
  {...restProps}
>
  {@render children?.()}
</tr>
