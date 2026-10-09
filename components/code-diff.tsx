import { buildLineDiff } from "@/lib/code-diff";

type CodeDiffProps = {
  before: string;
  after: string | null;
  changeNotes: string[];
};

export function CodeDiffView({ before, after, changeNotes }: CodeDiffProps) {
  if (!after) {
    return (
      <div>
        <h3 className="text-base font-semibold">Diff proposé</h3>
        <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
          Aucun code proposé. Fournis un extrait pour comparer avant et après.
        </p>
      </div>
    );
  }

  if (!before.trim()) {
    return (
      <div>
        <h3 className="text-base font-semibold">Code proposé</h3>
        <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
          Ajoute ton extrait dans le formulaire pour voir un diff avant / après.
        </p>
        <pre className="mt-2 max-w-full overflow-x-auto rounded-md bg-zinc-950 p-3 text-sm text-zinc-50">
          <code>{after}</code>
        </pre>
      </div>
    );
  }

  const lines = buildLineDiff(before, after);

  return (
    <div>
      <h3 className="text-base font-semibold">Diff proposé</h3>
      <p className="mt-1 rounded-md border border-amber-200 bg-amber-50 p-2 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100">
        Correction proposée. À vérifier dans ton environnement.
      </p>
      {changeNotes.length > 0 ? (
        <ul className="mt-2 list-disc pl-5 text-sm">
          {changeNotes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      ) : null}
      <pre className="mt-2 max-w-full overflow-x-auto rounded-md bg-zinc-950 p-3 text-sm text-zinc-50">
        <code>
          {lines.map((line, index) => (
            <span
              key={`${line.kind}-${index}-${line.text}`}
              className={
                line.kind === "added"
                  ? "block bg-emerald-900/60"
                  : line.kind === "removed"
                    ? "block bg-red-900/50"
                    : "block"
              }
            >
              {line.kind === "added" ? "+ " : line.kind === "removed" ? "- " : "  "}
              {line.text}
              {"\n"}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}
