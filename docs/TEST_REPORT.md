# Rapport de tests

Environnement local : macOS, Node `v24.11.1`, npm `11.6.2`. Dépôt `screenshot-debugger`.

## Commandes exécutées

| Commande | Résultat |
| --- | --- |
| `npm test` | 36 tests passés, 1 test live ignoré. |
| `npm run lint` | réussi |
| `npm run build` | réussi, TypeScript inclus, route `/api/analyze` dynamique |
| `node examples/react-map-undefined/verify.mjs` | `before: TypeError reading map` puis `after: []` |
| `npm run prove:gemma` | pas relancé dans cette passe. L'appel public ci-dessous le remplace pour l'image d'un pixel. |

## Tests simulés

Ils injectent une fonction à la place de Gemma.

- PNG et JPEG valides, fichier vide, fichier trop lourd, HTML, SVG, PDF, dimensions hors limite.
- JSON valide, JSON tronqué, champs manquants, textes trop longs, statuts `needs_context`, `unreadable`, `no_error_detected`.
- Les métadonnées inventées par le modèle sont retirées.
- Un refus d'authentification, un modèle introuvable, un timeout et un JSON invalide respectent le budget de deux appels.
- Une image invalide ne déclenche pas l'appel.
- Une réponse contenant `<script>` reste du JSON.
- Le client n'importe pas `lib/server` ni la clé.

## Navigateur

Sur `http://localhost:3000`, le 9 octobre 2026 :

- État vide : Analyser est désactivé.
- Saisie du contexte et du code, compteur de caractères mis à jour.
- PNG accepté, aperçu affiché, Analyser activé.
- Analyse sans clé : message de chargement, puis « La clé API n'est pas configurée sur le serveur », bouton Réessayer.
- SVG renommé en PNG : « Seuls les fichiers PNG et JPEG sont acceptés. »
- Effacer revient à l'état vide.
- Charger l'exemple React remplit le framework, le contexte, le code et l'image.
- À 1440 px de large, la grille a deux colonnes et `scrollWidth` égale `clientWidth`.
- À 390 px de large, une seule colonne, pas de débordement horizontal, boutons d'au moins 44 px.

Le rapport complet n'a pas été affiché avec une réponse Gemma réelle.

## Adresse publique

Le 9 octobre 2026, sur https://screenshot-debugger-qzyjc.ondigitalocean.app :

| Essai | Résultat |
| --- | --- |
| Page d'accueil | 200, formulaire présent, aucune clé dans le HTML ni dans les scripts |
| Image d'exemple | 200, PNG de 42 727 octets |
| `GET /api/analyze` | 200, `demoProtected: false` |
| Origine étrangère | 403, `unsupported_origin` |
| Corps vide, champs manquants | 400, `invalid_body` |
| Fichier HTML | 400, `unsupported_type` |
| Base64 illisible | 400, `invalid_image` |
| Texte au-dessus de 15 000 caractères | 400, `text_too_long` |
| Corps au-dessus de 4 Mio | 413, `payload_too_large` |
| PNG d'un pixel | 200 en 7 s. Modèle `gemma-4-26b-a4b-it`, mode `live`, statut `unreadable` |
| Capture React complète, avant le raccourcissement | 504 de la passerelle vers 20 s |
| Capture React complète, commit `b383da3` | 200 en 9 s. Statut `diagnosed`, modèle `gemma-4-26b-a4b-it`, mode `live`. Erreur observée : `TypeError: Cannot read properties of undefined (reading 'map')`. |
| Même capture dans le navigateur | Le rapport affiche l'erreur, une hypothèse, la correction `(users \|\| []).map(...)` et une vérification. |

L'appel d'un pixel et la capture React sont tous les deux des réponses Gemma réelles. Le correctif n'est pas exécuté par l'application.
