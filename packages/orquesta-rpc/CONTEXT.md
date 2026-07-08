# Orquesta RPC Context

`@anchorsoft/orquesta-rpc` owns RPC infrastructure for Orquesta-to-agent coordination. Its first use case is mailbox/channel message passing between agents, but the package is not limited to mailboxes.

## Boundaries

- The public package surface is the root barrel at `src/index.ts`.
- Keep `package.json` `exports` limited to `.`; do not expose deep imports.
- RPC protocol and coordination APIs stay here.
- Mailbox and channel message-passing logic stays here while it is the active RPC use case.
- Agent management stays in `@anchorsoft/orquesta-core`.
- Use Vitest for package-level unit tests in a Node environment.

## Current State

The package currently has a throwaway prototype.

## Future Direction

This package will provide API abstractions to coordinate between agents and Orquesta Core. It sits above `@anchorsoft/orquesta-core` in the stack, handling RPC-backed coordination flows without owning agent lifecycle.

## Domain Terms

- `Orquesta RPC`: The package-level integration surface for RPC-backed coordination between Orquesta and agents. It is broader than mailbox or channel messaging.
- `Embedded RPC Surface`: Orquesta RPC is an internal embedded integration surface. Orquesta, its Pi integration, and this package are distributed together rather than consumed as independently versioned public APIs.
- `RPC Method`: A named internal operation exposed through the single Orquesta RPC endpoint. Methods are called through typed clients rather than ad-hoc raw fetch calls.
- `Orquesta RPC Origin`: The local origin of the running Orquesta server that hosts the Orquesta RPC endpoint. The app/server layer resolves it from the bound server configuration.
- `Agent RPC Connection`: The persistent WebSocket connection opened by an agent-side adapter to Orquesta RPC. It carries both agent-originated RPC method calls and Orquesta-originated events for that agent.
- `Agent RPC Hello`: The first typed message on an `Agent RPC Connection`, used to associate the connection with an agent ID and per-agent connection token.
- `Agent RPC Reconnect`: The agent-side behavior of reconnecting an `Agent RPC Connection` after a disconnect. Disconnects are abnormal but should be retried with bounded backoff.
- `Orquesta Event`: A coordination event delivered from Orquesta to an agent-side adapter. Events declare an interruption policy that determines how they enter the agent's work.
- `Interruption Policy`: The delivery behavior for an `Orquesta Event`. `defer` injects the event into the next safe agent turn prompt or result, `steer` sends the event as steering input, and `interrupt` stops the current agent turn before sending the event as a new prompt.
- `Mailbox`: A per-agent inbox of messages delivered by an Orquesta RPC coordination flow.
- `Channel`: A named routing group used by the mailbox message-passing flow.
