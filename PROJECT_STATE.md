# État du projet

Mis à jour le 9 octobre 2026, vers 11 h 30, America/Toronto.

## Ce qui marche

- L'application locale démarre avec `npm run dev`.
- Une capture PNG est prévisualisée. Un fichier SVG renommé est refusé avant l'appel.
- Le bouton Analyser envoie la requête au serveur. Sans clé, la réponse affichée est : « La clé API n'est pas configurée sur le serveur. »
- Effacer retire l'image, le texte et le résultat.
- L'exemple React se charge dans le formulaire.
- `node examples/react-map-undefined/verify.mjs` affiche l'échec `reading 'map'`, puis `[]` après la correction.
- `npm test` : 36 tests passés, plus le test live ignoré quand `GEMMA_LIVE_TEST` n'est pas défini.
- `npm run lint` et `npm run build` ont réussi sur cette machine.

## Ce qui repose sur des simulations

- Les tests de diagnostic remplacent Gemma par une fonction injectée.
- Le rendu navigateur du rapport complet n'a pas été vu avec une vraie réponse du modèle, parce que la clé est absente.

## Blocage externe

`GEMINI_API_KEY` n'est pas dans l'environnement du shell ni dans un fichier `.env` du dépôt. L'appel réel et le déploiement Vercel qui utiliserait cette clé ne sont donc pas faits.

Pour débloquer l'appel :

```bash
cp .env.example .env
# écrire la clé dans .env, sans la coller dans un chat
npm run prove:gemma
```

## Modèle prévu

`gemma-4-26b-a4b-it`, repli `gemma-4-31b-it`. L'identifiant effectif sera celui imprimé par `npm run prove:gemma`. Il n'est pas encore confirmé sur ce compte.

## Déploiement

Pas d'URL. `npx vercel whoami` (CLI 63.1.0) a répondu « Logged out ». Il faut `vercel login`, puis définir `GEMINI_API_KEY` dans les variables serveur du projet, pas dans Git.

## Prochaine action

Ajouter la clé dans `.env`, lancer `npm run prove:gemma`, puis déployer sur Vercel avec la même clé en variable serveur.

## Échéance

Remise personnelle visée vers 19 h 45. Limite affichée 20 h 15. Gel des fonctionnalités recommandé vers 18 h.
