<script lang="ts">
  import { cn } from '$lib/utils.js';
  import AiActivity from './ai-activity.svelte';
  import AiContentBlock from './ai-content-block.svelte';
  import { isVisibleAssistantContent, isVisibleToolResultContent } from './format.js';
  import type { AiMessage, AiToolResultMessage } from './types.js';

  // Renders one transcript message in the chat column.
  interface Props {
    /** Message to render; structural message types are usually filtered by AiTranscript. */
    message: AiMessage;
    /** Marks the assistant message as still being produced. */
    streaming?: boolean;
    /** Completed tool results keyed by tool call id. */
    toolResultsById?: Record<string, AiToolResultMessage>;
    /** Optional class for row-level layout. */
    class?: string;
  }

  let { message, streaming = false, toolResultsById = {}, class: className }: Props = $props();

  const visibleAssistantContent = $derived.by(() => {
    if (message.role !== 'assistant') return [];
    return message.content.filter(isVisibleAssistantContent);
  });

  const visibleToolResultContent = $derived.by(() => {
    if (message.role !== 'toolResult') return [];
    return message.content.filter(isVisibleToolResultContent);
  });
</script>

<article
  data-slot="ai-message"
  data-role={message.role}
  class={cn('grid gap-1.5 py-2 text-sm', message.role === 'user' && 'justify-items-end', className)}
>
  <div class="grid min-w-0 gap-1.5">
    {#if message.role === 'user'}
      {#if typeof message.content === 'string'}
        <pre
          class="max-w-2xl whitespace-pre-wrap break-words border border-border/70 bg-muted/20 px-3 py-2 font-sans text-foreground">{message.content}</pre>
      {:else}
        <div class="grid max-w-2xl gap-2 border border-border/70 bg-muted/20 px-3 py-2">
          {#each message.content as block, index (`user-${message.timestamp}-${index}`)}
            <AiContentBlock content={block} />
          {/each}
        </div>
      {/if}
    {:else if message.role === 'assistant'}
      {#if streaming && visibleAssistantContent.length === 0}
        <div class="text-xs font-medium text-primary">Generating</div>
      {/if}
      {#if message.errorMessage}
        <div class="border-l border-destructive px-2 py-1 text-xs text-destructive">
          {message.errorMessage}
        </div>
      {/if}
      {#if visibleAssistantContent.length > 0}
        <div class="grid gap-1.5">
          {#each visibleAssistantContent as block, index (`assistant-${message.timestamp}-${index}`)}
            <AiContentBlock
              content={block}
              toolResult={block.type === 'toolCall' ? toolResultsById[block.id] : undefined}
            />
          {/each}
        </div>
      {/if}
    {:else if message.role === 'toolResult'}
      <AiActivity
        dataSlot="ai-tool-result"
        variant={message.isError ? 'tool-error' : 'tool-result'}
        label={message.isError ? 'Tool error' : 'Tool result'}
        meta={message.toolName}
        defaultOpen={message.isError}
      >
        {#snippet detail()}
          {#if visibleToolResultContent.length > 0}
            <div class="grid gap-2">
              {#each visibleToolResultContent as block, index (`tool-result-${message.timestamp}-${index}`)}
                <AiContentBlock content={block} class="text-muted-foreground/85" />
              {/each}
            </div>
          {/if}
        {/snippet}
      </AiActivity>
    {:else if message.role === 'custom' && message.display}
      {#if typeof message.content === 'string'}
        <pre
          class="whitespace-pre-wrap break-words font-sans text-foreground">{message.content}</pre>
      {:else}
        <div class="grid gap-2">
          {#each message.content as block, index (`custom-${message.timestamp}-${index}`)}
            <AiContentBlock content={block} />
          {/each}
        </div>
      {/if}
    {:else if message.role === 'bashExecution'}
      <pre
        class="overflow-x-auto whitespace-pre-wrap break-words border-l border-border/80 bg-code/70 px-2 py-1.5 font-mono text-[11px] leading-relaxed text-code-foreground">$ {message.command}
{message.output}</pre>
    {:else if message.role === 'branchSummary'}
      <pre
        class="whitespace-pre-wrap break-words font-sans text-muted-foreground">{message.summary}</pre>
    {:else if message.role === 'compactionSummary'}
      <pre
        class="whitespace-pre-wrap break-words font-sans text-muted-foreground">{message.summary}</pre>
    {/if}
  </div>
</article>
