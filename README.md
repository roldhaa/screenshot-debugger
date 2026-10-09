# Screenshot Debugger

[![ci](https://github.com/roldhaa/screenshot-debugger/actions/workflows/ci.yml/badge.svg)](https://github.com/roldhaa/screenshot-debugger/actions/workflows/ci.yml)
[![licence MIT](https://img.shields.io/badge/licence-MIT-blue.svg)](LICENSE)

**FR** · Atelier de débogage guidé pour étudiants en JavaScript, TypeScript et React. Une capture d'erreur devient une enquête, une correction expliquée et une fiche réutilisable.

**EN** · A guided debugging workshop for JavaScript, TypeScript and React students. An error screenshot becomes an investigation, an explained fix, and a reusable error card.

**Promesse :** Comprends ton bug. Apprends à le résoudre.  
**Secondary :** Transforme une capture d'erreur en enquête guidée, correction expliquée et connaissance réutilisable.

Nous voulons retrouver l'esprit de Stack Overflow : comprendre, expliquer et partager. Nous ne sommes pas affiliés à Stack Overflow.

**Démo en ligne :** [screenshot-debugger-qzyjc.ondigitalocean.app](https://screenshot-debugger-qzyjc.ondigitalocean.app)

| | |
| --- | --- |
| Hackathon | Hacktoberfest Hack Day Montréal x AGEEI — 9 octobre 2026 |
| Catégories MLH | Best Use of Gemma 4 · Best Open-Source AI Project |
| Modèle | Gemma 4 open-weight `gemma-4-26b-a4b-it` (via Gemini API) |
| Hébergement | DigitalOcean App Platform (~5 $ US / mois) |
| Agent Skill | [`.agents/skills/screenshot-debugger/SKILL.md`](.agents/skills/screenshot-debugger/SKILL.md) |
| Model harness | [`docs/HARNESS.md`](docs/HARNESS.md) · `npm run harness:demo` |

---

## Pourquoi ce projet / Why this can win

### Best Use of Gemma 4

| Preuve | Détail |
| --- | --- |
| Modèle open-weight réel | `gemma-4-26b-a4b-it` dans [`lib/server/gemma.ts`](lib/server/gemma.ts) |
| Image réelle | Files API, puis suppression du fichier |
| Appel live | `npm run harness:demo` → `mode: live` |
| Budget honnête | Au plus 2 appels fournisseur par requête |
| UI transparente | Badge **live**, modèle affiché, compteur de temps |

### Best Open-Source AI Project

| Preuve | Détail |
| --- | --- |
| Agent Skill | Standard ouvert [agentskills.io](https://agentskills.io/specification) |
| Model harness original | [`diagnose`](lib/server/diagnose.ts) + [`gemma`](lib/server/gemma.ts) |
| Atelier pédagogique | Modes Apprendre / Diagnostic direct, enquête, fiche |
| Licence MIT | Dépôt public |

### Différence avec un chatbot

Un chatbot peut expliquer une erreur si on lui pose les bonnes questions. Screenshot Debugger structure ce travail : indices visibles, enquête guidée, correction expliquée, et une fiche réutilisable.

---

## Fonctionnalités disponibles / Available features

| Fonction | État |
| --- | --- |
| Analyse live Gemma 4 (capture + contexte + code) | Terminé |
| Mode **Apprendre** (indice, explication, révélation progressive) | Terminé |
| Mode **Diagnostic direct** | Terminé |
| Enquête interactive (`POST /api/investigate`, sans renvoyer l'image) | Terminé |
| Diff avant / après expliqué | Terminé |
| Fiche Markdown + bibliothèque locale (navigateur) | Terminé |
| Indices numérotés | Terminé |
| Annotations pixel sur la capture | Reporté |
| Mini défi de transfert | Reporté |

---

## Comment ça marche / How it works

```text
Capture + contexte
        |
        v
POST /api/analyze  -->  Gemma 4  -->  rapport enrichi
                                           |
                    +------ Apprendre / Direct ------+
                    |                                |
              question locale                  correction
              indice / explication             diff + vérif
                    |                                |
              enquête (optionnel)  -->  POST /api/investigate
                    |
                    v
              fiche Markdown exportable
```

Parcours pédagogique : observer → hypothèse → preuve → comprendre → corriger → vérifier → retenir.

---

## Démonstration jury (60–90 s)

1. Ouvre l'URL publique ou `npm run dev`.
2. Clique **Exemple 2 · null length**, mode **Apprendre**, puis **Analyser**.
3. Montre les indices numérotés et le badge **live**.
4. Demande un **indice**, puis **Afficher la correction**.
5. Réponds à la question d'enquête (ou « Je ne sais pas ») pour un second appel texte.
6. Exporte la **fiche Markdown**.

Phrase utile : « Un étudiant arrive avec une erreur, comprend comment l'enquêter, et repart avec un principe réutilisable. »

---

## Lancer le projet / Run locally

Node.js `>= 20.9.0`.

```bash
git clone https://github.com/roldhaa/screenshot-debugger.git
cd screenshot-debugger
npm ci
cp .env.example .env
```

Renseigne `GEMINI_API_KEY` ([Google AI Studio](https://aistudio.google.com/apikey)). Optionnel : `PUBLIC_APP_URL`, `DEMO_ACCESS_TOKEN`, `GEMMA_MODEL`.

```bash
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000).

---

## Agent Skill et model harness

| Pièce | Chemin |
| --- | --- |
| Agent Skill | [`.agents/skills/screenshot-debugger/SKILL.md`](.agents/skills/screenshot-debugger/SKILL.md) |
| Harness | [`docs/HARNESS.md`](docs/HARNESS.md) |
| CLI live | `npm run harness:demo` |
| Enquête | `POST /api/investigate` |

---

## Gemma

Modèle : **Gemma 4** `gemma-4-26b-a4b-it` via la Gemini API (canal d'accès, pas un modèle Gemini de chat). Repli documenté : `gemma-4-31b-it`.

- [Run Gemma with the Gemini API](https://ai.google.dev/gemma/docs/core/gemma_on_gemini_api)
- [Model card Gemma 4](https://ai.google.dev/gemma/docs/core/model_card_4)

Les champs pédagogiques (`learn`, `investigationQuestion`, `learnedPrinciple`, `prevention`, `changeNotes`) sont produits dans **la même réponse JSON** que le diagnostic, pour respecter le budget d'appels.

---

## DigitalOcean

Web Service App Platform, région Toronto, ~5 $ US / mois. Spec : [`.do/app.yaml`](.do/app.yaml).  
`deploy_on_push: true` sur la branche **main** uniquement. Un push sur `main` redéploie l'URL publique.

---

## Captures et secrets

| Variable | Rôle |
| --- | --- |
| `GEMINI_API_KEY` | Clé serveur uniquement |
| `GEMMA_MODEL` | Défaut `gemma-4-26b-a4b-it` |
| `PUBLIC_APP_URL` | Allowlist Origin |
| `DEMO_ACCESS_TOKEN` | Optionnel, en-tête `x-demo-access` |

PNG/JPEG, 2 Mio max. Pas de journalisation d'image, de code ou de clé. Masque jetons et données personnelles avant l'envoi.

---

## Vérifier

```bash
npm test
npm run lint
npm run build
node examples/react-map-undefined/verify.mjs
npm run harness:demo
npm run prove:gemma
```

`npm test` simule Gemma. Seuls `harness:demo` et `prove:gemma` (avec clé) prouvent un appel réel.

---

## Limites

- Correction proposée, jamais exécutée.
- Passerelle publique ~20 s.
- 12 analyses / heure / processus.
- Annotations pixel et mini défi : reportés pour stabiliser la démo.
- Une déclaration « résolu » par l'utilisateur n'est pas une validation automatique.

---

## Licence

[MIT](LICENSE), copyright 2026 Harold Tcheuko Wouassi. Les paquets npm et les poids Gemma ne sont pas couverts par cette licence.

Construit pour le Hacktoberfest Hack Day Montréal x AGEEI, 9 octobre 2026.  
Soumission : [`docs/SUBMISSION.md`](docs/SUBMISSION.md) · État : [`PROJECT_STATE.md`](PROJECT_STATE.md).
