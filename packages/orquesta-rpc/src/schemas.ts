import * as v from "valibot";

const IdSchema = v.pipe(v.string(), v.nonEmpty());
const InterruptionPolicySchema = v.union([
  v.literal("defer"),
  v.literal("steer"),
  v.literal("interrupt"),
]);

export const MailboxMessageSchema = v.object({
  id: IdSchema,
  channelId: IdSchema,
  fromAgentId: IdSchema,
  body: v.string(),
  createdAt: IdSchema,
});

export const OrquestaEventSchema = v.variant("type", [
  v.object({
    type: v.literal("mailbox.message_received"),
    recipientAgentId: IdSchema,
    messageId: IdSchema,
    channelId: IdSchema,
    fromAgentId: IdSchema,
    preview: v.string(),
    interruption: InterruptionPolicySchema,
    durable: v.literal(true),
  }),
  v.object({
    type: v.literal("agent.loop_detected"),
    recipientAgentId: IdSchema,
    reason: v.pipe(v.string(), v.nonEmpty()),
    interruption: v.literal("interrupt"),
    durable: v.literal(false),
  }),
]);

export const HelloFrameSchema = v.object({
  kind: v.literal("hello"),
  agentId: IdSchema,
  token: IdSchema,
});

export const RequestFrameSchema = v.object({
  kind: v.literal("request"),
  id: IdSchema,
  method: IdSchema,
  params: v.unknown(),
});

export const ResponseFrameSchema = v.object({
  kind: v.literal("response"),
  id: IdSchema,
  result: v.optional(v.unknown()),
  error: v.optional(
    v.object({
      code: IdSchema,
      message: v.pipe(v.string(), v.nonEmpty()),
    }),
  ),
});

export const EventFrameSchema = v.object({
  kind: v.literal("event"),
  event: OrquestaEventSchema,
});

export const ReadyFrameSchema = v.object({
  kind: v.literal("ready"),
  agentId: IdSchema,
});

export const RpcFrameSchema = v.variant("kind", [
  HelloFrameSchema,
  RequestFrameSchema,
  ResponseFrameSchema,
  EventFrameSchema,
  ReadyFrameSchema,
]);

export const MailboxListParamsSchema = v.object({});
export const MailboxAckParamsSchema = v.object({ messageIds: v.array(IdSchema) });
export const ChannelSendParamsSchema = v.object({
  channelId: IdSchema,
  body: v.pipe(v.string(), v.nonEmpty()),
});

export type RpcFrameInput = v.InferOutput<typeof RpcFrameSchema>;
