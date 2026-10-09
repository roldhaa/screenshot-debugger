# Screenshot Debugger

[![ci](https://github.com/roldhaa/screenshot-debugger/actions/workflows/ci.yml/badge.svg)](https://github.com/roldhaa/screenshot-debugger/actions/workflows/ci.yml)
[![licence MIT](https://img.shields.io/badge/licence-MIT-blue.svg)](LICENSE)

Un étudiant voit une erreur dans un terminal ou une console et ne sait pas quoi vérifier. Screenshot Debugger transforme une capture, plus un contexte facultatif, en un diagnostic expliqué, une correction proposée et des étapes pour la contrôler.

Le public visé est les étudiants en JavaScript, TypeScript et React. Le code est open source, licence MIT. L'application n'exécute jamais la correction.

**Démo en ligne :** [screenshot-debugger-qzyjc.ondigitalocean.app](https://screenshot-debugger-qzyjc.ondigitalocean.app)

Le 9 octobre 2026, les boutons **Exemple 1**, **Exemple 2** et **Exemple 3** ont produit des rapports Gemma 4 réels (`diagnosed`). Les images à tester à la main sont dans [`examples/demo-captures/`](examples/demo-captures/).

## Comment ça marche

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
                         erreur observée, hypothèses, correction, vérifications
```

1. Tu déposes une capture d'erreur. Tu peux ajouter ce que tu essayais de faire et un extrait de code.
2. Le navigateur envoie le tout à `POST /api/analyze`. Il n'appelle pas Google.
3. Le serveur vérifie le format, la taille et les dimensions. Un fichier qui n'est pas un PNG ou un JPEG est refusé avant l'appel.
4. Gemma lit l'image et le texte. Le texte présent dans la capture est traité comme une donnée, jamais comme une instruction.
5. Le serveur valide le JSON du modèle, puis le navigateur affiche le rapport. Tu peux le copier. Tu appliques la correction toi-même.

L'appel réel est dans [`lib/server/gemma.ts`](lib/server/gemma.ts).

| Élément du rapport | Rôle |
| --- | --- |
| Erreur observée | Ce qui est lisible dans la capture |
| Indices | Lignes ou messages vraiment visibles |
| Hypothèses | Causes possibles, à vérifier |
| Correction proposée | Changement minimal, non appliqué |
| Vérification | Action à faire et résultat attendu |
| Contexte manquant | Ce qu'il faut fournir si l'image ne suffit pas |

Les statuts possibles sont `diagnosed`, `needs_context`, `unreadable` et `no_error_detected`. Il n'y a pas de pourcentage de confiance.

## Lancer le projet

Il faut Node.js `>= 20.9.0`. Le développement local a été fait avec Node `v24.11.1`. L'intégration continue utilise Node 22.

```bash
git clone https://github.com/roldhaa/screenshot-debugger.git
cd screenshot-debugger
npm ci
cp .env.example .env
```

Ouvre `.env` et mets ta clé sur la ligne `GEMINI_API_KEY`. Crée-la dans [Google AI Studio](https://aistudio.google.com/apikey). Ne la colle pas dans un commit, un ticket ou un message.

```bash
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000).

Sans clé, l'interface le dit clairement. Ce n'est pas une analyse.

## Démonstration pour le jury

**URL publique :** [screenshot-debugger-qzyjc.ondigitalocean.app](https://screenshot-debugger-qzyjc.ondigitalocean.app)

### Test rapide dans l'application (recommandé)

Trois exemples sont déjà chargés dans l'interface. Clique un bouton, puis **Analyser**. Aucun fichier à chercher.

| Bouton | Erreur | Temps observé (appel public) |
| --- | --- | --- |
| **Exemple 1 · React map** | `.map()` sur `undefined` | ~13 s |
| **Exemple 2 · null length** | `.length` sur `null` | ~9 s |
| **Exemple 3 · filter** | `.filter is not a function` | ~12 s |

Les trois ont renvoyé le statut `diagnosed` avec Gemma 4 (`gemma-4-26b-a4b-it`). La passerelle DigitalOcean coupe vers 20 secondes : ces exemples restent sous cette limite.

### Images à téléverser soi-même

Dossier : [`examples/demo-captures/`](examples/demo-captures/). Ce sont des PNG lisibles, prêts à déposer dans **Capture PNG ou JPEG**.

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

Le détail est aussi dans [`examples/demo-captures/README.md`](examples/demo-captures/README.md).

### Preuve avant / après (exemple map)

```bash
node examples/react-map-undefined/verify.mjs
```

Résultat attendu :

```text
before: TypeError reading map
after: []
```

L'application propose la correction. Elle ne l'exécute pas. `verify.mjs` montre le correctif appliqué à la main.

Pour un appel Gemma local :

```bash
npm run prove:gemma
```

La commande charge `.env` sans afficher la clé. Elle échoue tout de suite si `GEMINI_API_KEY` est vide, sans contacter Google.

## Gemma

Le modèle utilisé est **Gemma 4**, identifiant `gemma-4-26b-a4b-it`. Ce n'est pas un modèle Gemini. La Gemini API est seulement le canal d'accès. Si cet identifiant est introuvable, le serveur essaie `gemma-4-31b-it`. Ce repli n'a pas été observé en production.

Google documente ces deux identifiants, et l'envoi d'image par `files.upload` puis `createPartFromUri`, sur [Run Gemma with the Gemini API](https://ai.google.dev/gemma/docs/core/gemma_on_gemini_api). Le serveur suit ce chemin, puis supprime le fichier envoyé. La fiche du modèle est sur [model card Gemma 4](https://ai.google.dev/gemma/docs/core/model_card_4).

Au plus deux appels fournisseur par analyse. La réflexion interne du modèle est réglée au minimum, et la réponse est courte, pour tenir dans le délai de la passerelle.

## DigitalOcean

L'adresse publique est un Web Service [App Platform](https://docs.digitalocean.com/products/app-platform/). Un site statique ne peut pas garder la clé hors du navigateur. La spec est [`.do/app.yaml`](.do/app.yaml).

| Réglage | Valeur |
| --- | --- |
| Build | `npm run build` |
| Démarrage | `npm start` |
| Port | `8080` |
| Région | Toronto |
| Taille | 1 vCPU partagé, 512 Mio, environ 5 $ US par mois |

DigitalOcean héberge le serveur Next.js. Il n'héberge pas les poids de Gemma. Les étapes et le prix sont dans [`docs/DIGITALOCEAN.md`](docs/DIGITALOCEAN.md).

## Captures et secrets

| Nom | Où | Rôle |
| --- | --- | --- |
| `GEMINI_API_KEY` | `.env` ou secret d'exécution | Clé serveur. Jamais `NEXT_PUBLIC_`. |
| `GEMMA_MODEL` | optionnel | Défaut `gemma-4-26b-a4b-it`. |
| `DEMO_ACCESS_TOKEN` | optionnel | S'il est défini, chaque analyse doit envoyer l'en-tête `x-demo-access`. |

`.env` est ignoré par Git. [`.env.example`](.env.example) ne contient pas de vraie clé.

Avant l'envoi, l'interface prévient que la capture et le texte partent chez Google. L'application ne conserve pas les captures. Elle n'écrit pas l'image, le code ni la clé dans ses journaux. Masque les jetons, mots de passe et données personnelles avant de déposer une capture. Les journaux de Google et de l'hébergeur ne sont pas sous le contrôle de ce dépôt.

Formats acceptés : PNG et JPEG, reconnus par leur signature, pas par le nom du fichier. Maximum 2 Mio, 4096 pixels de côté et 8 millions de pixels. Le contexte et le code ensemble ne dépassent pas 15 000 caractères.

## Vérifier le dépôt

```bash
npm test
npm run lint
npm run build
node examples/react-map-undefined/verify.mjs
npm run prove:gemma
```

`npm test` simule Gemma. Un test simulé ne prouve pas un appel réel. `npm run build` inclut la vérification TypeScript de Next.js.

## Limites connues

- La correction est une proposition. Rien n'est exécuté, et aucun dépôt n'est ouvert.
- La passerelle publique coupe une analyse vers 20 secondes. Une réponse trop longue échoue. Tu peux réessayer.
- Google peut répondre 500, ou produire un JSON inutilisable. L'application n'invente pas un rapport à la place.
- Douze analyses par heure et par processus. Le compteur repart à zéro au redémarrage du conteneur.
- Le quota et le coût Google dépendent du compte qui possède la clé.
- Une capture illisible doit donner `unreadable`. Une cause invisible doit donner `needs_context`.

## Licence

Le code de ce dépôt est sous [MIT](LICENSE), copyright 2026 Harold Tcheuko Wouassi. Cette licence ne couvre pas les paquets npm ni les poids de Gemma.

Construit pour le Hacktoberfest Hack Day Montréal x AGEEI, le 9 octobre 2026. Cursor, avec le modèle Grok 4.7, a aidé à écrire le dépôt. Next.js, React, Tailwind CSS, Zod, Vitest et `@google/genai` ne sont pas du code original.

Les textes de soumission et l'état du jour sont dans [`docs/SUBMISSION.md`](docs/SUBMISSION.md) et [`PROJECT_STATE.md`](PROJECT_STATE.md).
