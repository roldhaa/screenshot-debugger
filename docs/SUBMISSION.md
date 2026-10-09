# Soumission

La confirmation dans OrganizerHQ reste à faire par Harold. L'appel Gemma réel a réussi sur l'URL publique avec `gemma-4-26b-a4b-it`.

## Champs prêts

- Nom : Screenshot Debugger
- Lien GitHub : https://github.com/roldhaa/screenshot-debugger
- URL de démo : https://screenshot-debugger-qzyjc.ondigitalocean.app
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
| Limite honnête | pas d'exécution du correctif, 12 analyses par heure dans le conteneur, passerelle vers 20 secondes |

## Appel réel observé

Modèle `gemma-4-26b-a4b-it`, mode `live`, environ 9 secondes. Erreur observée : `TypeError: Cannot read properties of undefined (reading 'map')`. URL : https://screenshot-debugger-qzyjc.ondigitalocean.app.
