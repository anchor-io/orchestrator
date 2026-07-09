import { fileURLToPath } from "node:url";

export const PACKAGE_NAME = "@anchorsoft/orquesta-pi-extension";
export const ORQUESTA_PI_EXTENSION_PATH = fileURLToPath(new URL("./extension.ts", import.meta.url));

export { default } from "./extension.ts";
