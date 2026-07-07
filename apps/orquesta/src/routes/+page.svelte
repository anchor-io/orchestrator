<script lang="ts">
  import Chat from '$lib/components/workbench/chat/chat.svelte';
  import { getSidebarContext } from '$lib/components/workbench/sidebar-context';
  import { ElementSize } from 'runed';
  import Inspect from 'svelte-inspect-value';
  import { cubicOut } from 'svelte/easing';
  import { fly, slide } from 'svelte/transition';

  let shell = $state<HTMLElement>();
  const shellSize = new ElementSize(() => shell);

  const CHAT_IDEAL_WIDTH = 896;
  const MIN_GUTTER = 24;

  const panels = getSidebarContext();

  let shellWidth = $derived(shellSize.width ?? 0);
  let sidebarBudget = $derived(shellWidth - CHAT_IDEAL_WIDTH - MIN_GUTTER * 2);
  let remainingSidebarBudget = $derived(sidebarBudget - panels.left.width);

  let leftVisible = $derived(panels.left.enabled && sidebarBudget >= panels.left.width);

  let rightVisible = $derived(
    panels.right.enabled && leftVisible && remainingSidebarBudget >= panels.right.width
  );

  const slideX = { axis: 'x' as const, duration: 180, easing: cubicOut };
  const flyLeft = { x: -16, duration: 180, easing: cubicOut };
  const flyRight = { x: 16, duration: 180, easing: cubicOut };
</script>

<Inspect.Panel
  appearance="floating"
  opacity={true}
  align="center bottom"
  values={{
    shell,
    shellSize: { ...shellSize.current },
    panels,
    sidebarBudget,
    leftVisible,
    rightVisible
  }}
/>
<main
  bind:this={shell}
  class="flex overflow-hidden min-h-dvh min-w-dvw border bg-background text-foreground"
>
  {#if leftVisible}
    <aside
      class="w-(--left-sidebar-width) shrink-0 min-w-0 overflow-hidden border bg-red-900"
      style:--left-sidebar-width={`${panels.left.width}px`}
      transition:slide={slideX}
    >
      <div class="w-(--left-sidebar-width) h-full" transition:fly={flyLeft}>sessions</div>
    </aside>
  {/if}

  <div class="min-w-0 flex-auto flex px-6 justify-center">
    <section class="min-w-0 h-full w-full max-w-4xl border bg-amber-900" aria-label="Chat">
      <Chat />
    </section>
  </div>

  {#if rightVisible}
    <aside
      class="w-(--right-sidebar-width) shrink-0 min-w-0 overflow-hidden border bg-green-900"
      style:--right-sidebar-width={`${panels.right.width}px`}
      transition:slide={slideX}
    >
      <div class="w-(--right-sidebar-width) h-full" transition:fly={flyRight}>info</div>
    </aside>
  {/if}
</main>
