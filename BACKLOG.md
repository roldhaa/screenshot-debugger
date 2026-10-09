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
| Appel Gemma réel | terminé | `gemma-4-26b-a4b-it`, mode `live`, capture React diagnostiquée en 9 s sur l'URL publique |
| Déploiement DigitalOcean | en ligne | https://screenshot-debugger-qzyjc.ondigitalocean.app, environ 5 $ US par mois |
| Textes de soumission | terminé | `docs/SUBMISSION.md`, confirmation du formulaire encore à faire |
| Agent Skill | terminé | `.agents/skills/screenshot-debugger/SKILL.md` |
| Model harness CLI | terminé | `npm run harness:demo`, `docs/HARNESS.md` |

## P1

| Tâche | État | Validation |
| --- | --- | --- |
| Copie du rapport et brouillon d'issue | terminé | boutons présents, export sans HTML exécuté |
| Durée réelle dans les métadonnées | terminé | champ `durationMs` rempli par le serveur |
| Français et anglais | terminé | sélecteur envoyé au prompt |
| Captures de démo | terminé | `examples/demo-captures/` + 3 boutons UI |
| Mode Apprendre + Diagnostic direct | terminé | UI + champs `learn` dans le JSON Gemma |
| Enquête interactive | terminé | `POST /api/investigate`, max 2 tours |
| Diff expliqué + fiche Markdown | terminé | `components/code-diff.tsx`, `lib/error-card.ts` |
| Annotations pixel | reporté | indices numérotés seulement |
| Mini défi de transfert | reporté | après stabilisation démo |

## P2

Compte, historique, GitHub OAuth, lecture de dépôt, PR automatique, shell, MCP, RAG, modèle local, application native, paiements, communauté publique. À reprendre après le hackathon, pas à la place du noyau.


Limites laissées volontairement : la passerelle coupe vers 20 secondes, le repli `gemma-4-31b-it` n'est appelé qu'en cas de 404, et les 12 analyses par heure restent dans la mémoire du conteneur. Pas de base payante pour ce compteur.
