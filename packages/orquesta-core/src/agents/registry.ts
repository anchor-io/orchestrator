import type { RpcEventListener } from "@earendil-works/pi-coding-agent";
import { OrquestaAgent, type AgentId, type OrquestaAgentOptions } from "./agent.ts";

type AgentEvent = Parameters<RpcEventListener>[0];

export interface AgentRegistryEvent {
  agentId: AgentId;
  event: AgentEvent;
}

export type AgentRegistryEventListener = (event: AgentRegistryEvent) => void;

/**
 * Tracks live Orquesta agents and exposes one aggregate event stream for them.
 *
 * It only keeps the live agent collection, forwards each agent event as
 * `{ agentId, event }`, and provides shutdown helpers.
 */
export class AgentRegistry {
  #agents = new Map<AgentId, OrquestaAgent>();
  #eventListeners = new Set<AgentRegistryEventListener>();
  #unsubscribers = new Map<AgentId, () => void>();

  async spawnAgent(options: OrquestaAgentOptions = {}): Promise<OrquestaAgent> {
    const agent = new OrquestaAgent(options);
    this.#agents.set(agent.id, agent);

    const unsubscribe = agent.onEvent((event) => this.#emitAgentEvent(agent.id, event));
    this.#unsubscribers.set(agent.id, unsubscribe);

    try {
      await agent.start();
      return agent;
    } catch (error) {
      this.#removeAgent(agent.id);
      throw error;
    }
  }

  getAgent(id: AgentId): OrquestaAgent | undefined {
    return this.#agents.get(id);
  }

  listAgents(): OrquestaAgent[] {
    return Array.from(this.#agents.values());
  }

  async stopAgent(id: AgentId): Promise<void> {
    const agent = this.#agents.get(id);
    if (!agent) return;

    await agent.stop();
    this.#removeAgent(id);
  }

  async stopAll(): Promise<void> {
    await Promise.all(Array.from(this.#agents.keys(), (id) => this.stopAgent(id)));
  }

  /**
   * Subscribe to all live-agent events through one stream.
   *
   * Returns a cleanup function for this registry-level listener. This does not
   * stop any agent process.
   */
  onAgentEvent(listener: AgentRegistryEventListener): () => void {
    this.#eventListeners.add(listener);
    return () => this.#eventListeners.delete(listener);
  }

  #emitAgentEvent(agentId: AgentId, event: AgentEvent): void {
    for (const listener of this.#eventListeners) listener({ agentId, event });
  }

  #removeAgent(id: AgentId): void {
    this.#unsubscribers.get(id)?.();
    this.#unsubscribers.delete(id);
    this.#agents.delete(id);
  }
}
