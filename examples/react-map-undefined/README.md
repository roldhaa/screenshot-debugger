# Exemple React : map sur undefined

Mini-projet public, séparé de l'application. Il reproduit une erreur de liste React sans ouvrir de dépôt externe.

- `buggy.mjs` appelle `.map()` sur `undefined` et doit échouer.
- `fixed.mjs` utilise un tableau vide tant que les données ne sont pas là, et doit afficher `[]`.
- `error.png` est une capture synthétique de l'erreur, aussi servie par l'application dans `public/fixtures/react-map-error.png`.
- `verify.mjs` exécute les deux scripts.

```bash
node examples/react-map-undefined/verify.mjs
```

La correction proposée par Screenshot Debugger reste une proposition tant qu'elle n'a pas été appliquée ici à la main.
