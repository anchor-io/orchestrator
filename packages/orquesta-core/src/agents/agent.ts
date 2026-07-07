import {
  RpcClient,
  type RpcClientOptions,
  type RpcEventListener,
} from "@earendil-works/pi-coding-agent";
import path from "node:path";
import { fileURLToPath } from "url";
import { globalConfigDir, type PiConfig } from "../config/index.ts";

const piIndex = import.meta.resolve("@earendil-works/pi-coding-agent");
const cliPath = fileURLToPath(new URL("./cli.js", piIndex));

export type RpcClientInstance = InstanceType<typeof RpcClient>;

export interface OrquestaAgentOptions {
  /** Working directory for the agent. */
  cwd?: string;
  /** Existing session file to switch to after startup. */
  sessionPath?: string;
  /** Pi-specific config loaded from Orquesta's config. */
  pi?: PiConfig;
  tools?: string[];
  excludeTools?: string[];
  extraArgs?: string[];
  /** Additional environment variables for the child process. */
  env?: Record<string, string>;
  /** Escape hatch for per-agent Pi CLI args. Prefer the typed options when possible. */
  args?: string[];
}

export class OrquestaAgent {
  #pi: RpcClientInstance;
  #sessionPath: string | undefined;

  constructor(options: OrquestaAgentOptions = {}) {
    this.#sessionPath = options.sessionPath;
    this.#pi = new RpcClient(toRpcClientOptions(options));
  }

  async start(): Promise<void> {
    await this.#pi.start();
    if (this.#sessionPath) {
      await this.#pi.switchSession(this.#sessionPath);
    }
  }

  stop(): ReturnType<RpcClientInstance["stop"]> {
    return this.#pi.stop();
  }

  onEvent(listener: RpcEventListener): ReturnType<RpcClientInstance["onEvent"]> {
    return this.#pi.onEvent(listener);
  }

  getStderr(): ReturnType<RpcClientInstance["getStderr"]> {
    return this.#pi.getStderr();
  }

  prompt(
    ...args: Parameters<RpcClientInstance["prompt"]>
  ): ReturnType<RpcClientInstance["prompt"]> {
    return this.#pi.prompt(...args);
  }

  steer(...args: Parameters<RpcClientInstance["steer"]>): ReturnType<RpcClientInstance["steer"]> {
    return this.#pi.steer(...args);
  }

  followUp(
    ...args: Parameters<RpcClientInstance["followUp"]>
  ): ReturnType<RpcClientInstance["followUp"]> {
    return this.#pi.followUp(...args);
  }

  abort(): ReturnType<RpcClientInstance["abort"]> {
    return this.#pi.abort();
  }

  newSession(
    ...args: Parameters<RpcClientInstance["newSession"]>
  ): ReturnType<RpcClientInstance["newSession"]> {
    return this.#pi.newSession(...args);
  }

  getState(): ReturnType<RpcClientInstance["getState"]> {
    return this.#pi.getState();
  }

  setModel(
    ...args: Parameters<RpcClientInstance["setModel"]>
  ): ReturnType<RpcClientInstance["setModel"]> {
    return this.#pi.setModel(...args);
  }

  cycleModel(): ReturnType<RpcClientInstance["cycleModel"]> {
    return this.#pi.cycleModel();
  }

  getAvailableModels(): ReturnType<RpcClientInstance["getAvailableModels"]> {
    return this.#pi.getAvailableModels();
  }

  setThinkingLevel(
    ...args: Parameters<RpcClientInstance["setThinkingLevel"]>
  ): ReturnType<RpcClientInstance["setThinkingLevel"]> {
    return this.#pi.setThinkingLevel(...args);
  }

  cycleThinkingLevel(): ReturnType<RpcClientInstance["cycleThinkingLevel"]> {
    return this.#pi.cycleThinkingLevel();
  }

  setSteeringMode(
    ...args: Parameters<RpcClientInstance["setSteeringMode"]>
  ): ReturnType<RpcClientInstance["setSteeringMode"]> {
    return this.#pi.setSteeringMode(...args);
  }

  setFollowUpMode(
    ...args: Parameters<RpcClientInstance["setFollowUpMode"]>
  ): ReturnType<RpcClientInstance["setFollowUpMode"]> {
    return this.#pi.setFollowUpMode(...args);
  }

  compact(
    ...args: Parameters<RpcClientInstance["compact"]>
  ): ReturnType<RpcClientInstance["compact"]> {
    return this.#pi.compact(...args);
  }

  setAutoCompaction(
    ...args: Parameters<RpcClientInstance["setAutoCompaction"]>
  ): ReturnType<RpcClientInstance["setAutoCompaction"]> {
    return this.#pi.setAutoCompaction(...args);
  }

  setAutoRetry(
    ...args: Parameters<RpcClientInstance["setAutoRetry"]>
  ): ReturnType<RpcClientInstance["setAutoRetry"]> {
    return this.#pi.setAutoRetry(...args);
  }

  abortRetry(): ReturnType<RpcClientInstance["abortRetry"]> {
    return this.#pi.abortRetry();
  }

  bash(...args: Parameters<RpcClientInstance["bash"]>): ReturnType<RpcClientInstance["bash"]> {
    return this.#pi.bash(...args);
  }

  abortBash(): ReturnType<RpcClientInstance["abortBash"]> {
    return this.#pi.abortBash();
  }

  getSessionStats(): ReturnType<RpcClientInstance["getSessionStats"]> {
    return this.#pi.getSessionStats();
  }

  exportHtml(
    ...args: Parameters<RpcClientInstance["exportHtml"]>
  ): ReturnType<RpcClientInstance["exportHtml"]> {
    return this.#pi.exportHtml(...args);
  }

  switchSession(
    ...args: Parameters<RpcClientInstance["switchSession"]>
  ): ReturnType<RpcClientInstance["switchSession"]> {
    return this.#pi.switchSession(...args);
  }

  fork(...args: Parameters<RpcClientInstance["fork"]>): ReturnType<RpcClientInstance["fork"]> {
    return this.#pi.fork(...args);
  }

  clone(): ReturnType<RpcClientInstance["clone"]> {
    return this.#pi.clone();
  }

  getForkMessages(): ReturnType<RpcClientInstance["getForkMessages"]> {
    return this.#pi.getForkMessages();
  }

  getEntries(
    ...args: Parameters<RpcClientInstance["getEntries"]>
  ): ReturnType<RpcClientInstance["getEntries"]> {
    return this.#pi.getEntries(...args);
  }

  getTree(): ReturnType<RpcClientInstance["getTree"]> {
    return this.#pi.getTree();
  }

  getLastAssistantText(): ReturnType<RpcClientInstance["getLastAssistantText"]> {
    return this.#pi.getLastAssistantText();
  }

  setSessionName(
    ...args: Parameters<RpcClientInstance["setSessionName"]>
  ): ReturnType<RpcClientInstance["setSessionName"]> {
    return this.#pi.setSessionName(...args);
  }

  getMessages(): ReturnType<RpcClientInstance["getMessages"]> {
    return this.#pi.getMessages();
  }

  getCommands(): ReturnType<RpcClientInstance["getCommands"]> {
    return this.#pi.getCommands();
  }

  waitForIdle(
    ...args: Parameters<RpcClientInstance["waitForIdle"]>
  ): ReturnType<RpcClientInstance["waitForIdle"]> {
    return this.#pi.waitForIdle(...args);
  }

  collectEvents(
    ...args: Parameters<RpcClientInstance["collectEvents"]>
  ): ReturnType<RpcClientInstance["collectEvents"]> {
    return this.#pi.collectEvents(...args);
  }

  promptAndWait(
    ...args: Parameters<RpcClientInstance["promptAndWait"]>
  ): ReturnType<RpcClientInstance["promptAndWait"]> {
    return this.#pi.promptAndWait(...args);
  }
}

function toRpcClientOptions(options: OrquestaAgentOptions): RpcClientOptions {
  const pi = options.pi;
  const args: string[] = [];

  if (options.tools?.length) args.push("--tools", options.tools.join(","));
  if (options.excludeTools?.length) args.push("--exclude-tools", options.excludeTools.join(","));
  if (options.extraArgs) args.push(...options.extraArgs);
  if (options.args) args.push(...options.args);

  const env = { ...options.env };
  const orquestaConfigDir = globalConfigDir({ ...process.env, ...options.env });
  const defaultPiAgentDir = path.join(orquestaConfigDir, ".pi", "agent");

  env.PI_CODING_AGENT_DIR = pi?.agentDir ?? defaultPiAgentDir;
  env.PI_CODING_AGENT_SESSION_DIR = pi?.sessionDir ?? path.join(defaultPiAgentDir, "sessions");

  const rpcOptions: RpcClientOptions = { cliPath, env, args };
  if (options.cwd) rpcOptions.cwd = options.cwd;

  return rpcOptions;
}
