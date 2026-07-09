<script lang="ts">
  import { Select as SelectPrimitive } from 'bits-ui';
  import { cn, type WithoutChildrenOrChild } from '../../../utils.js';
  import CaretDownIcon from 'phosphor-svelte/lib/CaretDownIcon';

  let {
    ref = $bindable(null),
    class: className,
    ...restProps
  }: WithoutChildrenOrChild<SelectPrimitive.ScrollDownButtonProps> = $props();
</script>

<SelectPrimitive.ScrollDownButton
  bind:ref
  data-slot="select-scroll-down-button"
  class={cn(
    "bg-muted text-muted-foreground/50 z-10 flex cursor-default items-center justify-center border-t border-border py-1 [&_svg:not([class*='size-'])]:size-3.5 bottom-0 w-full",
    className
  )}
  {...restProps}
>
  <CaretDownIcon />
</SelectPrimitive.ScrollDownButton>
