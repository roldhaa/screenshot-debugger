# Soumission

La confirmation dans OrganizerHQ reste à faire par Harold. Ne pas déclarer les catégories validées tant que l'appel Gemma réel n'a pas réussi.

## Champs prêts

- Nom : Screenshot Debugger
- Lien GitHub : https://github.com/roldhaa/screenshot-debugger
- URL de démo : à ajouter après le déploiement. En attendant, la démo locale est `npm run dev`.
- Technologies : Next.js, TypeScript, Tailwind CSS, Zod, Gemma 4 via la Gemini API (`@google/genai`)

## Description

Un étudiant voit une erreur dans un terminal ou une console et ne sait pas quoi vérifier. Screenshot Debugger envoie la capture, et éventuellement un extrait de code, à Gemma 4. Le rapport sépare l'erreur observée, les hypothèses, une correction proposée et les étapes pour la vérifier. L'application n'exécute pas le correctif. Un exemple public montre un `TypeError` sur `.map()`, puis une liste vide après la correction appliquée à la main. Le code est sous licence MIT.

## Catégories à cocher

- Best Use of Gemma 4
- Best Open-Source AI Project

## Preuves à montrer

| Sujet | Où |
| --- | --- |
| Gemma | `lib/server/gemma.ts`, identifiant imprimé par `npm run prove:gemma` |
| Image | la capture est une partie de la requête, pas un texte de remplacement |
| Open source | dépôt public et `LICENSE` |
| Fonctionnement | parcours local et `examples/react-map-undefined/verify.mjs` |
| Sécurité | `docs/SECURITY.md` |
| Limite honnête | pas d'exécution du correctif, limite de débit par processus, appel live encore bloqué sans clé |

## Après l'appel réel

Remplacer la phrase sur le blocage par le modèle effectif, la durée observée et l'URL si elle existe. Ne pas inventer ces valeurs avant de les avoir vues.
