# Orquesta Pi Extension Context

`@anchorsoft/orquesta-pi-extension` owns the Pi-side adapter for Orquesta RPC. It is part of every `OrquestaAgent` and connects the Pi extension runtime to Orquesta's typed RPC surface.

## Boundaries

- The public package surface is the root barrel at `src/index.ts`.
- Keep Pi-specific tool registration and event delivery behavior here.
- Keep RPC protocol contracts and server/client primitives in `@anchorsoft/orquesta-rpc`.
- Keep agent process lifecycle in `@anchorsoft/orquesta-core`.
- Use Vitest for package-level unit tests in a Node environment.

## Domain Terms

- `Orquesta Pi Extension`: The Pi extension loaded into every `OrquestaAgent`.
- `Agent RPC Connection`: The persistent WebSocket connection from the Pi extension to Orquesta RPC.
- `Interruption Policy`: The Pi-side event delivery behavior for Orquesta events: `defer`, `steer`, or `interrupt`.
