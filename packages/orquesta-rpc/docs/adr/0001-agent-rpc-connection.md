# 0001. Agent RPC Connection

## Status

Accepted

## Context

Orquesta RPC is an internal embedded integration surface. Orquesta, the Orquesta Pi integration, and the RPC package are distributed together, so public API version drift is not a primary design concern. The future SQLite store will handle persisted-data evolution with migrations.

The initial prototype used a SvelteKit-mounted HTTP endpoint and raw `fetch` calls from a Pi extension to implement mailbox/channel message passing. That proved the coordination idea works, but the rewrite should not preserve the prototype's shape. Orquesta RPC needs one typed RPC surface that can grow beyond mailboxes while keeping agent lifecycle concerns out of the protocol layer.

`OrquestaAgent` is an Orquesta-managed Pi `RpcClient` process. The Orquesta Pi Extension is part of that agent identity because Orquesta coordination requires Pi-side behavior. At the same time, Orquesta Core should not implement plugin-to-RPC delivery semantics or know mailbox/channel method details.

Orquesta also needs to deliver events to agents. Some events should not interrupt current work, such as mailbox notifications. Other events may need to steer active work, and safety/control events such as anti-loop interventions may need to stop the current turn and start fresh work.

## Decision

Orquesta RPC will expose one typed internal RPC endpoint backed by a persistent WebSocket connection from each Orquesta Pi Extension. This `Agent RPC Connection` carries both agent-originated RPC method calls and Orquesta-originated events for that agent.

The Orquesta Pi Extension will live as its own package. It depends on Orquesta RPC contracts/client code and is always loaded for every `OrquestaAgent`. Orquesta Core owns Pi process lifecycle and always injects the extension, but it does not own RPC methods, mailbox/channel routing, WebSocket handling, or event delivery behavior.

The app/server composition layer resolves the local `Orquesta RPC Origin` from the running Orquesta server's bound configuration. Orquesta Core only carries the resolved bootstrap coordinates into the agent process. Users do not manually configure the RPC origin or connection environment.

An `Agent RPC Connection` starts with an `Agent RPC Hello` message containing the agent ID and a per-agent connection token. Duplicate connections for the same agent/token are invalid and should be rejected rather than handled with generation tracking.

Orquesta events declare an `Interruption Policy`:

1. `defer` injects the event into the next safe agent turn prompt or result.
2. `steer` sends the event as steering input.
3. `interrupt` stops the current agent turn before sending the event as a new prompt.

The Orquesta Pi Extension executes these delivery policies using Pi extension/session APIs. Orquesta Core observes resulting lifecycle/status changes through Pi events rather than applying interruption behavior itself.

If an `Agent RPC Connection` disconnects, the extension reconnects with bounded backoff. Disconnects are abnormal and should be surfaced, but the first design does not add elaborate duplicate-connection or generation machinery.

## Consequences

Orquesta RPC owns the typed method/event contracts, the single WebSocket RPC endpoint, server-side connection handling, and client abstractions. Hono/SvelteKit are adapters around that surface rather than the protocol model.

The Pi extension package becomes a first-class runtime adapter. It can grow dependencies, be bundled later if needed, and use Pi's extension package model instead of staying a dependency-free TypeScript file inside Orquesta Core.

Orquesta Core remains focused on agent lifecycle. It may spawn an agent with extension bootstrap coordinates, but it should not interpret RPC events, decide interruption behavior, or open WebSocket connections itself.

Core, the app/server layer, and future graph/classifier runtimes may all produce events. The app/server composition layer translates selected core-native events into Orquesta RPC events so core does not need to depend directly on Orquesta RPC protocol details.

The design intentionally prefers a local persistent WebSocket over prompt-embedded metadata, HTTP polling, or SSE. This avoids raw untyped plugin fetch calls, gives each live agent a presence-bearing connection, supports server-to-agent event push, and keeps both directions on one internal endpoint.
