# Screenshot Debugger

[![ci](https://github.com/roldhaa/screenshot-debugger/actions/workflows/ci.yml/badge.svg)](https://github.com/roldhaa/screenshot-debugger/actions/workflows/ci.yml)
[![licence MIT](https://img.shields.io/badge/licence-MIT-blue.svg)](LICENSE)

**FR ·** Comprends ton bug. Apprends à le résoudre.  
**EN ·** Understand your bug. Learn how to fix it.

**FR ·** Atelier de débogage guidé pour étudiants et développeurs en JavaScript, TypeScript et React. Une capture d’erreur devient une enquête, une correction expliquée et une fiche réutilisable.  
**EN ·** A guided debugging workshop for JavaScript, TypeScript and React students and developers. An error screenshot becomes an investigation, an explained fix, and a reusable error card.

**FR ·** Esprit Stack Overflow : comprendre, expliquer, partager. Pas d’affiliation. L’app n’exécute jamais la correction.  
**EN ·** Stack Overflow spirit: understand, explain, share. Not affiliated. The app never runs the fix.

**Démo en ligne / Live demo :** [https://screenshot-debugger-qzyjc.ondigitalocean.app/](https://screenshot-debugger-qzyjc.ondigitalocean.app/)  
(URL vérifiée le 9 octobre 2026 / checked on 9 October 2026. Quota Google et disponibilité non garantis.)

| | |
| --- | --- |
| Hackathon | Hacktoberfest Hack Day Montréal x AGEEI — 9 octobre 2026 |
| Catégories MLH | Best Use of Gemma 4 · Best Open-Source AI Project |
| Modèle / Model | Gemma 4 open-weight `gemma-4-26b-a4b-it` (via Gemini API) |
| Hébergement / Hosting | DigitalOcean App Platform Web Service (~5 $ US / mois) |
| Agent Skill | [`.agents/skills/screenshot-debugger/SKILL.md`](.agents/skills/screenshot-debugger/SKILL.md) |
| Model harness | [`docs/HARNESS.md`](docs/HARNESS.md) · `npm run harness:demo` |

---

## Sommaire / Table of contents

1. [Pourquoi je dois gagner / Why I should win](#pourquoi-je-dois-gagner--why-i-should-win)
2. [Ce qui est livré / What ships](#ce-qui-est-livré--what-ships)
3. [Comment ça marche / How it works](#comment-ça-marche--how-it-works)
4. [Agent Skill et model harness](#agent-skill-et-model-harness)
5. [Démonstration pour le jury / Judge demo](#démonstration-pour-le-jury--judge-demo)
6. [Exemple `.map` / Concrete example](#exemple-map--concrete-example)
7. [Gemma](#gemma)
8. [Lancer le projet / Run locally](#lancer-le-projet--run-locally)
9. [Captures et secrets / Uploads & secrets](#captures-et-secrets--uploads--secrets)
10. [DigitalOcean](#digitalocean)
11. [Vérifier le dépôt / Verify the repo](#vérifier-le-dépôt--verify-the-repo)
12. [Sécurité / Security](#sécurité--security)
13. [Limites connues / Known limits](#limites-connues--known-limits)
14. [Contribution](#contribution)
15. [Licence](#licence)

---

## Pourquoi je dois gagner / Why I should win

**FR ·** Construit le 9 octobre 2026 pour le Hacktoberfest Hack Day Montréal x AGEEI. Voici ce que le jury peut vérifier en moins de deux minutes. L’éligibilité aux prix est jugée par les organisateurs, pas certifiée ici.  
**EN ·** Built on 9 October 2026. Judges can verify in under two minutes. Prize eligibility is for organizers to decide.

### Critères MLH / DO → ce que tu as déjà / Criteria → what you already have

| Critère MLH / DO | Ton projet / This repo |
| --- | --- |
| Open-weight AI central / important | Oui : Gemma 4 `gemma-4-26b-a4b-it` dans [`lib/server/gemma.ts`](lib/server/gemma.ts) |
| Accès documenté | Oui : Gemini API = canal ; Gemma = modèle ([doc](https://ai.google.dev/gemma/docs/core/gemma_on_gemini_api)) |
| Image réelle, pas du texte inventé | Oui : Files API → `createPartFromUri`, fichier supprimé après l’appel |
| Appel live prouvable | Oui : `npm run harness:demo` / `npm run prove:gemma` → `mode: live` (~9–13 s) |
| Dépôt public + licence open source | Oui : GitHub + [MIT](LICENSE) |
| Infra DigitalOcean | Oui : App Platform Web Service, [URL](https://screenshot-debugger-qzyjc.ondigitalocean.app/), ~5 $ US / mois |
| Agent Skill (standard ouvert) | Oui : [`.agents/skills/screenshot-debugger/SKILL.md`](.agents/skills/screenshot-debugger/SKILL.md) |
| Model harness original | Oui : [`diagnose.ts`](lib/server/diagnose.ts) + [`gemma.ts`](lib/server/gemma.ts) + [`docs/HARNESS.md`](docs/HARNESS.md) |
| Produit pédagogique démo-able | Oui : Apprendre / Direct, enquête, diff, fiche |
| Clé hors navigateur | Oui : secret serveur DO, jamais `NEXT_PUBLIC_` |

### Best Use of Gemma 4

| Preuve / Proof | Détail / Detail |
| --- | --- |
| Modèle open-weight réel | `gemma-4-26b-a4b-it` — pas un modèle Gemini de chat |
| Image via Files API | `files.upload` → `createPartFromUri`, puis delete |
| Budget honnête | Au plus **2** appels fournisseur par requête ; thinking minimal ; JSON court |
| UI transparente | Badge **live**, compteur, modèle affiché (`Gemma 4 · gemma-4-26b-a4b-it`) |

### Best Open-Source AI Project

| Preuve / Proof | Détail / Detail |
| --- | --- |
| Agent Skill | Conforme à [agentskills.io](https://agentskills.io/specification) |
| Model harness original | Pipeline validation → prompt → Gemma → Zod |
| CLI sans UI | `npm run harness:demo` = même chemin que `POST /api/analyze` |
| Code public MIT | Dépôt GitHub + [`LICENSE`](LICENSE) |
| Sécurité pédagogique | Pas d’exécution du correctif, pas de log d’image/code |

### Différence avec un chatbot / vs a general chatbot

**FR ·** Un chatbot explique si on pose les bonnes questions. Screenshot Debugger structure ce travail : indices numérotés, observé ≠ hypothèse, enquête guidée, diff expliqué, vérifications, fiche réutilisable.  
**EN ·** A chatbot helps if you ask well. This product structures that work: numbered evidence, observations vs hypotheses, guided investigation, explained diff, verification, reusable card.

**FR ·** Nous n’affirmons pas d’amélioration durable de l’apprentissage sans étude.  
**EN ·** We do not claim lasting learning gains without a study.

### Ce qu’on a livré le jour J / What we shipped on day one

1. **Produit utilisable** FR/EN : capture → diagnostic → correction → vérifications.
2. **Trois boutons de démo** (Exemple 2 en premier) + **dix captures** dans [`examples/demo-captures/`](examples/demo-captures/).
3. **Agent Skill** + **harness CLI** (sans Launchpad ELK/RAG/GPU hors besoin).
4. **DigitalOcean** App Platform (clé hors navigateur).
5. **Preuve avant / après** : `node examples/react-map-undefined/verify.mjs`.

Hors scope volontaire : Launchpad Observability / RAG / Airflow, GPU Droplets, cache de réponses, OAuth, communauté publique.

---

## Ce qui est livré / What ships

| Fonction / Feature | État / Status |
| --- | --- |
| Analyse live Gemma 4 | Implémenté et vérifié |
| Modes **Apprendre** / **Diagnostic direct** | Implémenté et vérifié |
| Enquête `POST /api/investigate` | Implémenté ; route vérifiée en prod |
| Diff avant/après + `changeNotes` | Implémenté et vérifié |
| Fiche Markdown + `localStorage` | Implémenté et vérifié |
| Indices numérotés | Implémenté |

---

## Comment ça marche / How it works

```text
Capture PNG ou JPEG
        |
        v
Navigateur  -->  POST /api/analyze  -->  validation
                                              |
                                              v
                                         Gemma 4
                                     gemma-4-26b-a4b-it
                                              |
                                              v
                                    rapport structuré
         erreur · indices · hypothèses · learn · correction · vérif · fiche
                                              |
                         enquête optionnelle --> POST /api/investigate
```

**FR**

1. Tu déposes une capture. Tu peux ajouter contexte et code.
2. Tu choisis **Apprendre** ou **Diagnostic direct**.
3. Le navigateur appelle `POST /api/analyze` (same-origin). Il n’appelle pas Google.
4. Le serveur valide PNG/JPEG, taille et dimensions.
5. Gemma lit l’image et le texte (données, pas instructions).
6. Zod valide le JSON. Tu vois indices, hypothèses, puis (selon le mode) la correction.
7. Enquête optionnelle sans renvoyer l’image. Tu exportes une fiche Markdown.

**EN**

1. Drop a screenshot; optional context and code.
2. Choose **Apprendre** (Learn) or **Diagnostic direct**.
3. Browser posts to same-origin `/api/analyze`; it never calls Google.
4. Server validates PNG/JPEG, size, dimensions.
5. Gemma reads image and text as data, not instructions.
6. Zod validates JSON. You see evidence, hypotheses, then the fix (by mode).
7. Optional investigation without re-uploading the image. Export a Markdown card.

Parcours pédagogique / learning path : observer → hypothèse → preuve → comprendre → corriger → vérifier → retenir.

---

## Agent Skill et model harness

**FR ·** Pour **Best Open-Source AI Project**, le dépôt combine skill + harness original.  
**EN ·** For Best Open-Source AI Project: open skill + original harness.

| Pièce / Piece | Chemin / Path | Rôle / Role |
| --- | --- | --- |
| Agent Skill | [`.agents/skills/screenshot-debugger/SKILL.md`](.agents/skills/screenshot-debugger/SKILL.md) | Instructions agent ([standard](https://agentskills.io/specification)) |
| Schéma rapport | [`.agents/skills/screenshot-debugger/references/report-schema.md`](.agents/skills/screenshot-debugger/references/report-schema.md) | Aligné sur Zod |
| Model harness | [`lib/server/diagnose.ts`](lib/server/diagnose.ts) + [`lib/server/gemma.ts`](lib/server/gemma.ts) | Validation → Gemma 4 → Zod |
| Doc harness | [`docs/HARNESS.md`](docs/HARNESS.md) | Budget 2 appels, Files API, pas d’outils modèle |
| Preuve CLI | `npm run harness:demo` | Même chemin live que l’API, sans UI |

```bash
npm run harness:demo
# ou / or : HARNESS_EXAMPLE=1 npm run harness:demo
```

Exemple de sortie observée / sample live output :

```json
{
  "harness": "screenshot-debugger",
  "example": "2",
  "model": "gemma-4-26b-a4b-it",
  "status": "diagnosed",
  "mode": "live",
  "durationMs": 9045,
  "observedError": "TypeError: Cannot read properties of null (reading 'length')"
}
```

**FR ·** Un test simulé n’est **pas** une preuve Gemma. Seuls `harness:demo` et `prove:gemma` (avec clé) le sont.  
**EN ·** A mocked unit test is not Gemma proof. Only the live CLI scripts with a key are.

---

## Démonstration pour le jury / Judge demo

**URL publique :** [screenshot-debugger-qzyjc.ondigitalocean.app](https://screenshot-debugger-qzyjc.ondigitalocean.app)

### Test rapide dans l’application (recommandé) / In-app path

**FR ·** Trois exemples déjà chargés. Clique un bouton, mode **Apprendre**, puis **Analyser**.  
**EN ·** Three built-in examples. Click a button, Learn mode, then Analyser.

| Bouton | Erreur | Temps observé |
| --- | --- | --- |
| **Exemple 2 · null length** (premier) | `.length` sur `null` | ~9 s |
| **Exemple 1 · React map** | `.map()` sur `undefined` | ~13 s |
| **Exemple 3 · filter** | `.filter is not a function` | ~12 s |

Attendu / expect : badge **live**, statut Diagnostic / `diagnosed`, erreur visible, modèle `gemma-4-26b-a4b-it`. Passerelle DO ~20 s : ces exemples restent sous la limite.

### Images à téléverser soi-même / Manual uploads

Dossier : [`examples/demo-captures/`](examples/demo-captures/) (captures **synthétiques** / synthetic screenshots).

| Fichier | Erreur visible |
| --- | --- |
| [`01-react-map.png`](examples/demo-captures/01-react-map.png) | map sur undefined |
| [`02-null-length.png`](examples/demo-captures/02-null-length.png) | length sur null |
| [`03-not-a-function.png`](examples/demo-captures/03-not-a-function.png) | filter is not a function |
| [`04-json-parse.png`](examples/demo-captures/04-json-parse.png) | JSON.parse reçoit du HTML |
| [`05-not-defined.png`](examples/demo-captures/05-not-defined.png) | count is not defined |
| [`06-set-undefined.png`](examples/demo-captures/06-set-undefined.png) | écriture sur undefined |
| [`07-module-not-found.png`](examples/demo-captures/07-module-not-found.png) | module introuvable |
| [`08-promise-rejection.png`](examples/demo-captures/08-promise-rejection.png) | promesse sans catch |
| [`09-assignment-const.png`](examples/demo-captures/09-assignment-const.png) | assignation à une const |
| [`10-react-key.png`](examples/demo-captures/10-react-key.png) | clé React manquante |

### Script démo 60–90 s

1. URL publique → **Exemple 2** → **Apprendre** → **Analyser**.  
2. Indices + badge live.  
3. Indice → **Afficher la correction** → diff → **Exporter ma fiche**.

Phrase jury : « Un étudiant arrive avec une erreur, comprend comment l’enquêter, et repart avec un principe réutilisable. »

---

## Exemple `.map` / Concrete example

**Exemple 1 · React map** — `public/fixtures/demo-1-react-map.png` (synthétique).

| | FR | EN |
| --- | --- | --- |
| Visible | `TypeError` lié à `map` | `TypeError` involving `map` |
| À confirmer | État initial **ou** API non-tableau | Missing initial state **or** non-array API |
| Question utile | Comment `users` est initialisé ? | How is `users` initialized? |
| Fix possible | `[]` + loading **ou** mapping `items` | Safe init + loading **or** fix mapping |
| Attention | `[]` ≠ correctif universel | `[]` is not a universal fix |
| Principe | Forme des données au rendu | Data shape at render time |

```bash
node examples/react-map-undefined/verify.mjs
```

```text
before: TypeError reading map
after: []
```

**FR ·** L’app propose la correction ; elle ne l’exécute pas. `verify.mjs` = correctif à la main.  
**EN ·** The app proposes the fix; it does not run it. `verify.mjs` is hand-applied.

---

## Gemma

**FR ·** Le modèle est **Gemma 4**, id `gemma-4-26b-a4b-it`. Ce n’est **pas** un modèle Gemini. La Gemini API est le canal d’accès. Repli documenté (non observé en prod) : `gemma-4-31b-it`.  
**EN ·** Model is **Gemma 4** `gemma-4-26b-a4b-it`, not a Gemini chat model. Gemini API is only the access channel. Documented fallback: `gemma-4-31b-it`.

- Doc : [Run Gemma with the Gemini API](https://ai.google.dev/gemma/docs/core/gemma_on_gemini_api)
- Model card : [Gemma 4](https://ai.google.dev/gemma/docs/core/model_card_4)
- Code : [`lib/server/gemma.ts`](lib/server/gemma.ts) — upload, `createPartFromUri`, thinking minimal, JSON court, delete fichier

Au plus deux appels fournisseur par analyse. Champs pédagogiques (`learn`, `investigationQuestion`, `learnedPrinciple`, `prevention`, `changeNotes`) dans le **même JSON**.

**FR ·** Cursor a aidé à écrire le dépôt. Gemma analyse les captures dans le produit. Deux rôles différents.  
**EN ·** Cursor helped write the repo. Gemma analyzes screenshots in the product. Different roles.

---

## Lancer le projet / Run locally

Node.js `>= 20.9.0` (CI : Node 22).

```bash
git clone https://github.com/roldhaa/screenshot-debugger.git
cd screenshot-debugger
npm ci
cp .env.example .env
```

**FR ·** Mets `GEMINI_API_KEY` ([Google AI Studio](https://aistudio.google.com/apikey)). Ne la colle jamais dans un commit ou un chat.  
**EN ·** Set `GEMINI_API_KEY`. Never paste the real key into commits or chat.

```bash
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000). Sans clé, l’UI le dit clairement — ce n’est pas une analyse.

```bash
npm run build && npm start
```

---

## Captures et secrets / Uploads & secrets

| Nom | Où | Rôle |
| --- | --- | --- |
| `GEMINI_API_KEY` | `.env` ou secret DO | Clé serveur. Jamais `NEXT_PUBLIC_`. |
| `GEMMA_MODEL` | optionnel | Défaut `gemma-4-26b-a4b-it`. |
| `PUBLIC_APP_URL` | optionnel | Allowlist Origin (URL publique). |
| `DEMO_ACCESS_TOKEN` | optionnel | Si défini → en-tête `x-demo-access`. |

`.env` est ignoré par Git. [`.env.example`](.env.example) est vide de secrets.

**FR ·** PNG/JPEG par signature magique. Max 2 Mio, 4096 px, 8 M pixels. Contexte + code ≤ 15 000 caractères. Masque mots de passe et jetons. Pas de log d’image, code ou clé.  
**EN ·** PNG/JPEG by magic bytes. Max 2 MiB / 4096 px / 8M pixels. Context + code ≤ 15 000 chars. Redact secrets. No logging of image, code, or key.

---

## DigitalOcean

Web Service [App Platform](https://docs.digitalocean.com/products/app-platform/) — un site statique ne peut pas garder la clé hors navigateur. Spec : [`.do/app.yaml`](.do/app.yaml). Notes : [`docs/DIGITALOCEAN.md`](docs/DIGITALOCEAN.md).

| Réglage | Valeur |
| --- | --- |
| Build | `npm run build` |
| Démarrage | `npm start` |
| Port | `8080` |
| Région | Toronto (`tor`) |
| Branche | `main`, `deploy_on_push: true` |
| Taille | `apps-s-1vcpu-0.5gb`, ~5 $ US / mois (confirmer au billing) |
| Secret | `GEMINI_API_KEY` |
| Env | `GEMMA_MODEL`, `PUBLIC_APP_URL` |

**FR ·** DigitalOcean héberge Next.js. Il n’héberge **pas** les poids Gemma. Push `main` = redéploiement.  
**EN ·** DO hosts Next.js, not Gemma weights. Pushing `main` redeploys.

---

## Vérifier le dépôt / Verify the repo

```bash
npm test
npm run lint
npm run typecheck
npm run build
node examples/react-map-undefined/verify.mjs
npm run harness:demo
npm run prove:gemma
```

| Commande | Rôle |
| --- | --- |
| `npm test` | Tests (Gemma **simulé**) |
| `npm run lint` / `build` | Qualité + TypeScript |
| `npm run harness:demo` | Preuve live Exemple 2 |
| `npm run prove:gemma` | Preuve live React map |

**FR ·** Catalogue eval : [`examples/eval/cases.json`](examples/eval/cases.json) · [`docs/EVAL.md`](docs/EVAL.md).  
**EN ·** Eval catalog is for human review; not a full live suite by itself.

---

## Sécurité / Security

Détails : [`docs/SECURITY.md`](docs/SECURITY.md).

| Formulation | Sens |
| --- | --- |
| Correction proposée | Suggestion, non appliquée |
| Résolution déclarée | Case utilisateur ≠ validation auto |
| Testé par le système | **N’existe pas** |

**FR ·** Données envoyées à Google le temps de l’analyse. Fiches `localStorage` = ce navigateur.  
**EN ·** Data goes to Google for the call. Local cards stay in this browser.

---

## Limites connues / Known limits

- Correction = proposition ; rien n’est exécuté.
- Passerelle publique ~20 s.
- Google peut répondre 500 / JSON inutilisable ; l’app n’invente pas un rapport.
- 12 analyses / heure / processus (mémoire du conteneur).
- Capture illisible → `unreadable` ; cause invisible → `needs_context`.

---

## Contribution

**FR ·** `npm test` + `lint` + `build` avant une PR. Pas de secrets dans les issues. Vulnérabilités : signalement privé GitHub s’il est activé.  
**EN ·** Run tests/lint/build before a PR. No secrets in issues. Use GitHub private security reporting if enabled.

---

## Licence

[MIT](LICENSE), copyright 2026 Harold Tcheuko Wouassi.

**FR ·** Ne couvre pas npm, poids Gemma, ni conditions Google.  
**EN ·** Does not re-license npm packages, Gemma weights, or Google terms.

Soumission : [`docs/SUBMISSION.md`](docs/SUBMISSION.md) · État : [`PROJECT_STATE.md`](PROJECT_STATE.md) · Harness : [`docs/HARNESS.md`](docs/HARNESS.md).
