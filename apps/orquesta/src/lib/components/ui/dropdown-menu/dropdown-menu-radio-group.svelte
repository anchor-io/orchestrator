<script lang="ts">
  import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';
  import { cn } from '../../../utils.js';

  let {
    ref = $bindable(null),
    value = $bindable(),
    class: className,
    ...restProps
  }: DropdownMenuPrimitive.RadioGroupProps = $props();
</script>

<DropdownMenuPrimitive.RadioGroup
  bind:ref
  bind:value
  data-slot="dropdown-menu-radio-group"
  class={cn('border-border/60 py-1 not-first:border-t', className)}
  {...restProps}
/>
