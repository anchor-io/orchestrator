export const PACKAGE_NAME = "@anchorsoft/orquesta-rpc";

export { createOrquestaRpcApp, type OrquestaRpcApp, type OrquestaRpcAppOptions } from "./app.ts";
export {
  AgentRpcClient,
  RpcCallError,
  type AgentRpcClientOptions,
  type OrquestaEventListener,
  type RpcClientTransport,
} from "./client.ts";
export {
  MailboxError,
  MailboxRuntime,
  type MailboxErrorCode,
  type MailboxRuntimeOptions,
} from "./mailbox.ts";
export {
  decodeFrame,
  encodeFrame,
  RpcProtocolError,
  type AgentRpcHelloFrame,
  type AgentRpcReadyFrame,
  type ClientToServerFrame,
  type OrquestaEventFrame,
  type RpcFrame,
  type RpcRequestFrame,
  type RpcResponseFrame,
  type ServerToClientFrame,
} from "./protocol.ts";
export {
  AgentRpcServer,
  AgentRpcSession,
  OrquestaRpcService,
  type AgentRpcSocket,
  type OrquestaRpcServiceOptions,
  type RpcConnectionContext,
} from "./server.ts";
export {
  EventFrameSchema,
  HelloFrameSchema,
  MailboxAckParamsSchema,
  MailboxListParamsSchema,
  MailboxMessageSchema,
  OrquestaEventSchema,
  ReadyFrameSchema,
  RequestFrameSchema,
  ResponseFrameSchema,
  RpcFrameSchema,
  type RpcFrameInput,
} from "./schemas.ts";
export type {
  AgentId,
  AgentLoopDetectedEvent,
  ChannelId,
  InterruptionPolicy,
  MailboxMessage,
  MailboxMessageReceivedEvent,
  MessageId,
  OrquestaEvent,
  RpcErrorPayload,
  RpcMethodMap,
  RpcMethodName,
  RpcMethodParams,
  RpcMethodResult,
  RpcRequestId,
} from "./types.ts";
