import { createContext } from 'svelte';
import type { RightSidebarContext } from './session-sidebar.svelte';
import type { LeftSidebarContext } from './info-sidebar.svelte';

export type SidebarContext = {
  left: RightSidebarContext;
  right: LeftSidebarContext;
};

export const [getSidebarContext, setSidebarContext] = createContext<SidebarContext>();
