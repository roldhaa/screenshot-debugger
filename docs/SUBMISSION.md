# Soumission

La confirmation dans OrganizerHQ reste à faire par Harold.

## Champs prêts

- Nom : Screenshot Debugger
- Lien GitHub : https://github.com/roldhaa/screenshot-debugger
- URL de démo : https://screenshot-debugger-qzyjc.ondigitalocean.app
- Technologies : Next.js, TypeScript, Tailwind CSS, Zod, Gemma 4 via la Gemini API (`@google/genai`), DigitalOcean App Platform

## Description

Screenshot Debugger est un atelier de débogage guidé pour étudiants en JavaScript, TypeScript et React. Une capture part vers Gemma 4. Le parcours sépare indices et hypothèses, pose une question d'enquête, propose une correction expliquée avec diff, et exporte une fiche Markdown réutilisable. L'application n'exécute pas le correctif. Un Agent Skill et un harness original encapsulent le pipeline. Licence MIT.

## Catégories

- Best Use of Gemma 4
- Best Open-Source AI Project

## Preuves

| Sujet | Où |
| --- | --- |
| Gemma open-weight | `lib/server/gemma.ts`, `npm run harness:demo` |
| Agent Skill | `.agents/skills/screenshot-debugger/SKILL.md` |
| Model harness | `docs/HARNESS.md`, `lib/server/diagnose.ts` |
| Atelier pédagogique | modes Apprendre / Direct, `POST /api/investigate`, fiche |
| DigitalOcean | App Platform Web Service |
| Sécurité | clé serveur, Origin allowlist, pas d'exécution |

## Terminé / reporté

| Élément | État |
| --- | --- |
| Analyse live + modes Apprendre / Direct | Terminé |
| Enquête interactive | Terminé |
| Diff expliqué + fiche Markdown | Terminé |
| Annotations pixel | Reporté |
| Mini défi de transfert | Reporté |

## Phrase jury

Un chatbot peut expliquer une erreur si on lui pose les bonnes questions. Screenshot Debugger structure ce travail pour les étudiants : indices visibles, enquête guidée, correction expliquée, et une fiche réutilisable — l'esprit de Stack Overflow, sans prétendre être Stack Overflow.
