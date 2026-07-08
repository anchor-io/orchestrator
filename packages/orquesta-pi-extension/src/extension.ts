import { AgentRpcClient, type OrquestaEvent } from "@anchorsoft/orquesta-rpc";
import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";

const DEFAULT_RECONNECT_MS = 1_000;
const MAX_RECONNECT_MS = 10_000;

interface Bootstrap {
  agentId: string;
  token: string;
  rpcOrigin: string;
}

interface RuntimeState {
  context: ExtensionContext | undefined;
  socket: WebSocket | undefined;
  client: AgentRpcClient | undefined;
  reconnectMs: number;
  reconnectTimer: ReturnType<typeof setTimeout> | undefined;
}

const SendMessageParams = Type.Object({
  channelId: Type.String({ description: "Channel to send the message to." }),
  body: Type.String({ description: "Message body to share with the channel." }),
});

const AckMailboxParams = Type.Object({
  messageIds: Type.Array(Type.String(), { description: "Mailbox message IDs to acknowledge." }),
});

const EmptyParams = Type.Object({});

export default function orquestaPiExtension(pi: ExtensionAPI) {
  const bootstrap = readBootstrap(process.env);
  const state: RuntimeState = {
    context: undefined,
    socket: undefined,
    client: undefined,
    reconnectMs: DEFAULT_RECONNECT_MS,
    reconnectTimer: undefined,
  };

  pi.on("session_start", (_event, ctx) => {
    state.context = ctx;
  });
  pi.on("turn_start", (_event, ctx) => {
    state.context = ctx;
  });
  pi.on("turn_end", (_event, ctx) => {
    state.context = ctx;
  });
  pi.on("session_shutdown", () => {
    if (state.reconnectTimer) clearTimeout(state.reconnectTimer);
    state.socket?.close();
  });

  if (bootstrap) connect(pi, state, bootstrap);

  pi.registerTool({
    name: "orquesta_check_mailbox",
    label: "Check Orquesta mailbox",
    description: "Check unread Orquesta mailbox messages for this agent.",
    promptSnippet: "Check Orquesta mailbox messages sent by collaborator agents.",
    promptGuidelines: [
      "Use orquesta_check_mailbox when Orquesta reports deferred mailbox activity.",
      "After processing mailbox messages, acknowledge them with orquesta_ack_mailbox.",
    ],
    parameters: EmptyParams,
    async execute() {
      const client = requireClient(state);
      const response = await client.call("mailbox.list", {});
      return {
        content: [{ type: "text", text: formatMailbox(response.messages) }],
        details: response,
      };
    },
  });

  pi.registerTool({
    name: "orquesta_send_channel_message",
    label: "Send Orquesta channel message",
    description: "Send a message to collaborators on an Orquesta channel.",
    promptSnippet: "Send short findings or coordination notes to an Orquesta channel.",
    promptGuidelines: [
      "Use orquesta_send_channel_message for findings collaborators should know while they work.",
      "Keep Orquesta channel messages concise and actionable.",
    ],
    parameters: SendMessageParams,
    async execute(_toolCallId, params) {
      const client = requireClient(state);
      const response = await client.call("channel.send", {
        channelId: params.channelId,
        body: params.body,
      });
      return {
        content: [
          {
            type: "text",
            text: `Sent Orquesta channel message to ${response.deliveredTo.length} recipient(s).`,
          },
        ],
        details: response,
      };
    },
  });

  pi.registerTool({
    name: "orquesta_ack_mailbox",
    label: "Acknowledge Orquesta mailbox messages",
    description: "Mark Orquesta mailbox messages as read after processing them.",
    parameters: AckMailboxParams,
    async execute(_toolCallId, params) {
      const client = requireClient(state);
      const response = await client.call("mailbox.ack", { messageIds: params.messageIds });
      return {
        content: [
          { type: "text", text: `Acknowledged ${response.ackedMessageIds.length} message(s).` },
        ],
        details: response,
      };
    },
  });
}

function connect(pi: ExtensionAPI, state: RuntimeState, bootstrap: Bootstrap): void {
  const socket = new WebSocket(toWsUrl(bootstrap.rpcOrigin));
  state.socket = socket;

  const client = new AgentRpcClient({
    agentId: bootstrap.agentId,
    token: bootstrap.token,
    transport: {
      send: (data) => socket.send(data),
      close: () => socket.close(),
    },
  });
  state.client = client;
  client.onEvent((event) => applyEvent(pi, state, event));

  socket.addEventListener("open", () => {
    state.reconnectMs = DEFAULT_RECONNECT_MS;
    client.hello();
  });
  socket.addEventListener("message", (event) => {
    if (typeof event.data === "string") void client.receive(event.data);
  });
  socket.addEventListener("close", () => {
    state.socket = undefined;
    state.client = undefined;
    scheduleReconnect(pi, state, bootstrap);
  });
}

function scheduleReconnect(pi: ExtensionAPI, state: RuntimeState, bootstrap: Bootstrap): void {
  if (state.reconnectTimer) clearTimeout(state.reconnectTimer);
  const delay = state.reconnectMs;
  state.reconnectMs = Math.min(state.reconnectMs * 2, MAX_RECONNECT_MS);
  state.reconnectTimer = setTimeout(() => connect(pi, state, bootstrap), delay);
}

function applyEvent(pi: ExtensionAPI, state: RuntimeState, event: OrquestaEvent): void {
  const text = renderEvent(event);
  if (event.interruption === "defer") {
    pi.sendMessage(
      {
        customType: "orquesta.event",
        content: text,
        display: false,
        details: event,
      },
      { deliverAs: "nextTurn" },
    );
    return;
  }

  if (event.interruption === "steer") {
    pi.sendUserMessage(text, { deliverAs: "steer" });
    return;
  }

  state.context?.abort();
  pi.sendUserMessage(text);
}

function readBootstrap(env: NodeJS.ProcessEnv): Bootstrap | undefined {
  const agentId = env.ORQUESTA_AGENT_ID;
  const token = env.ORQUESTA_AGENT_RPC_TOKEN;
  const rpcOrigin = env.ORQUESTA_RPC_ORIGIN;
  if (!agentId || !token || !rpcOrigin) return undefined;
  return { agentId, token, rpcOrigin };
}

function toWsUrl(origin: string): string {
  const url = new URL("/internal/orquesta-rpc", origin);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  return url.toString();
}

function requireClient(state: RuntimeState): AgentRpcClient {
  if (!state.client) throw new Error("Orquesta RPC connection is not available.");
  return state.client;
}

function renderEvent(event: OrquestaEvent): string {
  if (event.type === "mailbox.message_received") {
    return `Orquesta mailbox message ${event.messageId} arrived on ${event.channelId} from ${event.fromAgentId}: ${event.preview}`;
  }
  return `Orquesta detected an agent loop: ${event.reason}`;
}

function formatMailbox(
  messages: {
    id: string;
    channelId: string;
    fromAgentId: string;
    body: string;
    createdAt: string;
  }[],
): string {
  if (messages.length === 0) return "No unread Orquesta mailbox messages.";
  return messages
    .map(
      (message) =>
        `Message ${message.id} on ${message.channelId} from ${message.fromAgentId} at ${message.createdAt}:\n${message.body}`,
    )
    .join("\n\n");
}
