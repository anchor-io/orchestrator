<script lang="ts">
  import { LeftSidebarContext } from './info-sidebar.svelte';
  import { RightSidebarContext } from './session-sidebar.svelte';
  import { setSidebarContext, type SidebarContext } from './sidebar-context';

  const { children } = $props();

  const sidebarContext: SidebarContext = {
    left: new RightSidebarContext(),
    right: new LeftSidebarContext()
  };

  setSidebarContext(sidebarContext);
</script>

{@render children?.()}
