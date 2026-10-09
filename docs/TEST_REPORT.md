# Rapport de tests

Environnement local : macOS, Node `v24.11.1`, npm `11.6.2`. Dépôt `screenshot-debugger`.

## Commandes exécutées

| Commande | Résultat |
| --- | --- |
| `npm test` | 36 tests passés, 1 test live ignoré. |
| `npm run lint` | réussi |
| `npm run build` | réussi, TypeScript inclus, route `/api/analyze` dynamique |
| `node examples/react-map-undefined/verify.mjs` | `before: TypeError reading map` puis `after: []` |
| `npm run prove:gemma` | code de sortie 2 : `GEMINI_API_KEY` absente. Aucun appel réseau. |

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

## Live

Aucun appel fournisseur réel n'a été effectué. Ne pas marquer l'intégration live comme validée.
