import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

loadEnv(".env");

if (!process.env.GEMINI_API_KEY?.trim()) {
  console.error("GEMINI_API_KEY est absente. Ajoute-la dans .env. Ne la colle pas dans le chat.");
  process.exit(2);
}

const result = spawnSync("npx", ["vitest", "run", "tests/prove-gemma.live.test.ts"], {
  stdio: "inherit",
  env: { ...process.env, GEMMA_LIVE_TEST: "1" },
});

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
