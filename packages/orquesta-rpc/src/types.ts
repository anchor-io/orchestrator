export type AgentId = string;
export type ChannelId = string;
export type MessageId = string;
export type RpcRequestId = string;

export type InterruptionPolicy = "defer" | "steer" | "interrupt";

export interface MailboxMessage {
  id: MessageId;
  channelId: ChannelId;
  fromAgentId: AgentId;
  body: string;
  createdAt: string;
}

export interface MailboxMessageReceivedEvent {
  type: "mailbox.message_received";
  recipientAgentId: AgentId;
  messageId: MessageId;
  channelId: ChannelId;
  fromAgentId: AgentId;
  preview: string;
  interruption: InterruptionPolicy;
  durable: true;
}

export interface AgentLoopDetectedEvent {
  type: "agent.loop_detected";
  recipientAgentId: AgentId;
  reason: string;
  interruption: "interrupt";
  durable: false;
}

export type OrquestaEvent = MailboxMessageReceivedEvent | AgentLoopDetectedEvent;

export interface RpcMethodMap {
  "mailbox.list": {
    params: Record<string, never>;
    result: { messages: MailboxMessage[] };
  };
  "mailbox.ack": {
    params: { messageIds: MessageId[] };
    result: { ackedMessageIds: MessageId[] };
  };
  "channel.send": {
    params: { channelId: ChannelId; body: string };
    result: { message: MailboxMessage; deliveredTo: AgentId[] };
  };
}

export type RpcMethodName = keyof RpcMethodMap;

export type RpcMethodParams<M extends RpcMethodName> = RpcMethodMap[M]["params"];
export type RpcMethodResult<M extends RpcMethodName> = RpcMethodMap[M]["result"];

export interface RpcErrorPayload {
  code: string;
  message: string;
}
