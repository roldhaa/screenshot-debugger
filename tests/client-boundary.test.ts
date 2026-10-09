import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

function sourceFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const fullPath = path.join(directory, entry);
    if (statSync(fullPath).isDirectory()) {
      return sourceFiles(fullPath);
    }
    return fullPath.endsWith(".ts") || fullPath.endsWith(".tsx") ? [fullPath] : [];
  });
}

describe("client boundary", () => {
  it("keeps server modules and the API key out of client components", () => {
    const files = [...sourceFiles("components"), ...sourceFiles("app")].filter((file) => {
      const source = readFileSync(file, "utf8");
      return source.includes('"use client"') || file.endsWith("page.tsx");
    });

    for (const file of files) {
      const source = readFileSync(file, "utf8");
      expect(source, file).not.toContain("lib/server");
      expect(source, file).not.toContain("GEMINI_API_KEY");
      expect(source, file).not.toContain("NEXT_PUBLIC_GEMINI_API_KEY");
      expect(source, file).not.toContain("dangerouslySetInnerHTML");
    }
  });
});
