<script lang="ts">
  import { cn } from '$lib/utils.js';
  import AiActivity from './ai-activity.svelte';
  import { formatToolArguments, isVisibleToolResultContent } from './format.js';
  import type { AiAssistantContent, AiToolResultContent, AiToolResultMessage } from './types.js';

  // Renders one visible chat content block.
  interface Props {
    /** Text, image, reasoning, or tool-call content from a message. */
    content: AiAssistantContent | AiToolResultContent;
    /** Matching tool result, attached when rendering a tool call. */
    toolResult?: AiToolResultMessage;
    /** Optional class applied to the rendered block. */
    class?: string;
  }

  let { content, toolResult, class: className }: Props = $props();

  const imageSrc = $derived(
    content.type === 'image' ? `data:${content.mimeType};base64,${content.data}` : undefined
  );
  const toolArguments = $derived(
    content.type === 'toolCall' ? formatToolArguments(content.arguments) : ''
  );
  const toolResultContent = $derived(
    toolResult?.content.filter((block) => isVisibleToolResultContent(block)) ?? []
  );
</script>

{#if content.type === 'text'}
  <div data-slot="ai-content-text" class={cn('text-sm/relaxed text-foreground', className)}>
    <pre class="whitespace-pre-wrap break-words font-sans">{content.text}</pre>
  </div>
{:else if content.type === 'image'}
  <figure class={cn('overflow-hidden border-y border-border/70 bg-muted/40', className)}>
    <img
      class="max-h-64 w-full object-contain"
      src={imageSrc}
      alt={content.alt ?? 'AI image output'}
    />
  </figure>
{:else if content.type === 'thinking'}
  <AiActivity
    dataSlot="ai-content-thinking"
    variant="reasoning"
    label="Reasoning"
    class={className}
  >
    {#snippet detail()}
      {#if content.redacted}
        <p>Reasoning redacted by provider.</p>
      {:else}
        <pre class="whitespace-pre-wrap break-words font-sans">{content.thinking}</pre>
      {/if}
    {/snippet}
  </AiActivity>
{:else if content.type === 'toolCall'}
  <AiActivity
    dataSlot="ai-content-tool-call"
    variant="tool-call"
    label="Tool"
    meta={content.name}
    class={className}
  >
    {#snippet detail()}
      {#if toolArguments || toolResultContent.length > 0}
        <div class="grid gap-1.5">
          {#if toolArguments}
            <div class="grid gap-0.5">
              <span class="text-xs text-muted-foreground/55">Arguments</span>
              <pre
                class="whitespace-pre-wrap break-words font-mono text-xs leading-relaxed">{toolArguments}</pre>
            </div>
          {/if}
          {#if toolResultContent.length > 0}
            <div class="grid gap-0.5">
              <span class="text-xs text-muted-foreground/55">
                {toolResult?.isError ? 'Error' : 'Result'}
              </span>
              <div class="grid gap-1">
                {#each toolResultContent as block, index (`paired-tool-result-${toolResult?.timestamp}-${index}`)}
                  {#if block.type === 'text'}
                    <pre
                      class={cn(
                        'whitespace-pre-wrap break-words font-sans text-sm/relaxed',
                        toolResult?.isError ? 'text-destructive/80' : 'text-muted-foreground/85'
                      )}>{block.text}</pre>
                  {:else if block.type === 'image'}
                    <figure class="overflow-hidden">
                      <img
                        class="max-h-64 w-full object-contain"
                        src={`data:${block.mimeType};base64,${block.data}`}
                        alt={block.alt ?? 'Tool result image'}
                      />
                    </figure>
                  {/if}
                {/each}
              </div>
            </div>
          {/if}
        </div>
      {/if}
    {/snippet}
  </AiActivity>
{/if}
