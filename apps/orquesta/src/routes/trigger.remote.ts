import { command } from '$app/server';
import { runAgent } from '@anchorsoft/orquesta-core';

export const reRun = command(async () => {
  await runAgent();
});
