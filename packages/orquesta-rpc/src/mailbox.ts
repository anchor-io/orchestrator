import { randomUUID } from "node:crypto";
import type { AgentId, ChannelId, MailboxMessage, MessageId } from "./types.ts";

export type MailboxErrorCode = "agent_not_in_channel";

export class MailboxError extends Error {
  readonly code: MailboxErrorCode;

  constructor(code: MailboxErrorCode, message: string) {
    super(message);
    this.name = "MailboxError";
    this.code = code;
  }
}

export interface MailboxRuntimeOptions {
  createId?: () => MessageId;
  now?: () => Date;
}

export class MailboxRuntime {
  #channels = new Map<ChannelId, Set<AgentId>>();
  #agentChannels = new Map<AgentId, Set<ChannelId>>();
  #mailboxes = new Map<AgentId, Map<MessageId, MailboxMessage>>();
  #createId: () => MessageId;
  #now: () => Date;

  constructor(options: MailboxRuntimeOptions = {}) {
    this.#createId = options.createId ?? randomUUID;
    this.#now = options.now ?? (() => new Date());
  }

  configureAgent(agentId: AgentId, channelIds: ChannelId[]): void {
    const previousChannels = this.#agentChannels.get(agentId) ?? new Set<ChannelId>();
    for (const channelId of previousChannels) {
      this.#channels.get(channelId)?.delete(agentId);
    }

    const nextChannels = new Set(channelIds);
    this.#agentChannels.set(agentId, nextChannels);
    this.#mailboxes.set(agentId, this.#mailboxes.get(agentId) ?? new Map());

    for (const channelId of nextChannels) {
      const members = this.#channels.get(channelId) ?? new Set<AgentId>();
      members.add(agentId);
      this.#channels.set(channelId, members);
    }
  }

  sendMessage(channelId: ChannelId, fromAgentId: AgentId, body: string) {
    const members = this.#channels.get(channelId) ?? new Set<AgentId>();
    if (!members.has(fromAgentId)) {
      throw new MailboxError(
        "agent_not_in_channel",
        `Agent ${fromAgentId} is not a member of channel ${channelId}`,
      );
    }

    const message: MailboxMessage = {
      id: this.#createId(),
      channelId,
      fromAgentId,
      body,
      createdAt: this.#now().toISOString(),
    };
    const deliveredTo: AgentId[] = [];

    for (const agentId of members) {
      if (agentId === fromAgentId) continue;
      const mailbox = this.#mailboxes.get(agentId) ?? new Map<MessageId, MailboxMessage>();
      mailbox.set(message.id, message);
      this.#mailboxes.set(agentId, mailbox);
      deliveredTo.push(agentId);
    }

    return { message, deliveredTo };
  }

  listMessages(agentId: AgentId): MailboxMessage[] {
    const mailbox = this.#mailboxes.get(agentId) ?? new Map<MessageId, MailboxMessage>();
    this.#mailboxes.set(agentId, mailbox);
    return Array.from(mailbox.values());
  }

  ackMessages(agentId: AgentId, messageIds: MessageId[]): MessageId[] {
    const mailbox = this.#mailboxes.get(agentId) ?? new Map<MessageId, MailboxMessage>();
    const ackedMessageIds: MessageId[] = [];

    for (const messageId of messageIds) {
      if (mailbox.delete(messageId)) ackedMessageIds.push(messageId);
    }

    this.#mailboxes.set(agentId, mailbox);
    return ackedMessageIds;
  }
}
