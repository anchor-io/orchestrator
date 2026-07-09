<script lang="ts">
  import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';
  import CheckIcon from 'phosphor-svelte/lib/CheckIcon';
  import MinusIcon from 'phosphor-svelte/lib/MinusIcon';
  import { cn, type WithoutChildrenOrChild } from '../../../utils.js';
  import type { Snippet } from 'svelte';

  let {
    ref = $bindable(null),
    checked = $bindable(false),
    indeterminate = $bindable(false),
    class: className,
    children: childrenProp,
    ...restProps
  }: WithoutChildrenOrChild<DropdownMenuPrimitive.CheckboxItemProps> & {
    children?: Snippet;
  } = $props();
</script>

<DropdownMenuPrimitive.CheckboxItem
  bind:ref
  bind:checked
  bind:indeterminate
  data-slot="dropdown-menu-checkbox-item"
  class={cn(
    "relative flex cursor-default items-center gap-2 border border-transparent py-1 pr-8 pl-2 text-xs font-medium text-muted-foreground outline-hidden rounded-item select-none focus:border-primary/50 focus:bg-muted focus:text-foreground focus:**:text-link data-[checked=true]:text-link data-inset:pl-7 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
    className
  )}
  {...restProps}
>
  {#snippet children({ checked, indeterminate })}
    <span
      class="pointer-events-none absolute right-2 flex items-center justify-center text-link"
      data-slot="dropdown-menu-checkbox-item-indicator"
    >
      {#if indeterminate}
        <MinusIcon />
      {:else if checked}
        <CheckIcon />
      {/if}
    </span>
    {@render childrenProp?.()}
  {/snippet}
</DropdownMenuPrimitive.CheckboxItem>
