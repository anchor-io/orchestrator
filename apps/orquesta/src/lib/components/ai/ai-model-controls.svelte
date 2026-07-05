<script lang="ts">
  import * as Select from '$lib/components/ui/select/index.js';
  import { cn } from '$lib/utils.js';
  import type { AiModel, AiThinkingLevel, AiWorkbenchActions } from './types.js';

  // Compact model and effort selectors for the composer control row.
  interface Props {
    /** Currently selected model shown in the model picker. */
    model?: AiModel;
    /** Models the wrapper allows for this session. */
    models: AiModel[];
    /** Current reasoning/effort setting. */
    thinkingLevel?: AiThinkingLevel;
    /** Effort levels the wrapper supports. */
    thinkingLevels: AiThinkingLevel[];
    /** Receives model and effort changes. */
    actions?: AiWorkbenchActions;
    /** Optional layout class for the control row. */
    class?: string;
  }

  let { model, models, thinkingLevel, thinkingLevels, actions, class: className }: Props = $props();

  const modelLabel = $derived(model?.name ?? model?.id ?? 'No model');
  const thinkingLabel = $derived(thinkingLevel ?? 'off');
</script>

<section data-slot="ai-model-controls" class={cn('flex min-w-0 items-center gap-1', className)}>
  <Select.Root type="single" value={model?.id}>
    <Select.Trigger
      size="sm"
      class="h-7 max-w-36 min-w-0 border-transparent bg-transparent px-1.5 text-muted-foreground hover:bg-muted/35 hover:text-foreground sm:max-w-48"
      aria-label="Model"
    >
      <span class="truncate">{modelLabel}</span>
    </Select.Trigger>
    <Select.Content>
      <Select.Group>
        <Select.Label>Model</Select.Label>
        {#each models as option (option.id)}
          <Select.Item
            value={option.id}
            label={option.name ?? option.id}
            onclick={() => void actions?.setModel?.(option.id)}
          >
            <span class="truncate">{option.name ?? option.id}</span>
            {#if option.provider}
              <span class="font-mono text-[10px] text-muted-foreground">{option.provider}</span>
            {/if}
          </Select.Item>
        {/each}
      </Select.Group>
    </Select.Content>
  </Select.Root>

  <Select.Root type="single" value={thinkingLevel}>
    <Select.Trigger
      size="sm"
      class="h-7 w-auto border-transparent bg-transparent px-1.5 text-muted-foreground hover:bg-muted/35 hover:text-foreground"
      aria-label="Effort"
    >
      <span class="truncate">Effort {thinkingLabel}</span>
    </Select.Trigger>
    <Select.Content>
      <Select.Group>
        <Select.Label>Effort</Select.Label>
        {#each thinkingLevels as level (level)}
          <Select.Item
            value={level}
            label={level}
            onclick={() => void actions?.setThinkingLevel?.(level)}
          >
            {level}
          </Select.Item>
        {/each}
      </Select.Group>
    </Select.Content>
  </Select.Root>
</section>
