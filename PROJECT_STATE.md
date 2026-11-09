# État du projet

Mis à jour le 9 octobre 2026, America/Toronto.

Branche pédagogique mergée sur `main` et déployée (commit `6765c48`, 9 oct. 2026).

## Terminé

- Analyse Gemma 4 live (`gemma-4-26b-a4b-it`) et harness CLI.
- Agent Skill + docs harness.
- Modes **Apprendre** et **Diagnostic direct**.
- Enquête `POST /api/investigate` (texte seul, max 2 tours).
- Diff client + notes de changement.
- Fiche Markdown + localStorage navigateur.
- Allowlist Origin via `PUBLIC_APP_URL` (secret Vercel).
- README FR/EN orienté jury.
- Jeu d'évaluation versionné : `examples/eval/cases.json`.

## Vérifié en production (9 oct. 2026)

- URL : https://screenshot-debugger.vercel.app
- Exemple 2 → Apprendre → Analyser → `diagnosed` live ~13 s, modèle `gemma-4-26b-a4b-it`, prompt `2026-10-09.4`.
- Origin étrangère toujours refusée (403).
- `/api/investigate` présent (400 sur corps vide = route active).

## Reporté

- Annotations pixel sur la capture.
- Mini défi de transfert.
- Communauté publique / comptes / votes.
- Revue humaine complète des 9 cas d'eval live (catalogue prêt, pas tous rejoués live).

## Déploiement

https://screenshot-debugger.vercel.app (Vercel Hobby, gratuit).  
Push `main` = redéploiement automatique.

## Prochaine action

Soumettre MLH avec GitHub + URL + catégories Gemma 4 et Open-Source AI.
