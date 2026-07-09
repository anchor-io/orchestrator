<script lang="ts">
  import { cn, type WithElementRef } from '../../../utils.js';
  import type { HTMLAttributes } from 'svelte/elements';

  let {
    ref = $bindable(null),
    class: className,
    children,
    ...restProps
  }: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();
</script>

<div
  bind:this={ref}
  data-slot="empty-description"
  class={cn(
    'mt-0.5 text-sm/relaxed text-muted-foreground/50 [&>a]:text-link [&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-link',
    className
  )}
  {...restProps}
>
  {@render children?.()}
</div>
