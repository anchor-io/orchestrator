import { AgentSession, SessionManager } from "@earendil-works/pi-coding-agent";

export type OrquestaAgentConfig = {
  agentDir: string;
};

export class OrquestaAgent {
  agentDir: string;

  constructor(cfg: OrquestaAgentConfig) {
    this.agentDir = cfg.agentDir;
  }

    start() {

  }
}
