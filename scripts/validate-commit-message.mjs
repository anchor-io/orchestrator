import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const messagePath = process.argv[2];

if (!messagePath) {
  fail("Missing commit message file path.");
}

const firstLine = (await readFile(messagePath, "utf8")).split(/\r?\n/, 1)[0]?.trim() ?? "";
const allowedScopes = await getAllowedScopes();
const conventional = /^(?<type>[a-z]+(?:-[a-z]+)?)(?<breaking>!)?\((?<scope>[a-z0-9-]+)\)(?:!)?: (?<subject>.+)$/u;
const match = conventional.exec(firstLine);

if (!match?.groups) {
  fail(
    [
      "Commit message must use a scoped Conventional Commit format.",
      "Expected: type(scope): subject",
      "Example: feat(orquesta-rpc): add agent websocket protocol",
    ].join("\n"),
  );
}

const scope = match.groups.scope;
if (!allowedScopes.has(scope)) {
  fail(
    [
      `Invalid commit scope "${scope}".`,
      `Allowed scopes: ${Array.from(allowedScopes).sort().join(", ")}`,
    ].join("\n"),
  );
}

async function getAllowedScopes() {
  const scopes = new Set(["root", "repo", "monorepo", "docs", "ci"]);
  for (const workspaceDir of ["apps", "packages"]) {
    const workspacePath = path.join(root, workspaceDir);
    let entries;
    try {
      entries = await readdir(workspacePath, { withFileTypes: true });
    } catch {
      continue;
    }

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const packageJsonPath = path.join(workspacePath, entry.name, "package.json");
      try {
        const packageJson = JSON.parse(await readFile(packageJsonPath, "utf8"));
        if (typeof packageJson.name === "string") scopes.add(toScope(packageJson.name));
      } catch {
        scopes.add(entry.name);
      }
    }
  }
  return scopes;
}

function toScope(packageName) {
  return packageName.includes("/") ? packageName.slice(packageName.lastIndexOf("/") + 1) : packageName;
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
