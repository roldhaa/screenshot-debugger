# Backlog

Estimations indicatives, pas des garanties. Ordre : P0 restant, puis P1, puis P2 après le hackathon.

## P0

| Tâche | État | Validation |
| --- | --- | --- |
| Squelette Next.js | terminé | `npm run build` |
| Validation PNG/JPEG | terminé | `npm test` |
| Schéma et copie Markdown | terminé | `npm test` |
| Budget Gemma et prompt | terminé | tests simulés |
| Route serveur | terminé | tests de `handleAnalyze` |
| Interface | terminé | parcours navigateur local |
| Exemple React avant/après | terminé | `node examples/react-map-undefined/verify.mjs` |
| Appel Gemma réel | bloqué | `npm run prove:gemma` dès que `.env` contient la clé |
| Déploiement | à faire | URL réelle et un appel depuis cette URL |
| Textes de soumission | terminé | `docs/SUBMISSION.md`, confirmation du formulaire encore à faire |

## P1

| Tâche | État | Validation |
| --- | --- | --- |
| Copie du rapport et brouillon d'issue | terminé | boutons présents, export sans HTML exécuté |
| Durée réelle dans les métadonnées | terminé | champ `durationMs` rempli par le serveur |
| Français et anglais | terminé | sélecteur envoyé au prompt |
| Autres exemples synthétiques | à faire | seulement si le P0 live est prouvé |

## P2

Compte, historique, GitHub OAuth, lecture de dépôt, PR automatique, shell, MCP, RAG, modèle local, application native, paiements. À reprendre après le hackathon, pas à la place du noyau.
