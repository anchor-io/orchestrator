import path from "node:path";
import {
  AuthStorage,
  createAgentSession,
  ModelRegistry,
  SessionManager,
  SettingsManager,
} from "@earendil-works/pi-coding-agent";

const cwd = process.cwd();
console.log(cwd);

// Custom Pi config dir.
// Pi will use this instead of ~/.pi/agent
const agentDir = path.resolve(".my-pi-agent");
const authPath = path.join(agentDir, "auth.json");
const modelsPath = path.join(agentDir, "models.json");

const settingsManager = SettingsManager.create(cwd, agentDir);
const sessionManager = SessionManager.create(cwd);
const authStorage = AuthStorage.create(authPath);
const modelRegistry = ModelRegistry.create(authStorage, modelsPath);

const errors = authStorage.drainErrors();
if (errors.length) {
  throw new Error(errors.map((e) => e.message).join("\n"));
}

const { session } = await createAgentSession({
  cwd,
  agentDir,
  settingsManager,
  sessionManager,
  authStorage,
  modelRegistry,
  tools: ["read", "grep", "find", "ls"],
});

session.subscribe((event) => {
  if (event.type === "message_update") {
    switch (event.assistantMessageEvent.type) {
      case "thinking_delta":
        process.stdout.write(`${event.assistantMessageEvent.delta}`);
        break;
      case "text_delta":
        process.stdout.write(`${event.assistantMessageEvent.delta}`);
        break;
      case "toolcall_delta":
        process.stdout.write(`${event.assistantMessageEvent.delta}`);
        break;
      case "thinking_start":
        process.stdout.write("\nTHINKING START:");
        break;
      case "text_start":
        process.stdout.write("\nTEXT START:");
        break;
      case "toolcall_start":
        process.stdout.write("\nTOOLCALL START:");
        break;
    }
  }
});

export async function runAgent() {
  try {
    const currModel = session.modelRegistry
      .getAvailable()
      .find((m) => m.id === "deepseek-v4-flash");
    await session.setModel(currModel!);
    session.setThinkingLevel("xhigh");

    await session.prompt("Hello");
  } finally {
    session.dispose();
    await settingsManager.flush();
  }
}
