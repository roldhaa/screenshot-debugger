# Démonstration

Durée visée : environ deux minutes.

## Scénario

1. Lancer `node examples/react-map-undefined/buggy.mjs` et montrer le `TypeError` sur `map`.
2. Ouvrir Screenshot Debugger et cliquer sur **Charger l'exemple React**.
3. Montrer la capture, le framework React et l'extrait `users.map`.
4. Lancer l'analyse. Dire que l'image part vers Gemma via le serveur.
5. Lire l'erreur observée, une hypothèse, la correction proposée et la vérification.
6. Montrer `fixed.mjs`, puis `node examples/react-map-undefined/verify.mjs`.
7. Le résultat attendu est `[]`, sans TypeError.
8. Montrer la licence MIT, le dépôt et l'identifiant du modèle dans le rapport.

La correction de l'exemple a été vérifiée par `verify.mjs`. Cela ne valide pas les futures suggestions.

## Si Gemma n'a pas encore répondu sur ce compte

Dire que l'appel réel n'est pas encore confirmé, montrer le code de `lib/server/gemma.ts`, et ne pas présenter une réponse simulée comme une inférence.

Dès que `npm run prove:gemma` a réussi, noter ici le modèle, le statut, la durée et l'erreur observée.

## Secours

- La capture `examples/react-map-undefined/error.png` est déjà dans le dépôt.
- Le résultat avant/après du script ne dépend pas de Gemma.
- Si l'URL déployée tombe, utiliser `npm run dev`.

## Questions probables

- Où est l'image ? Le serveur l'envoie à Gemma par l'API Fichiers, comme dans la doc Gemini API, puis supprime le fichier. Si cet envoi est refusé, il réessaie avec l'image inline.
- Quel modèle ? `gemma-4-26b-a4b-it`, sinon `gemma-4-31b-it`.
- Qu'avons-nous construit ? Le parcours, la validation, le prompt, le schéma et l'exemple. Next.js, React, Zod et le SDK Google sont des bibliothèques.
- Comment sait-on que la correction marche ? Seulement pour l'exemple, parce que `verify.mjs` a été exécuté.
- Si la capture ne suffit pas ? Statut `needs_context` ou `unreadable`.
- Où est la clé ? Dans l'environnement serveur, pas dans Git.
- Où vont les images ? Vers Google pour l'analyse. Nous ne les stockons pas volontairement.
- Limite ? Pas d'exécution automatique, et la limite de débit est par processus.
