export type DiffLine = {
  kind: "same" | "removed" | "added";
  text: string;
};

/** Minimal line diff for short student snippets. Not a full myers algorithm. */
export function buildLineDiff(before: string, after: string): DiffLine[] {
  const left = before.replace(/\r\n/g, "\n").split("\n");
  const right = after.replace(/\r\n/g, "\n").split("\n");
  const leftSet = new Set(left);
  const rightSet = new Set(right);
  const lines: DiffLine[] = [];

  for (const text of left) {
    if (rightSet.has(text)) {
      lines.push({ kind: "same", text });
    } else {
      lines.push({ kind: "removed", text });
    }
  }
  for (const text of right) {
    if (!leftSet.has(text)) {
      lines.push({ kind: "added", text });
    }
  }
  return lines;
}
