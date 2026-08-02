/**
 * Rôle → chemin réel dans public/.
 * Toujours consommé via staticFile() côté composant, jamais en chemin absolu.
 */

export const ASSETS = {
  /** Image de la fiche "Votre établissement" (logo Google Business Profile). */
  businessProfileLogo: "assets/hook-google/google-business-profile-logo.png",

  /** Devantures des trois concurrents fictifs. */
  maisonBarberPhoto: "assets/hook-google/maison-barber-devanture.png",
  atelierBarbierPhoto: "assets/hook-google/atelier-barbier-devanture.png",
  barberDistrictPhoto: "assets/hook-google/barber-district-devanture.png",

  /**
   * 🚫 NE PAS AFFICHER — capture réelle contenant de vrais noms d'établissements.
   * Sert uniquement de référence visuelle pendant le développement.
   */
  _resultsReferenceOnly: "assets/hook-google/google-results-reference.png",
} as const;
