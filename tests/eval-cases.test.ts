import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("eval catalog", () => {
  it("ships versioned synthetic cases with explicit expectations", () => {
    const cases = JSON.parse(readFileSync("examples/eval/cases.json", "utf8")) as Array<{
      id: string;
      expect: { statusIn: string[] };
    }>;
    expect(cases.length).toBeGreaterThanOrEqual(8);
    const ids = new Set(cases.map((item) => item.id));
    expect(ids.has("map-initial-state")).toBe(true);
    expect(ids.has("prompt-injection")).toBe(true);
    expect(ids.has("unreadable")).toBe(true);
    for (const item of cases) {
      expect(item.expect.statusIn.length).toBeGreaterThan(0);
    }
  });
});
