<script lang="ts">
  import { Select as SelectPrimitive } from 'bits-ui';
  import { cn, type WithoutChild } from '../../../utils.js';
  import CheckIcon from 'phosphor-svelte/lib/CheckIcon';

  let {
    ref = $bindable(null),
    class: className,
    value,
    label,
    children: childrenProp,
    ...restProps
  }: WithoutChild<SelectPrimitive.ItemProps> = $props();
</script>

<SelectPrimitive.Item
  bind:ref
  {value}
  data-slot="select-item"
  class={cn(
    "focus:bg-primary/18 focus:text-foreground not-data-[variant=destructive]:focus:**:text-foreground gap-2.5 rounded-item py-2 pr-8 pl-3  text-xs font-medium  text-muted-foreground [&_svg:not([class*='size-'])]:size-3.5 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2 data-highlighted:bg-primary/18 data-highlighted:text-foreground relative flex w-full cursor-default items-center outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
    className
  )}
  {...restProps}
>
  {#snippet children({ selected, highlighted })}
    <span class="absolute end-2 flex size-3.5 items-center justify-center text-link">
      {#if selected}
        <CheckIcon class="cn-select-item-indicator-icon" />
      {/if}
    </span>
    <span class="flex flex-1 gap-2 shrink-0 whitespace-nowrap">
      {#if childrenProp}
        {@render childrenProp({ selected, highlighted })}
      {:else}
        {label || value}
      {/if}
    </span>
  {/snippet}
</SelectPrimitive.Item>
