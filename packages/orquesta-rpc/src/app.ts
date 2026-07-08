import { Hono } from "hono";
import type { OrquestaRpcService } from "./server.ts";

export interface OrquestaRpcAppOptions {
  service: OrquestaRpcService;
}

export function createOrquestaRpcApp(options: OrquestaRpcAppOptions) {
  void options.service;
  return new Hono().get("/", (c) =>
    c.json({
      ok: true,
      service: "orquesta-rpc",
      endpoint: "websocket",
    }),
  );
}

export type OrquestaRpcApp = ReturnType<typeof createOrquestaRpcApp>;
