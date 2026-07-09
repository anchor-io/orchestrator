<script lang="ts">
  import { Collapsible as CollapsiblePrimitive } from 'bits-ui';
  import { cn } from '../../../utils.js';

  let {
    ref = $bindable(null),
    class: className,
    ...restProps
  }: CollapsiblePrimitive.TriggerProps = $props();
</script>

<CollapsiblePrimitive.Trigger
  bind:ref
  data-slot="collapsible-trigger"
  class={cn(
    'flex w-full items-center justify-between border-b border-border px-3 py-2  text-xs font-medium  text-muted-foreground  transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none',
    className
  )}
  {...restProps}
/>
