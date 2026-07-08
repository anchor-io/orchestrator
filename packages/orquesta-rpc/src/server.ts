import * as v from "valibot";
import { MailboxRuntime } from "./mailbox.ts";
import {
  ChannelSendParamsSchema,
  MailboxAckParamsSchema,
  MailboxListParamsSchema,
} from "./schemas.ts";
import { decodeFrame, encodeFrame, type RpcRequestFrame, RpcProtocolError } from "./protocol.ts";
import type {
  AgentId,
  OrquestaEvent,
  RpcErrorPayload,
  RpcMethodName,
  RpcMethodParams,
  RpcMethodResult,
} from "./types.ts";

export interface AgentRpcSocket {
  send(data: string): void;
  close(code?: number, reason?: string): void;
}

export interface RpcConnectionContext {
  agentId: AgentId;
}

type MethodHandler<M extends RpcMethodName> = (
  params: RpcMethodParams<M>,
  context: RpcConnectionContext,
) => RpcMethodResult<M> | Promise<RpcMethodResult<M>>;

type AnyMethodHandler = (params: unknown, context: RpcConnectionContext) => Promise<unknown>;

export interface OrquestaRpcServiceOptions {
  mailbox?: MailboxRuntime;
}

export class OrquestaRpcService {
  readonly mailbox: MailboxRuntime;
  readonly server: AgentRpcServer;

  constructor(options: OrquestaRpcServiceOptions = {}) {
    this.mailbox = options.mailbox ?? new MailboxRuntime();
    this.server = new AgentRpcServer();
    this.#registerMailboxMethods();
  }

  registerAgent(agentId: AgentId, token: string): void {
    this.server.registerAgent(agentId, token);
  }

  configureMailboxAgent(agentId: AgentId, channelIds: string[]): void {
    this.mailbox.configureAgent(agentId, channelIds);
  }

  publishEvent(event: OrquestaEvent): boolean {
    return this.server.publishEvent(event);
  }

  acceptSocket(socket: AgentRpcSocket): AgentRpcSession {
    return this.server.acceptSocket(socket);
  }

  #registerMailboxMethods(): void {
    this.server.registerMethod("mailbox.list", (params, context) => {
      v.parse(MailboxListParamsSchema, params);
      return { messages: this.mailbox.listMessages(context.agentId) };
    });

    this.server.registerMethod("mailbox.ack", (params, context) => {
      const parsed = v.parse(MailboxAckParamsSchema, params);
      return { ackedMessageIds: this.mailbox.ackMessages(context.agentId, parsed.messageIds) };
    });

    this.server.registerMethod("channel.send", (params, context) => {
      const parsed = v.parse(ChannelSendParamsSchema, params);
      const sent = this.mailbox.sendMessage(parsed.channelId, context.agentId, parsed.body);
      for (const recipientAgentId of sent.deliveredTo) {
        this.publishEvent({
          type: "mailbox.message_received",
          recipientAgentId,
          messageId: sent.message.id,
          channelId: sent.message.channelId,
          fromAgentId: sent.message.fromAgentId,
          preview: preview(sent.message.body),
          interruption: "defer",
          durable: true,
        });
      }
      return sent;
    });
  }
}

export class AgentRpcServer {
  #tokens = new Map<AgentId, string>();
  #connections = new Map<AgentId, AgentRpcSession>();
  #pendingEvents = new Map<AgentId, OrquestaEvent[]>();
  #handlers = new Map<RpcMethodName, AnyMethodHandler>();

  registerAgent(agentId: AgentId, token: string): void {
    this.#tokens.set(agentId, token);
  }

  registerMethod<M extends RpcMethodName>(method: M, handler: MethodHandler<M>): void {
    this.#handlers.set(method, (params, context) =>
      Promise.resolve(handler(params as RpcMethodParams<M>, context)),
    );
  }

  acceptSocket(socket: AgentRpcSocket): AgentRpcSession {
    return new AgentRpcSession(this, socket);
  }

  publishEvent(event: OrquestaEvent): boolean {
    const connection = this.#connections.get(event.recipientAgentId);
    if (connection) {
      connection.sendEvent(event);
      return true;
    }

    if (event.durable) {
      const pending = this.#pendingEvents.get(event.recipientAgentId) ?? [];
      pending.push(event);
      this.#pendingEvents.set(event.recipientAgentId, pending);
    }

    return false;
  }

  async handleFrame(session: AgentRpcSession, raw: string): Promise<void> {
    let frame;
    try {
      frame = decodeFrame(raw);
    } catch (error) {
      this.#closeProtocolError(session, error);
      return;
    }

    if (!session.agentId) {
      if (frame.kind !== "hello") {
        session.close(1008, "Agent RPC hello required");
        return;
      }
      this.#handleHello(session, frame.agentId, frame.token);
      return;
    }

    if (frame.kind === "request") await this.#handleRequest(session, frame);
  }

  disconnect(session: AgentRpcSession): void {
    if (session.agentId && this.#connections.get(session.agentId) === session) {
      this.#connections.delete(session.agentId);
    }
  }

  #handleHello(session: AgentRpcSession, agentId: AgentId, token: string): void {
    if (this.#tokens.get(agentId) !== token) {
      session.close(1008, "Invalid Agent RPC hello");
      return;
    }
    if (this.#connections.has(agentId)) {
      session.close(1008, "Duplicate Agent RPC connection");
      return;
    }

    session.agentId = agentId;
    this.#connections.set(agentId, session);
    session.send({ kind: "ready", agentId });

    const pendingEvents = this.#pendingEvents.get(agentId) ?? [];
    this.#pendingEvents.delete(agentId);
    for (const event of pendingEvents) session.sendEvent(event);
  }

  async #handleRequest(session: AgentRpcSession, frame: RpcRequestFrame): Promise<void> {
    const handler = this.#handlers.get(frame.method);
    if (!handler) {
      session.sendError(frame.id, {
        code: "unknown_method",
        message: `Unknown RPC method ${frame.method}`,
      });
      return;
    }

    try {
      const result = await handler(frame.params, { agentId: session.agentIdOrThrow() });
      session.send({ kind: "response", id: frame.id, result });
    } catch (error) {
      session.sendError(frame.id, toRpcError(error));
    }
  }

  #closeProtocolError(session: AgentRpcSession, error: unknown): void {
    const reason = error instanceof RpcProtocolError ? error.message : "Invalid RPC frame";
    session.close(1008, reason);
  }
}

export class AgentRpcSession {
  agentId: AgentId | undefined;
  #server: AgentRpcServer;
  #socket: AgentRpcSocket;
  #closed = false;

  constructor(server: AgentRpcServer, socket: AgentRpcSocket) {
    this.#server = server;
    this.#socket = socket;
  }

  async receive(data: string): Promise<void> {
    if (this.#closed) return;
    await this.#server.handleFrame(this, data);
  }

  send(frame: Parameters<typeof encodeFrame>[0]): void {
    if (!this.#closed) this.#socket.send(encodeFrame(frame));
  }

  sendEvent(event: OrquestaEvent): void {
    this.send({ kind: "event", event });
  }

  sendError(id: string, error: RpcErrorPayload): void {
    this.send({ kind: "response", id, error });
  }

  close(code?: number, reason?: string): void {
    if (this.#closed) return;
    this.#closed = true;
    this.#server.disconnect(this);
    this.#socket.close(code, reason);
  }

  agentIdOrThrow(): AgentId {
    if (!this.agentId) throw new Error("Agent RPC session is not authenticated");
    return this.agentId;
  }
}

function toRpcError(error: unknown): RpcErrorPayload {
  if (error instanceof Error) return { code: "method_failed", message: error.message };
  return { code: "method_failed", message: String(error) };
}

function preview(body: string): string {
  return body.length > 160 ? `${body.slice(0, 157)}...` : body;
}
