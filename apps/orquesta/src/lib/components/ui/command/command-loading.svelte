<script lang="ts">
  import { Command as CommandPrimitive } from 'bits-ui';
  import { cn } from '../../../utils.js';

  let {
    ref = $bindable(null),
    class: className,
    ...restProps
  }: CommandPrimitive.LoadingProps = $props();
</script>

<CommandPrimitive.Loading
  bind:ref
  class={cn('px-3 py-2  text-xs   text-muted-foreground/50', className)}
  {...restProps}
/>
