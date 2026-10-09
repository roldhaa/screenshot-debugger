import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const directory = path.dirname(fileURLToPath(import.meta.url));

const buggy = spawnSync(process.execPath, [path.join(directory, "buggy.mjs")], { encoding: "utf8" });
if (buggy.status === 0 || !buggy.stderr.includes("reading 'map'")) {
  console.error("Le script bogué aurait dû échouer sur map.");
  process.exit(1);
}

const fixed = spawnSync(process.execPath, [path.join(directory, "fixed.mjs")], { encoding: "utf8" });
if (fixed.status !== 0 || fixed.stdout.trim() !== "[]") {
  console.error(fixed.stderr || fixed.stdout);
  process.exit(1);
}

console.log("before: TypeError reading map");
console.log("after: []");
