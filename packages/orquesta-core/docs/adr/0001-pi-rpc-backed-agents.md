# 0001. Pi RPC-Backed Agents

## Status

Accepted

## Context

Orquesta needs to orchestrate multiple coding agents through one uniform abstraction. Main agents and subagents should have the same API surface, and each active agent should run as its own Pi process so Orquesta can supervise lifecycle, events, and future UI routing independently.

Pi exposes both direct SDK/session APIs and a subprocess RPC mode. The direct SDK keeps Orquesta closer to Pi internals, while RPC mode provides a typed `RpcClient` API that owns a single active agent session per process and streams events through one process boundary.

## Decision

Orquesta Core wraps Pi's `RpcClient` for all agent instances. `OrquestaAgent` is the uniform per-agent abstraction, and higher-level orchestration will manage many `OrquestaAgent` instances rather than using separate main-agent and subagent APIs.

Orquesta resolves the bundled Pi CLI from the `@earendil-works/pi-coding-agent` package dependency. It does not require a globally installed `pi` binary.

Global Orquesta config may provide Pi storage/process paths, such as Pi agent and session directories. Model, provider, tool policy, and other runtime behavior remain per-agent or per-session concerns rather than global Orquesta config.

## Consequences

Each Orquesta agent maps to one Pi RPC process. `OrquestaAgent` owns its identity, process lifecycle, and construction metadata. `AgentRegistry` owns only the live collection of agents, aggregate event fan-out, and clean shutdown. Future graph/node runtimes will own node relationships and message handoff between agents.

Pi `RpcClient` remains the protocol boundary, so Orquesta should not manually parse Pi JSONL unless `RpcClient` stops meeting requirements.

Session naming, model selection, and provider selection are explicit runtime operations. Agent construction or process startup must not silently mutate those session properties.

Tool allow/exclude configuration is currently spawn-time only because Pi RPC does not expose runtime tool reconfiguration.
