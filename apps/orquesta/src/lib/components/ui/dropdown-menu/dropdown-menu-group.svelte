<script lang="ts">
  import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';
  import { cn } from '../../../utils.js';

  let {
    ref = $bindable(null),
    class: className,
    ...restProps
  }: DropdownMenuPrimitive.GroupProps = $props();
</script>

<DropdownMenuPrimitive.Group
  bind:ref
  data-slot="dropdown-menu-group"
  class={cn('border-border/60 py-1 not-first:border-t', className)}
  {...restProps}
/>
