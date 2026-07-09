<script lang="ts">
  import { Command as CommandPrimitive } from 'bits-ui';
  import { cn } from '../../../utils.js';

  let {
    ref = $bindable(null),
    class: className,
    ...restProps
  }: CommandPrimitive.LinkItemProps = $props();
</script>

<CommandPrimitive.LinkItem
  bind:ref
  data-slot="command-item"
  class={cn(
    "relative flex cursor-default items-center gap-2 border border-transparent px-2 py-1.5  text-xs   text-muted-foreground outline-hidden select-none aria-selected:border-primary/50 aria-selected:bg-muted aria-selected:text-foreground rounded-item [&_svg:not([class*='text-'])]:text-link data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    className
  )}
  {...restProps}
/>
