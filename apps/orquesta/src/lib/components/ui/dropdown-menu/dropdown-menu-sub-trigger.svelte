<script lang="ts">
  import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';
  import CaretRightIcon from 'phosphor-svelte/lib/CaretRightIcon';
  import { cn } from '../../../utils.js';

  let {
    ref = $bindable(null),
    class: className,
    inset,
    children,
    ...restProps
  }: DropdownMenuPrimitive.SubTriggerProps & {
    inset?: boolean;
  } = $props();
</script>

<DropdownMenuPrimitive.SubTrigger
  bind:ref
  data-slot="dropdown-menu-sub-trigger"
  data-inset={inset}
  class={cn(
    "flex cursor-default items-center gap-2 border border-transparent px-2 py-1 text-xs font-medium text-muted-foreground outline-hidden rounded-item select-none focus:border-primary/50 focus:bg-muted focus:text-foreground not-data-[variant=destructive]:focus:**:text-link data-open:border-primary/50 data-open:bg-muted data-open:text-foreground data-inset:pl-7 data-[inset]:pl-7 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
    className
  )}
  {...restProps}
>
  {@render children?.()}
  <CaretRightIcon class="ml-auto text-link" />
</DropdownMenuPrimitive.SubTrigger>
