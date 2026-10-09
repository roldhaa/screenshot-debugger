# Captures de démonstration

Dix captures PNG synthétiques d'erreurs JavaScript, TypeScript et React. Elles sont courtes et lisibles pour rester sous le délai de la passerelle (~20 s).

| Fichier | Erreur visible |
| --- | --- |
| `01-react-map.png` | `undefined` + `.map()` |
| `02-null-length.png` | `null` + `.length` |
| `03-not-a-function.png` | `.filter is not a function` |
| `04-json-parse.png` | JSON.parse reçoit du HTML |
| `05-not-defined.png` | `count is not defined` |
| `06-set-undefined.png` | écriture sur `undefined` |
| `07-module-not-found.png` | module introuvable |
| `08-promise-rejection.png` | promesse rejetée sans catch |
| `09-assignment-const.png` | assignation à une `const` |
| `10-react-key.png` | clé React manquante |

Régénération :

```bash
python3 scripts/generate-demo-captures.py
```

Les trois premiers fichiers sont aussi copiés dans `public/fixtures/` pour les boutons **Exemple 1**, **Exemple 2** et **Exemple 3**.
