<script lang="ts" module>
  import { Button, type ButtonProps } from './index.js';
  import { cn } from '../../../utils.js';

  const PILL_CLASS =
    'rounded-full h-9 px-5 has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4';
</script>

<script lang="ts">
  let {
    class: className,
    variant = 'default',
    size = 'default',
    ref = $bindable(null),
    href = undefined,
    type = 'button',
    disabled,
    children,
    ...restProps
  }: ButtonProps = $props();

  const safeVariant = $derived(variant === 'outline' ? 'outline' : 'default');
</script>

{#if href}
  <Button
    bind:ref
    {href}
    variant={safeVariant}
    {size}
    {disabled}
    class={cn(PILL_CLASS, className)}
    {...restProps}
  >
    {@render children?.()}
  </Button>
{:else}
  <Button
    bind:ref
    variant={safeVariant}
    {size}
    {type}
    {disabled}
    class={cn(PILL_CLASS, className)}
    {...restProps}
  >
    {@render children?.()}
  </Button>
{/if}
