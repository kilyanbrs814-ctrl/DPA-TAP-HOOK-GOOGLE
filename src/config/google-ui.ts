/**
 * Direction artistique de l'interface Google recréée.
 * Palette Google Search / Material en MODE CLAIR — la capture de référence
 * (public/assets/hook-google/google-results-reference.png) est en mode sombre,
 * on n'en reprend que la STRUCTURE, jamais les couleurs.
 */

export const G = {
  /** Fond de page Google. */
  white: "#FFFFFF",

  /** Titres de résultats et texte principal. */
  textPrimary: "#202124",
  /** Texte secondaire (catégorie, ancienneté, zone, nombre d'avis). */
  textSecondary: "#70757A",
  /** Texte tertiaire très discret (crédits carte). */
  textTertiary: "#9AA0A6",

  /** Bleu des actions et des liens Google. */
  actionBlue: "#1A73E8",
  /** Fond très pâle des boutons d'action. */
  actionBlueSoft: "#F8FAFE",

  /** Vert "Ouvert". */
  openGreen: "#188038",

  /** Jaune des étoiles Google (imposé par le brief). */
  starYellow: "#FABB05",
  /** Étoile vide. */
  starEmpty: "#DADCE0",

  /** Bordures et séparateurs fins. */
  border: "#DADCE0",
  separator: "#DADCE0",
  /** Fond neutre d'une miniature en cours de chargement. */
  thumbBase: "#F1F3F4",

  /** Logo Google, dans l'ordre G-o-o-g-l-e. */
  logo: ["#4285F4", "#EA4335", "#FBBC05", "#4285F4", "#34A853", "#EA4335"],

  /** Palette carte Google Maps (plan clair standard). */
  map: {
    land: "#F8F7F3",
    landAlt: "#EDEBE5",
    water: "#A9D2F0",
    park: "#C9E5C2",
    road: "#FFFFFF",
    roadCasing: "#D9D7D1",
    highway: "#F8D08A",
    highwayCasing: "#EABC6A",
    label: "#8A8F95",
    pin: "#EA4335",
    shield: "#D8B25A",
  },
} as const;

/** Échelle typographique pensée pour un cadre 1080 × 1920. */
export const TYPE = {
  searchQuery: 36,
  sectionTitle: 48,
  cardTitle: 42,
  cardRating: 32,
  cardMeta: 29,
  buttonLabel: 28,
  mapCredit: 15,
} as const;

/** Graisses Roboto chargées. */
export const WEIGHT = {
  regular: 400,
  medium: 500,
} as const;

/**
 * Géométrie de la page (1080 × 1920).
 *
 * Budget vertical, additionné exactement :
 *   46 (haut) + 64 (logo) + 30 + 96 (recherche)
 * + 40 + 56 + 20 (titre "Entreprises")
 * + 360 (carte) + 26 + 4 × 292 (fiches) = 1906 px sur 1920.
 */
export const LAYOUT = {
  pagePaddingX: 48,
  pagePaddingTop: 46,

  logoHeight: 64,
  /** Espace logo → barre de recherche. */
  headerGap: 30,
  searchBarHeight: 96,

  /** Bloc titre "Entreprises". */
  sectionTitleMarginTop: 40,
  sectionTitleHeight: 56,
  sectionTitleMarginBottom: 20,

  mapHeight: 360,
  mapRadius: 24,

  /** Espace carte → première fiche. */
  listMarginTop: 26,

  /** Hauteur d'une fiche, séparateur compris. Pas vertical du classement. */
  cardHeight: 292,
  cardPaddingTop: 16,
  cardPaddingBottom: 14,

  /**
   * Miniature photo, à droite de chaque fiche.
   * Strictement identique pour les quatre établissements : mêmes dimensions,
   * même rayon, même emplacement — seule la source de l'image change.
   */
  photoWidth: 200,
  photoHeight: 176,
  photoRadius: 14,

  /** Boutons d'action Google (pilules) sous chaque fiche. */
  actionButtonHeight: 72,
  actionButtonGap: 16,
  actionButtonPaddingX: 28,
} as const;

/** Largeur utile du contenu. */
export const CONTENT_WIDTH = 1080 - LAYOUT.pagePaddingX * 2;
