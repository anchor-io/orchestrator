# Orquesta Core Context

`@anchorsoft/orquesta-core` owns orchestration-domain TypeScript that can be shared by the Orquesta apps without depending on a specific UI or runtime shell.

## Boundaries

- The public package surface is the root barrel at `src/index.ts`.
- Keep `package.json` `exports` limited to `.`; do not expose deep imports.
- Keep Electron, SvelteKit, and other shell-specific code in their app packages.
- Use Vitest for package-level unit tests in a Node environment.

## Current State

The package is scaffolded as a private source-first workspace package. Add public APIs to `src/index.ts` as orchestration primitives move into core.

## Domain Terms

- `OrquestaAgent`: A uniform Orquesta wrapper around one Pi `RpcClient` process with the Orquesta Pi Extension loaded. Main agents and subagents use this same abstraction.
- `AgentRegistry`: The Orquesta Core owner for multiple live `OrquestaAgent` instances. It is responsible for live-agent lookup, event fan-out, and clean shutdown. It does not model graph nodes, agent hierarchy, or message handoff.
- `Orquesta Pi Extension`: The Pi-side adapter that is part of every `OrquestaAgent`, allowing Orquesta-managed Pi agents to call back into Orquesta coordination APIs.
- `Orquesta RPC Origin`: The local origin of the running Orquesta server that hosts the Orquesta RPC endpoint. The app/server layer resolves the origin; Orquesta Core only carries it into agent bootstrap.
- `Orquesta Event`: A coordination event delivered from Orquesta to an `OrquestaAgent` through the Orquesta Pi Extension. Events declare an interruption policy that determines how they enter the agent's work.
- `Interruption Policy`: The delivery behavior for an `Orquesta Event`. `defer` injects the event into the next safe agent turn prompt or result, `steer` sends the event as steering input, and `interrupt` stops the current agent turn before sending the event as a new prompt.

## Future Direction

Orquesta is expected to grow into a node-based coding-agent orchestration system, similar in shape to visual workflow tools such as n8n. A future node editor will let users design orchestration flows as nodes with input and output channels. Some nodes will own one live `OrquestaAgent`, while others may call external APIs, transform messages, or run custom middleware code without owning an agent.

The `AgentRegistry` should stay below that graph runtime. It tracks agent processes, not orchestration nodes or graph edges. Future graph-level concepts such as channels, fan-out from one output to many downstream nodes, bidirectional message routing, node hooks, and middleware nodes should be modeled in a higher-level runtime that can reference registry-managed agents when a node owns one.
