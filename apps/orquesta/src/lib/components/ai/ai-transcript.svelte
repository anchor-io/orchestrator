<script lang="ts">
  import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
  import { cn } from '$lib/utils.js';
  import {
    getMessageKey,
    isVisibleAssistantContent,
    isVisibleToolResultContent
  } from './format.js';
  import AiMessage from './ai-message.svelte';
  import type {
    AiAssistantMessage,
    AiMessage as AiMessageType,
    AiToolResultMessage
  } from './types.js';

  // Scrollable chat transcript for user-facing messages.
  interface Props {
    /** Completed messages from the current snapshot. */
    messages: AiMessageType[];
    /** In-progress assistant message rendered after completed messages. */
    streamingMessage?: AiAssistantMessage;
    /** Optional class for embedding in a shell. */
    class?: string;
  }

  let { messages, streamingMessage, class: className }: Props = $props();

  const toolResultsById = $derived.by<Record<string, AiToolResultMessage>>(() => {
    const results: Record<string, AiToolResultMessage> = {};
    for (const message of messages) {
      if (message.role === 'toolResult') {
        results[message.toolCallId] = message;
      }
    }
    return results;
  });
  const visibleMessages = $derived(messages.filter(isVisibleMessage));
  const isEmpty = $derived(visibleMessages.length === 0 && !streamingMessage);

  function isVisibleMessage(message: AiMessageType) {
    switch (message.role) {
      case 'assistant':
        return (
          Boolean(message.errorMessage) ||
          message.content.some((content) => isVisibleAssistantContent(content))
        );
      case 'toolResult':
        if (hasAssistantToolCall(message.toolCallId)) return false;
        return (
          message.isError || message.content.some((content) => isVisibleToolResultContent(content))
        );
      case 'custom':
        if (!message.display) return false;
        if (typeof message.content === 'string') return message.content.trim().length > 0;
        return message.content.some(
          (content) =>
            content.type === 'image' || (content.type === 'text' && content.text.trim().length > 0)
        );
      default:
        return true;
    }
  }

  function hasAssistantToolCall(toolCallId: string) {
    return messages.some(
      (message) =>
        message.role === 'assistant' &&
        message.content.some((content) => content.type === 'toolCall' && content.id === toolCallId)
    );
  }
</script>

<section data-slot="ai-transcript" class={cn('min-h-0 bg-background', className)}>
  <ScrollArea class="h-full">
    <div class="px-4">
      <div class="mx-auto grid w-full max-w-5xl py-3">
        {#if isEmpty}
          <div class="grid min-h-80 place-items-center border-y border-dashed border-border/70">
            <div class="max-w-sm text-center">
              <h2 class="text-sm font-medium text-foreground">No messages yet</h2>
              <p class="mt-1 text-xs/relaxed text-muted-foreground">
                Start a run to see the chat surface.
              </p>
            </div>
          </div>
        {:else}
          {#each visibleMessages as message, index (getMessageKey(message, index))}
            <AiMessage {message} {toolResultsById} />
          {/each}
          {#if streamingMessage}
            <AiMessage message={streamingMessage} {toolResultsById} streaming />
          {/if}
        {/if}
      </div>
    </div>
  </ScrollArea>
</section>
