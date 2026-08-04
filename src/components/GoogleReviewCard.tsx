/**
 * GoogleReviewCard — un avis Google, recréé en React/CSS.
 *
 * Calqué sur une capture réelle d'avis Google (≈ 520 × 126 px), reproduite ici
 * à l'échelle du cadre 1080 × 1920 : 720 × 176 px, soit exactement le même
 * rapport (4,13:1) et les mêmes proportions internes. Rien n'est bitmap, tout
 * est vectoriel : le rendu reste parfaitement net à n'importe quelle échelle.
 *
 *   ┌────────────────────────────────────────────────────────────┐
 *   │  (A)  Nom en gras                                       ⋮  │
 *   │  ★★★★★  il y a 2 jours  [ NOUVEAU ]                        │
 *   │  Commentaire court, en gris                                │
 *   └────────────────────────────────────────────────────────────┘
 *
 * Le composant est purement présentationnel : il ne lit jamais la frame
 * courante. Tout ce qui bouge est piloté par ReviewFlow.
 */

import React from "react";
import { G } from "../config/google-ui";
import { FONT_FAMILY } from "../config/fonts";
import { StarsRating } from "./StarsRating";

/**
 * Gabarit imposé : la référence mesure 520 × 126, on conserve son rapport.
 * 720 / 520 = 1,3846 — toutes les valeurs internes sont issues de ce facteur.
 */
export const REVIEW_CARD_WIDTH = 720;
export const REVIEW_CARD_HEIGHT = 176;

/** Gris du menu à trois points, comme sur Google. */
const KEBAB_GREY = "#5F6368";

export type GoogleReview = {
  readonly id: string;
  /** Nom affiché de l'auteur. */
  readonly author: string;
  /** Couleur de la pastille d'avatar. */
  readonly avatarColor: string;
  /** Date relative, telle que Google l'écrit. */
  readonly date: string;
  /** Commentaire, une seule ligne. */
  readonly comment: string;
  /** Badge « NOUVEAU », réservé à l'avis le plus récent. */
  readonly isNew: boolean;
};

/** Menu vertical à trois points, en haut à droite de l'avis. */
const KebabMenu: React.FC = () => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 7,
      flexShrink: 0,
    }}
  >
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        style={{
          width: 6,
          height: 6,
          borderRadius: 3,
          backgroundColor: KEBAB_GREY,
        }}
      />
    ))}
  </div>
);

export const GoogleReviewCard: React.FC<{
  readonly review: GoogleReview;
}> = ({ review }) => {
  return (
    <div
      style={{
        width: REVIEW_CARD_WIDTH,
        height: REVIEW_CARD_HEIGHT,
        boxSizing: "border-box",
        paddingTop: 20,
        paddingBottom: 20,
        paddingLeft: 22,
        paddingRight: 22,
        borderRadius: 18,
        backgroundColor: G.white,
        border: `1px solid ${G.border}`,
        boxShadow: "0 10px 30px rgba(32,33,36,0.12)",
        fontFamily: FONT_FAMILY,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Ligne 1 — avatar · nom en gras · menu à trois points */}
      <div
        style={{
          height: 48,
          display: "flex",
          alignItems: "center",
          gap: 22,
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            flexShrink: 0,
            backgroundColor: review.avatarColor,
            color: G.white,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 23,
            fontWeight: 500,
            lineHeight: 1,
          }}
        >
          {review.author.charAt(0)}
        </div>

        <div
          style={{
            flex: 1,
            minWidth: 0,
            fontSize: 21,
            fontWeight: 700,
            color: G.textPrimary,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {review.author}
        </div>

        <KebabMenu />
      </div>

      {/*
        Ligne 2 — étoiles · date · badge. Alignée sur le bord gauche de la
        carte, exactement comme sur la référence : elle n'est pas indentée
        sous le nom.
      */}
      <div
        style={{
          marginTop: 18,
          height: 30,
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}
      >
        <StarsRating
          progress={5}
          size={20}
          gap={1}
          idPrefix={`google-review-${review.id}`}
        />
        <div style={{ fontSize: 18, color: G.textSecondary }}>
          {review.date}
        </div>
        {review.isNew ? (
          <div
            style={{
              height: 30,
              paddingLeft: 12,
              paddingRight: 12,
              borderRadius: 5,
              border: `1.5px solid ${G.border}`,
              display: "flex",
              alignItems: "center",
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: 0.4,
              color: G.textPrimary,
            }}
          >
            NOUVEAU
          </div>
        ) : null}
      </div>

      {/* Ligne 3 — commentaire, en gris */}
      <div
        style={{
          marginTop: 16,
          height: 24,
          display: "flex",
          alignItems: "center",
          fontSize: 18,
          color: G.textSecondary,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {review.comment}
      </div>
    </div>
  );
};

/**
 * Trois avis fictifs, cinq étoiles, du plus récent au plus ancien.
 * Aucun nom ni contenu repris de la capture de référence.
 */
export const FLOW_REVIEWS: readonly GoogleReview[] = [
  {
    id: "camille",
    author: "Camille Berthier",
    avatarColor: "#B23A1E",
    date: "il y a 2 jours",
    comment: "Accueil chaleureux et équipe vraiment professionnelle.",
    isNew: true,
  },
  {
    id: "yanis",
    author: "Yanis Moreau",
    avatarColor: "#1967D2",
    date: "il y a 1 semaine",
    comment: "Travail soigné, vrai sens du détail. Je reviendrai.",
    isNew: false,
  },
  {
    id: "lea",
    author: "Léa Fontaine",
    avatarColor: "#137333",
    date: "il y a 3 semaines",
    comment: "Service impeccable du début à la fin, je recommande.",
    isNew: false,
  },
] as const;
