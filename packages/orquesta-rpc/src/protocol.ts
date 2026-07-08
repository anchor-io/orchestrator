import * as v from "valibot";
import { RpcFrameSchema } from "./schemas.ts";
import type {
  AgentId,
  OrquestaEvent,
  RpcErrorPayload,
  RpcMethodName,
  RpcMethodParams,
  RpcMethodResult,
  RpcRequestId,
} from "./types.ts";

export type ClientToServerFrame = AgentRpcHelloFrame | RpcRequestFrame | RpcResponseFrame;
export type ServerToClientFrame =
  | AgentRpcReadyFrame
  | OrquestaEventFrame
  | RpcRequestFrame
  | RpcResponseFrame;
export type RpcFrame = ClientToServerFrame | ServerToClientFrame;

export interface AgentRpcHelloFrame {
  kind: "hello";
  agentId: AgentId;
  token: string;
}

export interface AgentRpcReadyFrame {
  kind: "ready";
  agentId: AgentId;
}

export interface RpcRequestFrame<M extends RpcMethodName = RpcMethodName> {
  kind: "request";
  id: RpcRequestId;
  method: M;
  params: RpcMethodParams<M>;
}

export interface RpcResponseFrame {
  kind: "response";
  id: RpcRequestId;
  result?: unknown;
  error?: RpcErrorPayload;
}

export interface OrquestaEventFrame {
  kind: "event";
  event: OrquestaEvent;
}

export class RpcProtocolError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "RpcProtocolError";
    this.code = code;
  }
}

export function encodeFrame(frame: RpcFrame): string {
  return JSON.stringify(frame);
}

export function decodeFrame(data: string): RpcFrame {
  let value: unknown;
  try {
    value = JSON.parse(data);
  } catch {
    throw new RpcProtocolError("invalid_json", "Invalid RPC frame JSON");
  }

  const result = v.safeParse(RpcFrameSchema, value);
  if (!result.success) throw new RpcProtocolError("invalid_frame", "Invalid RPC frame");
  return result.output as RpcFrame;
}

export function methodResult<M extends RpcMethodName>(
  result: RpcMethodResult<M>,
): RpcMethodResult<M> {
  return result;
}
