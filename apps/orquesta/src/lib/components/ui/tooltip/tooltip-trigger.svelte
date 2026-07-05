<script lang="ts">
  import { Tooltip as TooltipPrimitive } from 'bits-ui';
  import { cn } from '../../../utils.js';

  let {
    ref = $bindable(null),
    class: className,
    ...restProps
  }: TooltipPrimitive.TriggerProps = $props();
</script>

<TooltipPrimitive.Trigger
  bind:ref
  data-slot="tooltip-trigger"
  class={cn(
    'outline-none transition-colors focus-visible:ring-1 focus-visible:ring-ring/50',
    className
  )}
  {...restProps}
/>
