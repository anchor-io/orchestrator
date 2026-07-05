<script lang="ts">
  import WrenchIcon from 'phosphor-svelte/lib/WrenchIcon';
  import { Checkbox } from '$lib/components/ui/checkbox/index.js';
  import { cn } from '$lib/utils.js';
  import type { AiTool, AiWorkbenchActions } from './types.js';

  // Right-rail checklist for enabling wrapper tools.
  interface Props {
    /** Tool definitions available to this session. */
    tools: AiTool[];
    /** Names of tools currently enabled. */
    activeToolNames: string[];
    /** Receives active tool name changes. */
    actions?: AiWorkbenchActions;
    /** Optional class for rail placement. */
    class?: string;
  }

  let { tools, activeToolNames, actions, class: className }: Props = $props();

  function setToolActive(name: string, active: boolean) {
    const next = active
      ? activeToolNames.includes(name)
        ? activeToolNames
        : [...activeToolNames, name]
      : activeToolNames.filter((toolName) => toolName !== name);
    void actions?.setActiveTools?.(next);
  }

  function getToolId(name: string) {
    return `ai-tool-${name.replace(/[^a-zA-Z0-9_-]/g, '-')}`;
  }
</script>

<section data-slot="ai-tool-controls" class={cn('grid gap-2', className)}>
  <div class="flex items-center gap-2">
    <WrenchIcon class="size-3.5 text-muted-foreground" />
    <h2 class="text-xs font-medium text-muted-foreground">Tools</h2>
  </div>
  <div class="grid gap-1">
    {#each tools as tool (tool.name)}
      {const active = activeToolNames.includes(tool.name)}
      <div
        class={cn(
          'grid grid-cols-[auto_1fr] gap-2 border-t border-border/70 py-2',
          active && 'bg-primary-wash/20'
        )}
      >
        <Checkbox
          id={getToolId(tool.name)}
          checked={active}
          aria-label={`${tool.name} active`}
          onCheckedChange={(checked) => setToolActive(tool.name, checked)}
        />
        <span class="grid min-w-0 gap-0.5">
          <label for={getToolId(tool.name)} class="truncate text-xs font-medium text-foreground">
            {tool.name}
          </label>
          {#if tool.description}
            <span class="line-clamp-2 text-xs/relaxed text-muted-foreground"
              >{tool.description}</span
            >
          {/if}
        </span>
      </div>
    {/each}
  </div>
</section>
