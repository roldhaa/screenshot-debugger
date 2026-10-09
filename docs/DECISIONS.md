# Décisions

## Route serveur

Décision : le navigateur appelle `POST /api/analyze`, et seul le serveur parle à Google.

Besoin : la clé ne doit pas apparaître dans le bundle.

Pourquoi : une clé `NEXT_PUBLIC_` serait lisible par n'importe quel visiteur. Une route sur la même origine suffit pour ce parcours.

Alternative : appeler la Gemini API depuis le navigateur avec la clé de l'utilisateur. Moins adapté aujourd'hui, parce que la démo doit marcher sans demander à chaque juge de créer une clé.

Compromis : le serveur devient le point qui consomme le quota.

Validation : les composants client n'importent pas `lib/server`, et un test le vérifie. La réponse d'erreur ne contient pas la clé.

Jury : « L'image part de notre serveur vers Gemma. La clé n'est jamais dans la page. »

## Gemma par API

Décision : `gemma-4-26b-a4b-it` via `@google/genai`.

Besoin : une analyse image et texte réelle pendant la journée.

Pourquoi : le modèle est multimodal et documenté sur la Gemini API. Un runtime local ne tient pas dans le temps disponible.

Alternative : un modèle Gemini. Il ne qualifierait pas la catégorie Gemma.

Compromis : le quota, la latence et le coût dépendent du compte. Le repli `gemma-4-31b-it` n'est utilisé que si le premier identifiant est introuvable.

Validation : `npm run prove:gemma` doit imprimer un identifiant `gemma-4-` et `mode: live`. Cet appel n'a pas encore réussi, faute de clé.

Jury : « Gemma lit la capture. Gemini API est seulement la porte d'accès. »

## Code facultatif

Décision : le contexte et un extrait sont optionnels, et le modèle peut répondre `needs_context`.

Besoin : une capture ne montre pas toujours le fichier ni la cause.

Alternative : refuser toute analyse sans code. On perdrait les cas où l'erreur affichée suffit.

Compromis : le modèle peut encore se tromper. Le rapport sépare l'erreur observée et les hypothèses.

Validation : le schéma rejette un statut `needs_context` sans information manquante, et un statut `diagnosed` sans erreur observée.

Jury : « Si la capture ne suffit pas, le rapport le dit au lieu d'inventer un fichier. »

## Aucune exécution

Décision : le code proposé est affiché et copiable. Il n'est pas lancé.

Besoin : une suggestion hostile ou fausse ne doit pas toucher la machine du visiteur.

Alternative : un bac à sable qui exécute le correctif. Trop risqué et trop long pour aujourd'hui.

Compromis : la preuve avant/après se fait à la main dans `examples/react-map-undefined`.

Validation : `verify.mjs` montre l'échec puis `[]`. L'application continue de dire « correction proposée ».

Jury : « On a vérifié cet exemple nous-mêmes. L'application ne prétend pas avoir lancé le correctif. »

## Pas de compte

Décision : pas de base de données ni de connexion.

Besoin : garder le parcours démontrable.

Alternative : Firebase, déjà connu, pour un historique. Inutile pour les deux catégories visées.

Compromis : rien n'est conservé par l'application entre les sessions. Google et l'hébergeur peuvent avoir leurs propres journaux.

Jury : « On a construit le diagnostic, pas un produit de comptes. »

## DigitalOcean plutôt qu'un site statique

Décision : un Web Service App Platform, spec dans `.do/app.yaml`, taille `apps-s-1vcpu-0.5gb`.

Besoin : la route d'analyse doit tourner avec la clé sur le serveur.

Pourquoi : un site statique ne peut pas appeler Gemma sans exposer la clé. Next.js est déjà le serveur. Aucune migration.

Alternative : Vercel. Le compte CLI était déconnecté, et le cahier demande maintenant DigitalOcean.

Compromis : ce conteneur coûte environ 5 $ US par mois. Il n'a pas été créé. 512 Mio peuvent être justes pour Next.js.

Validation : la spec cite les commandes réelles `npm run build` et `npm start`. Next.js 16.4 écoute `0.0.0.0` et `PORT`. Aucune URL n'a été ouverte.

Jury : « DigitalOcean hébergerait le serveur qui appelle Gemma. On n'a pas lancé le conteneur payant sans accord. »

## Limite d'abus

Décision : 12 analyses par heure et 2 analyses simultanées, en mémoire, par processus. `DEMO_ACCESS_TOKEN` peut fermer l'endpoint.

Besoin : une démo publique sans limite globale ouvrirait la clé.

Alternative : un compteur seulement dans le navigateur. Il ne protège pas l'endpoint.

Compromis : plusieurs instances serverless ne partagent pas ce compteur. Sans déploiement protégé, il ne faut pas présenter l'URL comme un service ouvert.

Validation : les tests atteignent la limite et le plafond simultané.

Jury : « La limite actuelle protège une instance. Pour une URL publique, on ajoute un code d'accès serveur qui n'est pas dans Git. »
