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

`.env` existe et est ignoré par Git. `GEMINI_API_KEY` y est vide. Aucun appel Gemma réel n'a donc été fait.

Pour débloquer l'appel :

```bash
# écrire la clé dans .env, sans la coller dans un chat
npm run prove:gemma
```

La clé se crée dans Google AI Studio : https://aistudio.google.com/apikey
La doc d'appel est https://ai.google.dev/gemma/docs/core/gemma_on_gemini_api

## Modèle prévu

`gemma-4-26b-a4b-it`, repli `gemma-4-31b-it`. Un PNG d'un pixel a reçu une réponse live de `gemma-4-26b-a4b-it` avec le statut `unreadable`.

## Déploiement

L'application est en ligne : https://screenshot-debugger-qzyjc.ondigitalocean.app. Le service coûte 5 $ US par mois. La capture React publique a produit un diagnostic live de `gemma-4-26b-a4b-it` en 9 secondes.

DevRelay n'est pas disponible dans les outils de cette session. Aucune offre n'a été consultée, publiée ou réclamée.

## Prochaine action

Montrer le parcours public, puis soumettre. Le détail des essais est dans `docs/TEST_REPORT.md`.

## Échéance

Remise personnelle visée vers 19 h 45. Limite affichée 20 h 15. Gel des fonctionnalités recommandé vers 18 h.
