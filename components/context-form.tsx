import { LIMITS } from "@/lib/limits";

type ContextFormProps = {
  framework: string;
  context: string;
  code: string;
  language: string;
  showDemoToken: boolean;
  demoToken: string;
  onFramework: (value: string) => void;
  onContext: (value: string) => void;
  onCode: (value: string) => void;
  onLanguage: (value: string) => void;
  onDemoToken: (value: string) => void;
};

const fieldClass =
  "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950";

export function ContextForm({
  framework,
  context,
  code,
  language,
  showDemoToken,
  demoToken,
  onFramework,
  onContext,
  onCode,
  onLanguage,
  onDemoToken,
}: ContextFormProps) {
  const used = context.length + code.length;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm font-medium">
          Framework
          <select className={`${fieldClass} min-h-11`} value={framework} onChange={(event) => onFramework(event.target.value)}>
            <option value="auto">Auto / inconnu</option>
            <option value="react">React</option>
            <option value="typescript">TypeScript</option>
            <option value="javascript">JavaScript</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Langue du rapport
          <select className={`${fieldClass} min-h-11`} value={language} onChange={(event) => onLanguage(event.target.value)}>
            <option value="fr">Français</option>
            <option value="en">English</option>
          </select>
        </label>
      </div>
      <label className="flex flex-col gap-1 text-sm font-medium">
        Contexte facultatif
        <textarea
          className={`${fieldClass} min-h-24`}
          value={context}
          onChange={(event) => onContext(event.target.value)}
          placeholder="Ce que tu essayais de faire, et le résultat attendu."
        />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium">
        Code ou message d&apos;erreur
        <textarea
          className={`${fieldClass} min-h-36 font-mono`}
          value={code}
          onChange={(event) => onCode(event.target.value)}
          spellCheck={false}
          placeholder="Colle seulement l'extrait utile."
        />
      </label>
      <p className={used > LIMITS.maxTextChars ? "text-sm text-red-700 dark:text-red-300" : "text-sm text-zinc-600 dark:text-zinc-400"}>
        {used} / {LIMITS.maxTextChars} caractères
      </p>
      {showDemoToken ? (
        <label className="flex flex-col gap-1 text-sm font-medium">
          Code d&apos;accès de la démo
          <input
            className={`${fieldClass} min-h-11`}
            type="password"
            autoComplete="off"
            value={demoToken}
            onChange={(event) => onDemoToken(event.target.value)}
          />
        </label>
      ) : null}
    </div>
  );
}
