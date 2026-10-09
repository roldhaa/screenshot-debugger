# État du projet

Mis à jour le 9 octobre 2026, America/Toronto.

Branche de travail pédagogique : `feature/atelier-pedagogique` (ne pas merger sur `main` sans accord : `deploy_on_push` DigitalOcean).

## Terminé

- Analyse Gemma 4 live (`gemma-4-26b-a4b-it`) et harness CLI.
- Agent Skill + docs harness.
- Modes **Apprendre** et **Diagnostic direct**.
- Enquête `POST /api/investigate` (texte seul, max 2 tours).
- Diff client + notes de changement.
- Fiche Markdown + localStorage navigateur.
- Allowlist Origin via `PUBLIC_APP_URL`.
- README FR/EN orienté jury.

## À vérifier en démo

- Parcours Exemple 2 en mode Apprendre sur l'URL publique après merge éventuel.
- Un tour d'enquête live avec réponse libre.

## Reporté

- Annotations pixel sur la capture.
- Mini défi de transfert.
- Communauté publique / comptes / votes.

## Déploiement

https://screenshot-debugger-qzyjc.ondigitalocean.app (~5 $ US / mois).  
Push `main` = redéploiement automatique.

## Prochaine action

Soumettre MLH ; merger la branche pédagogique seulement si la démo locale est stable et validée.
