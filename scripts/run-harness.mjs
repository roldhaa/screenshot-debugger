import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

loadEnv(".env");

if (!process.env.GEMINI_API_KEY?.trim()) {
  console.error("GEMINI_API_KEY est absente. Ajoute-la dans .env. Ne la colle pas dans le chat.");
  process.exit(2);
}

const example = process.env.HARNESS_EXAMPLE?.trim() || "2";
if (!["1", "2", "3"].includes(example)) {
  console.error("HARNESS_EXAMPLE doit être 1, 2 ou 3.");
  process.exit(2);
}

const outDir = mkdtempSync(join(tmpdir(), "harness-demo-"));
const outPath = join(outDir, "result.json");

console.info(`Harness Screenshot Debugger · exemple ${example} · Gemma live`);

const result = spawnSync("npx", ["vitest", "run", "tests/harness-demo.live.test.ts"], {
  stdio: "inherit",
  env: {
    ...process.env,
    GEMMA_LIVE_TEST: "1",
    HARNESS_EXAMPLE: example,
    HARNESS_OUT: outPath,
  },
});

if (result.status === 0) {
  try {
    process.stdout.write(readFileSync(outPath, "utf8"));
  } catch {
    console.error("Le harness a réussi mais le résumé n'a pas pu être lu.");
    process.exit(1);
  }
}

rmSync(outDir, { recursive: true, force: true });
process.exit(result.status ?? 1);

function loadEnv(path) {
  try {
    const text = readFileSync(path, "utf8");
    for (const line of text.split("\n")) {
      const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (!match || process.env[match[1]]) {
        continue;
      }
      process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
    }
  } catch {
    // Un fichier absent est signalé par le contrôle de la clé.
  }
}
