<script lang="ts">
  import { cn } from '../../../utils.js';
  import { Textarea } from '../textarea/index.js';
  import type { ComponentProps } from 'svelte';

  let {
    ref = $bindable(null),
    value = $bindable(),
    class: className,
    ...props
  }: ComponentProps<typeof Textarea> = $props();
</script>

<Textarea
  bind:ref
  data-slot="input-group-control"
  class={cn(
    'border-0 bg-transparent px-3 py-2.5 ring-0 focus-visible:ring-0 aria-invalid:ring-0 dark:bg-transparent flex-1 resize-none',
    className
  )}
  bind:value
  {...props}
/>
