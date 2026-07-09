<script lang="ts">
  import { cn } from '../../../utils.js';
  import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';

  let {
    ref = $bindable(null),
    class: className,
    inset,
    variant = 'default',
    ...restProps
  }: DropdownMenuPrimitive.ItemProps & {
    inset?: boolean;
    variant?: 'default' | 'destructive';
  } = $props();
</script>

<DropdownMenuPrimitive.Item
  bind:ref
  data-slot="dropdown-menu-item"
  data-inset={inset}
  data-variant={variant}
  class={cn(
    "relative flex cursor-default items-center gap-2 border border-transparent px-2 py-1 text-xs font-medium text-muted-foreground outline-hidden rounded-item select-none focus:border-primary/50 focus:bg-muted focus:text-foreground not-data-[variant=destructive]:focus:**:text-link data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:text-destructive data-inset:pl-7 data-[inset]:pl-7 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5 group/dropdown-menu-item",
    className
  )}
  {...restProps}
/>
