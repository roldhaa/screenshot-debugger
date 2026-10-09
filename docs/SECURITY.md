# Sécurité

## Menaces et contrôles

| Menace | Contrôle | Limite |
| --- | --- | --- |
| Fuite de la clé | `GEMINI_API_KEY` lue sur le serveur. `.env` ignoré. `.env.example` vide. Aucun `NEXT_PUBLIC_GEMINI_API_KEY`. | Une clé collée dans un chat ou un journal d'hébergeur resterait exposée. |
| Capture contenant un secret | Avertissement avant l'envoi. Pas de stockage volontaire. Le bouton Effacer retire l'aperçu. | Google reçoit l'image le temps de l'analyse. On n'affirme pas l'absence de journaux chez le fournisseur. |
| Faux fichier ou image coûteuse | Signature PNG/JPEG, taille max 2 Mio, dimensions max 4096 et 8 millions de pixels, sans décoder l'image. SVG, HTML et PDF refusés. | Le contrôle lit l'en-tête. Il ne remplace pas un décodeur complet. |
| Abus de quota | 12 requêtes par heure et 2 requêtes simultanées dans la mémoire du processus. Jeton optionnel `DEMO_ACCESS_TOKEN`. | Ce n'est pas une limite globale entre plusieurs instances. L'adresse IP transmise n'est pas une identité fiable. |
| Prompt hostile dans l'image ou le code | Les données sont délimitées. Le prompt dit de les traiter comme des données. La sortie est validée par Zod. | Un prompt ne supprime pas le risque. Le modèle n'a aucun outil, fichier ou shell. |
| HTML dans la réponse | Les champs sont affichés comme texte React. Pas de `dangerouslySetInnerHTML`. La copie Markdown ne transforme pas les liens. | Un outil externe qui rendrait le Markdown pourrait interpréter des liens. |
| Origine | Une en-tête `Origin` d'un autre hôte est refusée. | L'absence d'Origin est acceptée. Ce n'est pas une authentification. |

## Portée de la limite

`acquireAnalysisSlot` vit dans le processus Node. En local, cela couvre le serveur de développement. Sur plusieurs fonctions serverless, chaque instance a son propre compteur. Ne pas décrire ce mécanisme comme une protection globale.

Avant une URL anonyme, définir `DEMO_ACCESS_TOKEN` dans l'hébergeur et le donner aux juges hors du dépôt.

## Dépendances

`npm audit` signale des avis hauts dans la chaîne ESLint (`braces`, `micromatch`, `fast-glob`), pas dans le traitement des images ni dans l'appel Gemma. Ils n'ont pas été corrigés par une mise à jour forcée pendant le hackathon. Un audit n'est pas une certification.

## Journalisation

Le serveur écrit l'identifiant d'événement, le statut, la durée et le modèle. Il n'écrit pas l'image, le code, le contexte ni la clé.
