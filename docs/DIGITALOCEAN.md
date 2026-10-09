# DigitalOcean App Platform

Cette application n'est pas déployée. Le fichier [.do/app.yaml](../.do/app.yaml) prépare un Web Service. Une site statique ne peut pas exécuter `POST /api/analyze`.

## Coût avant création

La taille écrite dans la spec est `apps-s-1vcpu-0.5gb` : 1 vCPU partagé, 512 Mio de mémoire, 50 Gio de transfert, environ 5 $ US par mois. Source : [tarifs App Platform](https://docs.digitalocean.com/products/app-platform/details/pricing/).

Aucun conteneur n'a été créé depuis ce dépôt. Lancer l'application dans le tableau de bord démarre la facturation. Le palier gratuit indiqué par DigitalOcean ne remplace pas ce service web. Si 512 Mio ne suffisent pas au processus Next.js, le palier suivant est `apps-s-1vcpu-1gb-fixed`, environ 10 $ US par mois. Ne passe pas à ce palier sans le constater.

## Build et démarrage

- Build : `npm run build`
- Démarrage : `npm start`, qui lance `next start`
- Next.js 16.4 lit `PORT` et écoute `0.0.0.0` par défaut
- Port HTTP de la spec : 8080. App Platform injecte `PORT=8080` s'il n'est pas déjà défini
- Région proposée : `tor`

## Variables

À saisir dans le tableau de bord, pas dans Git :

| Clé | Type | Valeur |
| --- | --- | --- |
| `GEMINI_API_KEY` | Secret, exécution seulement | La clé créée dans [Google AI Studio](https://aistudio.google.com/apikey) |
| `GEMMA_MODEL` | Texte | `gemma-4-26b-a4b-it` |

`DEMO_ACCESS_TOKEN` reste optionnel. S'il est défini, chaque analyse doit envoyer l'en-tête `x-demo-access`. Ne le mets pas dans le dépôt.

## Étapes dans le tableau de bord

1. Ouvre [Apps](https://cloud.digitalocean.com/apps) avec ton compte.
2. Create App, source GitHub, dépôt `roldhaa/screenshot-debugger`, branche `main`.
3. Choisis un Web Service, pas un site statique.
4. Build command : `npm run build`. Run command : `npm start`. HTTP port : `8080`.
5. Taille : shared 1 vCPU / 512 MiB. Le résumé doit afficher le prix avant Create.
6. Ajoute `GEMINI_API_KEY` comme secret d'exécution et `GEMMA_MODEL=gemma-4-26b-a4b-it`.
7. Crée l'application seulement si le prix affiché est accepté.
8. Après le déploiement, ouvre l'URL `ondigitalocean.app`, charge l'exemple React et lance une analyse. Un build vert ne suffit pas.

La limite de 12 analyses par heure est celle du processus de ce conteneur. Elle ne suit pas l'utilisateur d'une instance à l'autre si le nombre de conteneurs augmente.
