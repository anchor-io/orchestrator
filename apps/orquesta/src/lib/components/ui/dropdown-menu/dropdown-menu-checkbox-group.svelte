<script lang="ts">
  import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';
  import { cn } from '../../../utils.js';

  let {
    ref = $bindable(null),
    value = $bindable([]),
    class: className,
    ...restProps
  }: DropdownMenuPrimitive.CheckboxGroupProps = $props();
</script>

<DropdownMenuPrimitive.CheckboxGroup
  bind:ref
  bind:value
  data-slot="dropdown-menu-checkbox-group"
  class={cn('border-border/60 py-1 not-first:border-t', className)}
  {...restProps}
/>
