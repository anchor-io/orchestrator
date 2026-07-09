import { chmod, copyFile, mkdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const gitDir = path.join(root, ".git");
const hooksDir = path.join(gitDir, "hooks");
const source = path.join(root, ".githooks", "commit-msg");
const target = path.join(hooksDir, "commit-msg");

try {
  await stat(gitDir);
  await mkdir(hooksDir, { recursive: true });
  await copyFile(source, target);
  await chmod(target, 0o755);
} catch (error) {
  if (process.env.CI) throw error;
}
