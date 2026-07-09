import { describe, expect, it } from "vitest";
import { AgentRpcClient } from "./client.ts";
import { OrquestaRpcService, type AgentRpcSocket } from "./server.ts";

class MemorySocket implements AgentRpcSocket {
  readonly sent: string[] = [];
  closed: { code: number | undefined; reason: string | undefined } | undefined;

  send(data: string): void {
    this.sent.push(data);
  }

  close(code?: number, reason?: string): void {
    this.closed = { code, reason };
  }
}

describe("OrquestaRpcService", () => {
  it("authenticates an agent connection with hello", async () => {
    expect.assertions(2);
    const service = new OrquestaRpcService();
    service.registerAgent("agent-a", "token-a");
    const socket = new MemorySocket();
    const session = service.acceptSocket(socket);

    await session.receive(JSON.stringify({ kind: "hello", agentId: "agent-a", token: "token-a" }));

    expect(socket.closed).toBeUndefined();
    expect(socket.sent.map((frame) => JSON.parse(frame))).toEqual([
      { kind: "ready", agentId: "agent-a" },
    ]);
  });

  it("rejects frames before hello", async () => {
    expect.assertions(1);
    const service = new OrquestaRpcService();
    const socket = new MemorySocket();
    const session = service.acceptSocket(socket);

    await session.receive(
      JSON.stringify({ kind: "request", id: "1", method: "mailbox.list", params: {} }),
    );

    expect(socket.closed).toEqual({ code: 1008, reason: "Agent RPC hello required" });
  });

  it("sends mailbox events over the recipient agent connection", async () => {
    expect.assertions(4);
    const service = new OrquestaRpcService();
    service.registerAgent("agent-a", "token-a");
    service.registerAgent("agent-b", "token-b");
    service.configureMailboxAgent("agent-a", ["review"]);
    service.configureMailboxAgent("agent-b", ["review"]);

    const aSocket = new MemorySocket();
    const bSocket = new MemorySocket();
    const aSession = service.acceptSocket(aSocket);
    const bSession = service.acceptSocket(bSocket);
    await aSession.receive(JSON.stringify({ kind: "hello", agentId: "agent-a", token: "token-a" }));
    await bSession.receive(JSON.stringify({ kind: "hello", agentId: "agent-b", token: "token-b" }));

    await aSession.receive(
      JSON.stringify({
        kind: "request",
        id: "request-1",
        method: "channel.send",
        params: { channelId: "review", body: "read hooks.server.ts" },
      }),
    );

    const response = JSON.parse(aSocket.sent[1] ?? "{}");
    const event = JSON.parse(bSocket.sent[1] ?? "{}");
    expect(response).toEqual(
      expect.objectContaining({
        kind: "response",
        id: "request-1",
      }),
    );
    expect(response.result.deliveredTo).toEqual(["agent-b"]);
    expect(event.kind).toBe("event");
    expect(event.event).toEqual(
      expect.objectContaining({
        type: "mailbox.message_received",
        recipientAgentId: "agent-b",
        interruption: "defer",
        durable: true,
      }),
    );
  });

  it("lets the typed client call server methods over a memory transport", async () => {
    expect.assertions(1);
    const service = new OrquestaRpcService();
    service.registerAgent("agent-a", "token-a");
    service.configureMailboxAgent("agent-a", ["review"]);
    const socket = new MemorySocket();
    const session = service.acceptSocket(socket);
    const client = new AgentRpcClient({
      agentId: "agent-a",
      token: "token-a",
      createId: () => "request-1",
      transport: {
        send: (data) => {
          void session.receive(data).then(async () => {
            while (socket.sent.length > 0) await client.receive(socket.sent.shift() ?? "{}");
          });
        },
      },
    });

    client.hello();
    const result = await client.call("mailbox.list", {});

    expect(result).toEqual({ messages: [] });
  });
});
