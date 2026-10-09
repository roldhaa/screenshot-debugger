# Screenshot Debugger

[![ci](https://github.com/roldhaa/screenshot-debugger/actions/workflows/ci.yml/badge.svg)](https://github.com/roldhaa/screenshot-debugger/actions/workflows/ci.yml)
[![licence MIT](https://img.shields.io/badge/licence-MIT-blue.svg)](LICENSE)

**FR** · Un étudiant voit une erreur dans un terminal ou une console et ne sait pas quoi vérifier. Screenshot Debugger transforme une capture, plus un contexte facultatif, en un diagnostic expliqué, une correction proposée et des étapes pour la contrôler.

**EN** · A student sees an error in a terminal or browser console and does not know what to check next. Screenshot Debugger turns a screenshot, plus optional context, into a clear diagnosis, a proposed fix, and verification steps.

Public cible / audience : étudiants en JavaScript, TypeScript et React. Open source, licence MIT. L'application n'exécute jamais la correction / the app never runs the fix.

**Démo en ligne / Live demo :** [screenshot-debugger-qzyjc.ondigitalocean.app](https://screenshot-debugger-qzyjc.ondigitalocean.app)

| | |
| --- | --- |
| Hackathon | Hacktoberfest Hack Day Montréal x AGEEI — 9 octobre 2026 |
| Catégories MLH | Best Use of Gemma 4 · Best Open-Source AI Project |
| Modèle | Gemma 4 open-weight `gemma-4-26b-a4b-it` (via Gemini API) |
| Hébergement | DigitalOcean App Platform (~5 $ US / mois) |
| Agent Skill | [`.agents/skills/screenshot-debugger/SKILL.md`](.agents/skills/screenshot-debugger/SKILL.md) |
| Model harness | [`docs/HARNESS.md`](docs/HARNESS.md) · `npm run harness:demo` |

---

## Sommaire / Table of contents

1. [Pourquoi ce projet peut gagner](#pourquoi-ce-projet-peut-gagner--why-this-can-win)
2. [Comment ça marche](#comment-ça-marche--how-it-works)
3. [Agent Skill et model harness](#agent-skill-et-model-harness)
4. [Démonstration pour le jury](#démonstration-pour-le-jury--judge-demo)
5. [Lancer le projet](#lancer-le-projet--run-locally)
6. [Gemma](#gemma)
7. [DigitalOcean](#digitalocean)
8. [Captures et secrets](#captures-et-secrets--uploads--secrets)
9. [Vérifier le dépôt](#vérifier-le-dépôt--verify-the-repo)
10. [Limites connues](#limites-connues--known-limits)
11. [Licence](#licence)

---

## Pourquoi ce projet peut gagner / Why this can win

Construit le **9 octobre 2026** pour le Hacktoberfest Hack Day Montréal x AGEEI. Voici ce que le jury peut vérifier en moins de deux minutes.

### Best Use of Gemma 4

| Preuve | Détail |
| --- | --- |
| Modèle open-weight réel | `gemma-4-26b-a4b-it` dans [`lib/server/gemma.ts`](lib/server/gemma.ts) — pas un modèle Gemini de chat |
| Image, pas du texte inventé | Files API (`files.upload` → `createPartFromUri`), puis suppression du fichier |
| Appel live prouvé | `npm run harness:demo` et `npm run prove:gemma` → `mode: live`, ~9–13 s |
| Budget honnête | Au plus **deux** appels fournisseur par analyse ; thinking minimal ; JSON court |
| UI transparente | Badge **live**, compteur pendant l'analyse, modèle affiché (`Gemma 4 · gemma-4-26b-a4b-it`) |

### Best Open-Source AI Project

| Preuve | Détail |
| --- | --- |
| Agent Skill (standard ouvert) | [`.agents/skills/screenshot-debugger/SKILL.md`](.agents/skills/screenshot-debugger/SKILL.md) conforme à [agentskills.io](https://agentskills.io/specification) |
| Model harness original | Pipeline `validate` → prompt → Gemma → Zod dans [`diagnose.ts`](lib/server/diagnose.ts) + [`gemma.ts`](lib/server/gemma.ts), documenté dans [`docs/HARNESS.md`](docs/HARNESS.md) |
| CLI sans UI | `npm run harness:demo` : même chemin que `POST /api/analyze` |
| Code public MIT | Dépôt GitHub + [`LICENSE`](LICENSE) |
| Sécurité pédagogique | Clé serveur seulement, pas d'exécution du correctif, pas de log d'image/code |

### Ce qu'on a livré le jour J / What we shipped on day one

1. **Produit utilisable** : capture → diagnostic → correction proposée → vérifications, en français ou anglais.
2. **Trois boutons de démo** dans l'UI (Exemple 2 en premier, le plus rapide) + **dix captures** dans [`examples/demo-captures/`](examples/demo-captures/).
3. **Agent Skill** + **harness CLI** pour la catégorie open-source AI, sans Launchpad ELK/RAG/GPU hors besoin.
4. **Déploiement DigitalOcean** App Platform (Web Service, clé hors navigateur) : [URL publique](https://screenshot-debugger-qzyjc.ondigitalocean.app).
5. **Preuve avant / après** : `node examples/react-map-undefined/verify.mjs` montre le bug puis le correctif appliqué à la main.

Hors scope volontaire (pour rester honnête et démo-able) : Launchpad Observability / RAG / Airflow, GPU Droplets, cache de réponses, OAuth.

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
              erreur observée · hypothèses · correction · vérifications
```

**FR**

1. Tu déposes une capture d'erreur. Tu peux ajouter ce que tu essayais de faire et un extrait de code.
2. Le navigateur envoie le tout à `POST /api/analyze`. Il n'appelle pas Google.
3. Le serveur vérifie le format, la taille et les dimensions. Un fichier qui n'est pas un PNG ou un JPEG est refusé avant l'appel.
4. Gemma lit l'image et le texte. Le texte présent dans la capture est traité comme une donnée, jamais comme une instruction.
5. Le serveur valide le JSON du modèle (Zod), puis le navigateur affiche le rapport. Tu appliques la correction toi-même.

**EN**

1. Drop an error screenshot. Optionally add what you were trying to do and a short code excerpt.
2. The browser posts to `POST /api/analyze`. It never calls Google directly.
3. The server checks format, size, and dimensions. Non-PNG/JPEG files are rejected before any model call.
4. Gemma reads the image and text. Screenshot text is data, never instructions.
5. The server validates model JSON with Zod, then the UI shows the report. You apply the fix yourself.

| Élément du rapport / Report field | Rôle / Role |
| --- | --- |
| Erreur observée / Observed error | Ce qui est lisible dans la capture |
| Indices / Evidence | Lignes ou messages vraiment visibles |
| Hypothèses / Hypotheses | Causes possibles, à vérifier |
| Correction proposée / Proposed fix | Changement minimal, **non appliqué** |
| Code proposé / Suggested code | Extrait optionnel |
| Vérification / Verification | Action à faire et résultat attendu |
| Contexte manquant / Missing context | Ce qu'il faut fournir si l'image ne suffit pas |

Statuts : `diagnosed`, `needs_context`, `unreadable`, `no_error_detected`. Pas de pourcentage de confiance inventé.

---

## Agent Skill et model harness

Pour la catégorie **Best Open-Source AI Project**, le dépôt combine :

| Pièce / Piece | Chemin / Path | Rôle / Role |
| --- | --- | --- |
| Agent Skill | [`.agents/skills/screenshot-debugger/SKILL.md`](.agents/skills/screenshot-debugger/SKILL.md) | Instructions agent conformes au [Agent Skill Open Standard](https://agentskills.io/specification) |
| Schéma de rapport | [`.agents/skills/screenshot-debugger/references/report-schema.md`](.agents/skills/screenshot-debugger/references/report-schema.md) | Champs alignés sur Zod |
| Model harness | [`lib/server/diagnose.ts`](lib/server/diagnose.ts) + [`lib/server/gemma.ts`](lib/server/gemma.ts) | Pipeline original validation → Gemma 4 → Zod |
| Doc harness | [`docs/HARNESS.md`](docs/HARNESS.md) | Budget 2 appels, Files API, thinking minimal, pas d'outils modèle |
| Preuve CLI | `npm run harness:demo` | Même chemin live que l'API, sans UI |

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

Un test simulé n'est **pas** une preuve d'appel Gemma. Seuls `harness:demo` et `prove:gemma` (avec clé) le sont.

---

## Démonstration pour le jury / Judge demo

**URL publique :** [screenshot-debugger-qzyjc.ondigitalocean.app](https://screenshot-debugger-qzyjc.ondigitalocean.app)

### Test rapide dans l'application (recommandé) / In-app path

Trois exemples sont déjà chargés. Clique un bouton, puis **Analyser**. Aucun fichier à chercher.

| Bouton | Erreur | Temps observé |
| --- | --- | --- |
| **Exemple 2 · null length** (premier) | `.length` sur `null` | ~9 s |
| **Exemple 1 · React map** | `.map()` sur `undefined` | ~13 s |
| **Exemple 3 · filter** | `.filter is not a function` | ~12 s |

Attendu à l'écran : badge **live**, statut Diagnostic / `diagnosed`, erreur observée visible, modèle `gemma-4-26b-a4b-it`. La passerelle DigitalOcean coupe vers ~20 s : ces exemples restent sous la limite.

### Images à téléverser soi-même / Manual uploads

Dossier : [`examples/demo-captures/`](examples/demo-captures/).

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

### Preuve avant / après (exemple map)

```bash
node examples/react-map-undefined/verify.mjs
```

```text
before: TypeError reading map
after: []
```

L'application propose la correction. Elle ne l'exécute pas. `verify.mjs` montre le correctif appliqué à la main.

---

## Lancer le projet / Run locally

Node.js `>= 20.9.0` (dev local testé avec Node `v24.11.1` ; CI : Node 22).

```bash
git clone https://github.com/roldhaa/screenshot-debugger.git
cd screenshot-debugger
npm ci
cp .env.example .env
```

Ouvre `.env` et mets ta clé sur `GEMINI_API_KEY` ([Google AI Studio](https://aistudio.google.com/apikey)). Ne la colle jamais dans un commit, un ticket ou un chat.

```bash
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000). Sans clé, l'interface le dit clairement — ce n'est pas une analyse.

---

## Gemma

Le modèle est **Gemma 4**, identifiant `gemma-4-26b-a4b-it`. Ce n'est **pas** un modèle Gemini. La Gemini API est seulement le canal d'accès. Repli documenté (non observé en prod) : `gemma-4-31b-it`.

- Doc Google : [Run Gemma with the Gemini API](https://ai.google.dev/gemma/docs/core/gemma_on_gemini_api)
- Model card : [Gemma 4](https://ai.google.dev/gemma/docs/core/model_card_4)
- Implémentation : [`lib/server/gemma.ts`](lib/server/gemma.ts) — `files.upload`, `createPartFromUri`, thinking minimal, `maxOutputTokens` court, fichier supprimé après l'appel

Au plus deux appels fournisseur par analyse (retry schéma / modèle / transient rapide, ou réparation JSON).

---

## DigitalOcean

Web Service [App Platform](https://docs.digitalocean.com/products/app-platform/) — un site statique ne peut pas garder la clé hors du navigateur. Spec : [`.do/app.yaml`](.do/app.yaml). Détail : [`docs/DIGITALOCEAN.md`](docs/DIGITALOCEAN.md).

| Réglage | Valeur |
| --- | --- |
| Build | `npm run build` |
| Démarrage | `npm start` |
| Port | `8080` |
| Région | Toronto (TOR1) |
| Taille | 1 vCPU partagé, 512 Mio, ~5 $ US / mois |

DigitalOcean héberge Next.js. Il n'héberge **pas** les poids de Gemma.

---

## Captures et secrets / Uploads & secrets

| Nom | Où | Rôle |
| --- | --- | --- |
| `GEMINI_API_KEY` | `.env` ou secret d'exécution | Clé serveur. Jamais `NEXT_PUBLIC_`. |
| `GEMMA_MODEL` | optionnel | Défaut `gemma-4-26b-a4b-it`. |
| `DEMO_ACCESS_TOKEN` | optionnel | Si défini, chaque analyse doit envoyer `x-demo-access`. |

`.env` est ignoré par Git. [`.env.example`](.env.example) ne contient pas de vraie clé.

Formats : PNG et JPEG (signature magique, pas l'extension). Max 2 Mio, 4096 px de côté, 8 M pixels. Contexte + code ≤ 15 000 caractères. Masque mots de passe et jetons avant l'envoi. L'app ne journalise pas l'image, le code ni la clé.

---

## Vérifier le dépôt / Verify the repo

```bash
npm test
npm run lint
npm run build
node examples/react-map-undefined/verify.mjs
npm run harness:demo
npm run prove:gemma
```

| Commande | Rôle |
| --- | --- |
| `npm test` | Tests unitaires (Gemma **simulé**) |
| `npm run lint` / `npm run build` | Qualité et TypeScript |
| `npm run harness:demo` | Preuve live Exemple 2 (défaut) |
| `npm run prove:gemma` | Preuve live capture React map |

Dernière passe locale (9 oct. 2026) : 38 tests passés, lint OK, build OK, harness ~9 s `diagnosed` live, `verify.mjs` OK, `prove:gemma` OK.

---

## Limites connues / Known limits

- La correction est une proposition. Rien n'est exécuté, aucun dépôt n'est ouvert.
- La passerelle publique coupe une analyse vers ~20 secondes.
- Google peut répondre 500 ou produire un JSON inutilisable ; l'app n'invente pas un rapport à la place.
- Douze analyses par heure et par processus (compteur remis à zéro au redémarrage).
- Quota et coût Google dépendent du compte qui possède la clé.
- Capture illisible → `unreadable`. Cause invisible → `needs_context`.

---

## Licence

Le code de ce dépôt est sous [MIT](LICENSE), copyright 2026 Harold Tcheuko Wouassi. Cette licence ne couvre pas les paquets npm ni les poids de Gemma.

Construit pour le **Hacktoberfest Hack Day Montréal x AGEEI**, le 9 octobre 2026. Cursor a aidé à écrire le dépôt. Next.js, React, Tailwind CSS, Zod, Vitest et `@google/genai` ne sont pas du code original.

Textes de soumission et état du jour : [`docs/SUBMISSION.md`](docs/SUBMISSION.md) · [`PROJECT_STATE.md`](PROJECT_STATE.md) · [`docs/HARNESS.md`](docs/HARNESS.md).
