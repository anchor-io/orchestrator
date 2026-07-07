import { beforeEach, describe, expect, it, vi } from "vitest";

type MockAgentEvent = { type: string; [key: string]: unknown };
type MockEventListener = (event: MockAgentEvent) => void;

interface MockRpcClient {
  readonly listeners: MockEventListener[];
  started: boolean;
  stopped: boolean;
  switchedSessionPath: string | undefined;
  emit(event: MockAgentEvent): void;
}

const rpc = vi.hoisted(() => ({
  clients: [] as MockRpcClient[],
}));

vi.mock("@earendil-works/pi-coding-agent", () => {
  class RpcClient implements MockRpcClient {
    readonly listeners: MockEventListener[] = [];
    started = false;
    stopped = false;
    switchedSessionPath: string | undefined;

    constructor() {
      rpc.clients.push(this);
    }

    async start(): Promise<void> {
      this.started = true;
    }

    async stop(): Promise<void> {
      this.stopped = true;
    }

    onEvent(listener: MockEventListener): () => void {
      this.listeners.push(listener);
      return () => {
        const index = this.listeners.indexOf(listener);
        if (index !== -1) this.listeners.splice(index, 1);
      };
    }

    async switchSession(sessionPath: string): Promise<{ cancelled: boolean }> {
      this.switchedSessionPath = sessionPath;
      return { cancelled: false };
    }

    emit(event: MockAgentEvent): void {
      for (const listener of this.listeners) listener(event);
    }
  }

  return { RpcClient };
});

import { AgentRegistry } from "../index.ts";

describe("AgentRegistry", () => {
  beforeEach(() => {
    rpc.clients.length = 0;
  });

  it("spawns an OrquestaAgent and lists the live agents", async () => {
    const registry = new AgentRegistry();

    const agent = await registry.spawnAgent({
      id: "agent-1",
      cwd: "/workspace",
      sessionPath: "/sessions/agent-1.jsonl",
    });
    const client = onlyClient();

    expect(client.started).toBe(true);
    expect(client.switchedSessionPath).toBe("/sessions/agent-1.jsonl");
    expect(agent.id).toBe("agent-1");
    expect(agent.cwd).toBe("/workspace");
    expect(agent.sessionPath).toBe("/sessions/agent-1.jsonl");
    expect(agent.state).toBe("idle");
    expect(registry.getAgent(agent.id)).toBe(agent);
    expect(registry.listAgents()).toEqual([agent]);
  });

  it("fans out agent events while the agent owns lifecycle state", async () => {
    const registry = new AgentRegistry();
    const events: unknown[] = [];
    registry.onAgentEvent((event) => events.push(event));

    const agent = await registry.spawnAgent({ id: "agent-1" });
    const client = onlyClient();

    client.emit({ type: "agent_start" });

    expect(agent.state).toBe("running");
    expect(events).toEqual([
      expect.objectContaining({
        agentId: agent.id,
        event: expect.objectContaining({ type: "agent_start" }),
      }),
    ]);

    client.emit({ type: "agent_end", messages: [] });

    expect(agent.state).toBe("idle");
  });

  it("stops one agent and removes it from the live registry", async () => {
    const registry = new AgentRegistry();
    const events: unknown[] = [];
    registry.onAgentEvent((event) => events.push(event));

    const agent = await registry.spawnAgent({ id: "agent-1" });
    const client = onlyClient();

    await registry.stopAgent(agent.id);

    expect(client.stopped).toBe(true);
    expect(agent.state).toBe("stopped");
    expect(registry.getAgent(agent.id)).toBeUndefined();
    expect(registry.listAgents()).toEqual([]);

    client.emit({ type: "agent_start" });
    expect(events).toEqual([]);
  });

  it("stops all live agents", async () => {
    const registry = new AgentRegistry();
    const first = await registry.spawnAgent({ id: "agent-1" });
    const second = await registry.spawnAgent({ id: "agent-2" });
    const firstClient = rpc.clients[0];
    const secondClient = rpc.clients[1];
    if (!firstClient || !secondClient) throw new Error("Expected two RPC clients");

    await registry.stopAll();

    expect(first.state).toBe("stopped");
    expect(second.state).toBe("stopped");
    expect(firstClient.stopped).toBe(true);
    expect(secondClient.stopped).toBe(true);
    expect(registry.listAgents()).toEqual([]);
  });
});

function onlyClient(): MockRpcClient {
  const client = rpc.clients[0];
  if (!client) throw new Error("Expected one RPC client");
  return client;
}
