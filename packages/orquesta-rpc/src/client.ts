import { randomUUID } from "node:crypto";
import { decodeFrame, encodeFrame, type RpcResponseFrame } from "./protocol.ts";
import type {
  AgentId,
  OrquestaEvent,
  RpcErrorPayload,
  RpcMethodName,
  RpcMethodParams,
  RpcMethodResult,
  RpcRequestId,
} from "./types.ts";

export interface RpcClientTransport {
  send(data: string): void;
  close?(): void;
}

export interface AgentRpcClientOptions {
  agentId: AgentId;
  token: string;
  transport: RpcClientTransport;
  createId?: () => RpcRequestId;
}

export type OrquestaEventListener = (event: OrquestaEvent) => void | Promise<void>;

export class AgentRpcClient {
  readonly agentId: AgentId;
  #token: string;
  #transport: RpcClientTransport;
  #createId: () => RpcRequestId;
  #eventListeners = new Set<OrquestaEventListener>();
  #pending = new Map<
    RpcRequestId,
    { resolve: (value: unknown) => void; reject: (error: Error) => void }
  >();

  constructor(options: AgentRpcClientOptions) {
    this.agentId = options.agentId;
    this.#token = options.token;
    this.#transport = options.transport;
    this.#createId = options.createId ?? randomUUID;
  }

  hello(): void {
    this.#transport.send(encodeFrame({ kind: "hello", agentId: this.agentId, token: this.#token }));
  }

  async call<M extends RpcMethodName>(
    method: M,
    params: RpcMethodParams<M>,
  ): Promise<RpcMethodResult<M>> {
    const id = this.#createId();
    const promise = new Promise<RpcMethodResult<M>>((resolve, reject) => {
      this.#pending.set(id, {
        resolve: (value) => resolve(value as RpcMethodResult<M>),
        reject,
      });
    });
    this.#transport.send(encodeFrame({ kind: "request", id, method, params }));
    return await promise;
  }

  onEvent(listener: OrquestaEventListener): () => void {
    this.#eventListeners.add(listener);
    return () => this.#eventListeners.delete(listener);
  }

  async receive(data: string): Promise<void> {
    const frame = decodeFrame(data);
    if (frame.kind === "event") {
      await Promise.all(
        Array.from(this.#eventListeners, (listener) => Promise.resolve(listener(frame.event))),
      );
      return;
    }
    if (frame.kind === "response") this.#handleResponse(frame);
  }

  close(): void {
    this.#transport.close?.();
    for (const pending of this.#pending.values()) {
      pending.reject(new Error("Agent RPC client closed"));
    }
    this.#pending.clear();
  }

  #handleResponse(frame: RpcResponseFrame): void {
    const pending = this.#pending.get(frame.id);
    if (!pending) return;
    this.#pending.delete(frame.id);

    if (frame.error) {
      pending.reject(new RpcCallError(frame.error));
      return;
    }
    pending.resolve(frame.result);
  }
}

export class RpcCallError extends Error {
  readonly code: string;

  constructor(error: RpcErrorPayload) {
    super(error.message);
    this.name = "RpcCallError";
    this.code = error.code;
  }
}
