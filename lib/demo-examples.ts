export type DemoExample = {
  id: "1" | "2" | "3";
  label: string;
  fixturePath: string;
  framework: "react" | "typescript" | "javascript";
  context: string;
  code: string;
};

/** Three public fixtures wired to the demo buttons. Exemple 2 first: fastest observed live path. */
export const DEMO_EXAMPLES: DemoExample[] = [
  {
    id: "2",
    label: "Exemple 2 · null length",
    fixturePath: "/fixtures/demo-2-null-length.png",
    framework: "typescript",
    context: "Je valide le formulaire. Le champ email peut encore être null.",
    code: "function validateForm(email: string | null) {\n  if (email.length === 0) {\n    return false;\n  }\n  return true;\n}",
  },
  {
    id: "1",
    label: "Exemple 1 · React map",
    fixturePath: "/fixtures/demo-1-react-map.png",
    framework: "react",
    context: "J'affiche les noms au premier rendu, avant que la liste soit chargée.",
    code: "function renderNames(users) {\n  return users.map((user) => user.name);\n}",
  },
  {
    id: "3",
    label: "Exemple 3 · filter",
    fixturePath: "/fixtures/demo-3-not-a-function.png",
    framework: "react",
    context: "Je filtre les produits en stock. L'API m'a renvoyé un objet au lieu d'un tableau.",
    code: "function ProductList({ items }) {\n  return items.filter((item) => item.inStock).map((item) => item.name);\n}",
  },
];
