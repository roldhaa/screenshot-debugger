<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Screenshot Debugger

Vision : une capture d'erreur, plus un contexte facultatif, devient un diagnostic, une correction proposée et une vérification. Public : étudiants en JavaScript, TypeScript et React.

Stack : Next.js 16, TypeScript, Tailwind 4, Zod, `@google/genai`, Vitest. Le modèle est Gemma 4 via la Gemini API. La clé reste dans `GEMINI_API_KEY` côté serveur.

Parcours : `app/page.tsx` vers `POST /api/analyze`. Une nouvelle image ou une annulation invalide le rapport en cours.

Invariants :

- Le développement de compétition se limite à la fenêtre autorisée du 9 octobre 2026.
- Ne pas importer `lib/server` dans un composant client.
- Ne pas exécuter le code du modèle, ne pas lancer de shell à partir d'une réponse, ne pas journaliser l'image ou le code utilisateur.
- Au plus deux appels fournisseur par analyse.
- Une fixture ou un test simulé n'est pas une preuve d'appel Gemma.

Commandes : `npm run dev`, `npm test`, `npm run lint`, `npm run build`, `node examples/react-map-undefined/verify.mjs`, `npm run prove:gemma`.

Communication : expliquer les choix structurants en français, avec les noms de code en anglais. Une tâche est finie quand la commande correspondante a été exécutée, ou quand la limite est écrite explicitement.
