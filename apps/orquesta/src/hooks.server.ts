import type { Handle } from '@sveltejs/kit';
import { getTextDirection } from '$lib/paraglide/runtime';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { createOrquestaRpcApp, OrquestaRpcService } from '@anchorsoft/orquesta-rpc';

const RPC_PREFIX = '/internal/orquesta-rpc';

function getRpcService() {
  globalThis.__orquestaRpcService ??= new OrquestaRpcService();
  return globalThis.__orquestaRpcService;
}

export const handle: Handle = async ({ event, resolve }) => {
  if (event.url.pathname === RPC_PREFIX || event.url.pathname.startsWith(`${RPC_PREFIX}/`)) {
    const service = getRpcService();
    const app = createOrquestaRpcApp({ service });
    const url = new URL(event.request.url);
    url.pathname = event.url.pathname.slice(RPC_PREFIX.length) || '/';

    return await app.request(new Request(url, event.request));
  }

  return paraglideMiddleware(event.request, ({ request, locale }) => {
    event.request = request;

    return resolve(event, {
      transformPageChunk: ({ html }) =>
        html
          .replace('%paraglide.lang%', locale)
          .replace('%paraglide.dir%', getTextDirection(locale))
    });
  });
};
