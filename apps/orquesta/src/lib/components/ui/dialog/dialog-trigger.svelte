<script lang="ts">
  import { Dialog as DialogPrimitive } from 'bits-ui';
  import { cn } from '../../../utils.js';

  let {
    ref = $bindable(null),
    type = 'button',
    class: className,
    ...restProps
  }: DialogPrimitive.TriggerProps = $props();
</script>

<DialogPrimitive.Trigger
  bind:ref
  data-slot="dialog-trigger"
  class={cn(
    'outline-none transition-colors focus-visible:ring-1 focus-visible:ring-ring/50',
    className
  )}
  {type}
  {...restProps}
/>
