export const publicErrorMessage = {
  missing_key: "La clé API n'est pas configurée sur le serveur.",
  auth: "Google a refusé l'accès au modèle.",
  quota: "La limite d'analyses est atteinte pour cette instance. Réessaie plus tard.",
  in_flight: "Une analyse est déjà en cours. Attends qu'elle se termine.",
  timeout: "L'analyse a dépassé le délai. Tu peux réessayer.",
  unavailable: "Le service d'analyse est indisponible. Tu peux réessayer.",
  invalid_output: "La réponse du modèle n'a pas pu être lue. Tu peux réessayer.",
  cancelled: "L'analyse a été annulée.",
  invalid_body: "La requête est incomplète ou mal formée.",
  text_too_long: "Le contexte et le code dépassent 15 000 caractères.",
  unsupported_origin: "Cette requête ne vient pas de l'application.",
  demo_forbidden: "L'accès à la démonstration est refusé.",
  payload_too_large: "La requête dépasse la taille autorisée.",
  empty: "Le fichier est vide.",
  too_large: "L'image dépasse 2 Mio.",
  unsupported_type: "Seuls les fichiers PNG et JPEG sont acceptés.",
  dimensions: "Les dimensions de l'image dépassent la limite autorisée.",
  invalid_image: "Le fichier ne correspond pas à une image PNG ou JPEG lisible.",
} as const;

export type PublicErrorCode = keyof typeof publicErrorMessage;
