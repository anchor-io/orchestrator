<script lang="ts">
  import { Command as CommandPrimitive } from 'bits-ui';
  import { cn } from '../../../utils.js';
  import * as InputGroup from '../input-group/index.js';
  import MagnifyingGlassIcon from 'phosphor-svelte/lib/MagnifyingGlassIcon';

  let {
    ref = $bindable(null),
    class: className,
    value = $bindable(''),
    ...restProps
  }: CommandPrimitive.InputProps = $props();
</script>

<div data-slot="command-input-wrapper" class="border-b border-border bg-popover p-1">
  <InputGroup.Root
    class="border-transparent bg-muted shadow-[inset_0_0_0_1px_rgba(161,161,170,0.12)]"
  >
    <CommandPrimitive.Input
      {value}
      data-slot="command-input"
      class={cn(
        'w-full px-2  text-xs text-foreground placeholder:text-muted-foreground/50 outline-hidden disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...restProps}
    >
      {#snippet child({ props })}
        <InputGroup.Input {...props} bind:value bind:ref />
      {/snippet}
    </CommandPrimitive.Input>
    <InputGroup.Addon class="px-2">
      <MagnifyingGlassIcon class="size-3.5 shrink-0 text-link opacity-80" />
    </InputGroup.Addon>
  </InputGroup.Root>
</div>
