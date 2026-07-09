<script lang="ts">
  import { Select as SelectPrimitive } from 'bits-ui';
  import { cn, type WithoutChild } from '../../../utils.js';
  import CaretDownIcon from 'phosphor-svelte/lib/CaretDownIcon';

  let {
    ref = $bindable(null),
    class: className,
    children,
    size = 'default',
    ...restProps
  }: WithoutChild<SelectPrimitive.TriggerProps> & {
    size?: 'sm' | 'default';
  } = $props();
</script>

<SelectPrimitive.Trigger
  bind:ref
  data-slot="select-trigger"
  data-size={size}
  class={cn(
    "border-border bg-muted text-foreground data-placeholder:text-muted-foreground/50 focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/25 aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 gap-1.5 rounded-control border px-3 py-1 text-sm transition-[color,border-color,box-shadow] data-[size=default]:h-8 data-[size=sm]:h-7 *:data-[slot=select-value]:flex *:data-[slot=select-value]:gap-1.5 [&_svg:not([class*='size-'])]:size-3.5 flex w-fit items-center justify-between whitespace-nowrap outline-none disabled:cursor-not-allowed disabled:opacity-50 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center [&_svg]:pointer-events-none [&_svg]:shrink-0",
    className
  )}
  {...restProps}
>
  {@render children?.()}
  <CaretDownIcon class="text-muted-foreground/50 size-3.5 pointer-events-none" />
</SelectPrimitive.Trigger>
