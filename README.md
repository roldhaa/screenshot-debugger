# Screenshot Debugger

Application web open source pour les étudiants en JavaScript, TypeScript et React. Une capture d'erreur, avec un contexte facultatif, devient un diagnostic expliqué, une correction proposée et des étapes pour la vérifier.

Le diagnostic est produit par **Gemma 4** (`gemma-4-26b-a4b-it`, ou `gemma-4-31b-it` si le premier identifiant est refusé), appelé via la **Gemini API**. Gemma est le modèle. La Gemini API est seulement le moyen d'accès. L'image est envoyée au modèle. Ce n'est pas une réponse préfabriquée.

## Démo

```bash
node examples/react-map-undefined/verify.mjs
```

Le script bogué échoue sur `reading 'map'`. Le script corrigé affiche `[]`. La capture synthétique est dans `examples/react-map-undefined/error.png`. Dans l'application, le bouton **Charger l'exemple React** charge cette même capture.

## Installation

Node.js `>= 20.9.0`. Vérifié localement avec Node `v24.11.1`. L'intégration continue utilise Node 22.

```bash
npm ci
cp .env.example .env
```

Dans `.env`, renseigne `GEMINI_API_KEY` avec une clé créée dans [Google AI Studio](https://aistudio.google.com/apikey). Ne colle pas la clé dans un chat, un commit ou un fichier commité. Le fichier `.env` est ignoré par Git.

```bash
npm run dev
```

Ouvre `http://localhost:3000`.

## Variables

| Nom | Rôle |
| --- | --- |
| `GEMINI_API_KEY` | Clé lue uniquement par le serveur. Jamais `NEXT_PUBLIC_`. |
| `GEMMA_MODEL` | Optionnel. Défaut `gemma-4-26b-a4b-it`. |
| `DEMO_ACCESS_TOKEN` | Optionnel. S'il est défini, `POST /api/analyze` exige l'en-tête `x-demo-access`. |

`.env.example` ne contient aucune vraie clé.

## Vérification

```bash
npm test
npm run lint
npm run build
node examples/react-map-undefined/verify.mjs
npm run prove:gemma
```

`npm test` simule Gemma. `npm run prove:gemma` fait un appel réel et échoue clairement si la clé est absente. `npm run build` exécute aussi la vérification TypeScript de Next.js.

## Architecture

Le navigateur envoie la capture et le contexte à `POST /api/analyze`. Le serveur valide l'image, borne la requête, appelle Gemma, valide le JSON, puis renvoie un rapport. Le navigateur affiche ce rapport et peut le copier. Il n'appelle pas Google et n'exécute pas le code proposé.

## Licence et modèle

Le code de ce dépôt est sous [MIT](LICENSE). Cette licence ne couvre pas les paquets ni les poids de Gemma. La fiche du modèle est sur [ai.google.dev/gemma/docs/core/model_card_4](https://ai.google.dev/gemma/docs/core/model_card_4).

## Confidentialité

La capture, le contexte et le code sont envoyés à Google pour l'analyse. Cette application ne les enregistre pas volontairement. Cela ne décrit pas les journaux de Google ni ceux de l'hébergeur. Masque les jetons, mots de passe et données personnelles avant l'envoi.

## Limites

- Une correction est une proposition. L'application ne l'exécute pas et n'ouvre pas le dépôt.
- Une capture illisible ou incomplète doit produire `unreadable` ou `needs_context`, pas une certitude inventée.
- La limite d'analyses en mémoire ne vaut que pour un processus. Elle ne protège pas plusieurs instances serverless.
- Le quota, le coût et la latence réels dépendent du compte Google. Ils ne sont pas garantis ici.

## Outils utilisés pour développer

Cursor, avec le modèle Grok 4.7, a aidé à écrire ce dépôt pendant le Hacktoberfest Hack Day Montréal x AGEEI, le 9 octobre 2026. Les bibliothèques sont listées dans `package.json`. Next.js, React, Tailwind, Zod, Vitest et `@google/genai` ne sont pas du code original.

## Hackathon

Version de compétition du 9 octobre 2026 : parcours local, validation, rapport structuré, exemple React vérifié à la main, tests simulés. Un appel Gemma réel et un déploiement public restent à confirmer tant que la clé et l'hébergeur ne sont pas branchés. Voir [docs/SUBMISSION.md](docs/SUBMISSION.md) et [PROJECT_STATE.md](PROJECT_STATE.md).
