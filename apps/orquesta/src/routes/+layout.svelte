<script lang="ts">
  import type { Pathname } from '$app/types';
  import { resolve } from '$app/paths';
  import { page } from '$app/state';
  import { locales, localizeHref } from '$lib/paraglide/runtime';
  import './layout.css';
  import favicon from '$lib/assets/favicon.svg';
  import { RenderScan } from 'svelte-render-scan';
  import { dev } from '$app/env';
  import { InspectOptionsProvider, type InspectOptions } from 'svelte-inspect-value';
  import SidebarProvider from '$lib/components/workbench/sidebar-provider.svelte';

  let { children } = $props();

  let inspectOptions = $state<Partial<InspectOptions>>({
    renderIf: dev,
    expandLevel: 0
  });
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<SidebarProvider>
  {@render children?.()}

  {#if dev}
    <RenderScan />
  {/if}
  <InspectOptionsProvider options={inspectOptions}>
    <div style="display:none">
      {#each locales as locale (locale)}
        <a href={resolve(localizeHref(page.url.pathname, { locale }) as Pathname)}>{locale}</a>
      {/each}
    </div>
  </InspectOptionsProvider>
</SidebarProvider>
