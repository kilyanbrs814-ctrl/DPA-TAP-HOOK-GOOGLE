import { ASSETS } from "../config/assets";

/**
 * Données structurées des 4 fiches du bloc "Entreprises".
 *
 * Les 3 concurrents sont FICTIFS : aucun nom de la capture de référence
 * n'est réutilisé. Les informations secondaires restent volontairement
 * génériques (catégorie, statut, zone) — pas d'adresse complète inventée.
 */

export type Business = {
  /** Identifiant stable, sert de clé React et d'ancre d'animation. */
  id: string;
  name: string;
  /** Note affichée (format français appliqué à l'affichage). Null = aucun avis. */
  rating: number | null;
  /** Nombre d'avis brut. Null = aucun avis. */
  reviews: number | null;
  category: string;
  /** Ancienneté, comme sur les résultats locaux Google. */
  seniority: string;
  zone: string;
  isOpen: boolean;
  /** Information secondaire de la ligne de statut ("Ferme à 19:00"). */
  hours: string;
  /** Position de départ dans le classement (0 = première place). */
  initialRank: number;
  /**
   * Miniature de la fiche, dans public/ : devanture pour les concurrents,
   * logo Google Business Profile pour "Votre établissement".
   */
  photo: string;
  /** Vrai uniquement pour la fiche animée. */
  isOwner: boolean;
};

export const BUSINESSES: Business[] = [
  {
    id: "maison-barber",
    name: "Maison Barber",
    rating: 4.8,
    reviews: 436,
    category: "Barbier",
    seniority: "Plus de 8 ans en activité",
    zone: "Centre-ville",
    isOpen: true,
    hours: "Ferme à 19:00",
    initialRank: 0,
    photo: ASSETS.maisonBarberPhoto,
    isOwner: false,
  },
  {
    id: "atelier-du-barbier",
    name: "L'Atelier du Barbier",
    rating: 4.7,
    reviews: 312,
    category: "Barbier",
    seniority: "Plus de 6 ans en activité",
    zone: "Quartier des Halles",
    isOpen: true,
    hours: "Ferme à 19:30",
    initialRank: 1,
    photo: ASSETS.atelierBarbierPhoto,
    isOwner: false,
  },
  {
    id: "barber-district",
    name: "Barber District",
    rating: 4.6,
    reviews: 189,
    category: "Barbier",
    seniority: "Plus de 4 ans en activité",
    zone: "Rive gauche",
    isOpen: true,
    hours: "Ferme à 18:30",
    initialRank: 2,
    photo: ASSETS.barberDistrictPhoto,
    isOwner: false,
  },
  {
    id: "votre-etablissement",
    name: "Votre établissement",
    rating: null,
    reviews: null,
    category: "Barbier",
    seniority: "Plus de 3 ans en activité",
    zone: "Centre-ville",
    isOpen: true,
    hours: "Ferme à 20:00",
    initialRank: 3,
    photo: ASSETS.businessProfileLogo,
    isOwner: true,
  },
];

/** Format français : 4.8 → "4,8". */
export const formatRating = (value: number): string =>
  value.toFixed(1).replace(".", ",");

/**
 * Format Google du nombre d'avis.
 * En dessous de 1000 : le nombre exact. À partir de 1000 : "1 k", "2,2 k"…
 */
export const formatReviewCount = (count: number): string => {
  if (count < 1000) {
    return String(count);
  }

  const thousands = count / 1000;
  const rounded = Math.round(thousands * 10) / 10;

  return Number.isInteger(rounded)
    ? `${rounded} k`
    : `${rounded.toFixed(1).replace(".", ",")} k`;
};
