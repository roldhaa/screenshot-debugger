# État du projet

Mis à jour le 9 octobre 2026, America/Toronto.

## Ce qui marche

- Application locale et URL publique DigitalOcean App Platform.
- Appels Gemma 4 live (`gemma-4-26b-a4b-it`) sur les exemples de démo.
- Trois boutons d'exemple dans l'UI ; Exemple 2 en premier.
- Agent Skill : `.agents/skills/screenshot-debugger/SKILL.md`.
- Model harness documenté : `docs/HARNESS.md`, CLI `npm run harness:demo`.
- Dix captures dans `examples/demo-captures/`.
- `npm test`, lint et build verts sur la machine de développement.

## Limites connues

- La passerelle App Platform coupe vers 20 secondes.
- Douze analyses par heure dans la mémoire du conteneur.
- Pas de Launchpad ELK/RAG/Airflow : hors du besoin de la démo.

## Déploiement

https://screenshot-debugger-qzyjc.ondigitalocean.app (~5 $ US / mois).

## Prochaine action

Soumettre sur MLH avec GitHub, URL, catégories Gemma 4 et Open-Source AI Project.
