<script lang="ts">
  import { Select as SelectPrimitive } from 'bits-ui';
  import { cn, type WithoutChildrenOrChild } from '../../../utils.js';
  import CaretUpIcon from 'phosphor-svelte/lib/CaretUpIcon';

  let {
    ref = $bindable(null),
    class: className,
    ...restProps
  }: WithoutChildrenOrChild<SelectPrimitive.ScrollUpButtonProps> = $props();
</script>

<SelectPrimitive.ScrollUpButton
  bind:ref
  data-slot="select-scroll-up-button"
  class={cn(
    "bg-muted text-muted-foreground/50 z-10 flex cursor-default items-center justify-center border-b border-border py-1 [&_svg:not([class*='size-'])]:size-3.5 top-0 w-full",
    className
  )}
  {...restProps}
>
  <CaretUpIcon />
</SelectPrimitive.ScrollUpButton>
