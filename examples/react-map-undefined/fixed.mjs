function renderNames(users) {
  return (users ?? []).map((user) => user.name);
}

const names = renderNames(undefined);
if (!Array.isArray(names) || names.length !== 0) {
  throw new Error("La liste vide attendue n'a pas été obtenue.");
}

console.log(JSON.stringify(names));
