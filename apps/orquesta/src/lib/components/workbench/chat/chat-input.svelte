<script lang="ts">
  import * as InputGroup from '$lib/components/ui/input-group/index.js';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
  import { Separator } from '$lib/components/ui/separator/index.js';
  import ArrowUpIcon from 'phosphor-svelte/lib/ArrowUpIcon';
  import PlusIcon from 'phosphor-svelte/lib/PlusIcon';
  import type { HTMLAttributes } from 'svelte/elements';
  import type { WithElementRef } from 'bits-ui';
  import { type WithoutChildrenOrChild } from '$lib/utils';

  let {
    ref = $bindable(null),
    class: className,
    ...props
  }: WithoutChildrenOrChild<WithElementRef<HTMLAttributes<HTMLDivElement>>> = $props();
</script>

<InputGroup.Root bind:ref class={className} {...props}>
  <InputGroup.Textarea placeholder="Start a session" />
  <InputGroup.Addon align="block-end">
    <InputGroup.Button variant="outline" class="rounded-full" size="icon-xs">
      <PlusIcon />
    </InputGroup.Button>
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        {#snippet child({ props })}
          <InputGroup.Button {...props} variant="ghost">Auto</InputGroup.Button>
        {/snippet}
      </DropdownMenu.Trigger>
      <DropdownMenu.Content side="top" align="start" class="[--radius:0.95rem]">
        <DropdownMenu.Item>Auto</DropdownMenu.Item>
        <DropdownMenu.Item>Agent</DropdownMenu.Item>
        <DropdownMenu.Item>Manual</DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
    <InputGroup.Text class="ms-auto">52% used</InputGroup.Text>
    <Separator orientation="vertical" class="h-4!" />
    <InputGroup.Button variant="default" class="rounded-full" size="icon-xs" disabled>
      <ArrowUpIcon />
      <span class="sr-only">Send</span>
    </InputGroup.Button>
  </InputGroup.Addon>
</InputGroup.Root>
