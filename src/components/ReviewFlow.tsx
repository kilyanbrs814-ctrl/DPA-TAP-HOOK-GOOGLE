/**
 * ReviewFlow — « les avis Google construisent la réputation ».
 *
 * Séquence muette posée entre la mise en vert de « Réputation » (frame 348) et
 * le swipe horizontal vers la plaque NFC. Aucune phrase explicative n'est
 * ajoutée à la scène : trois vrais avis Google (720 × 176) partent l'un après
 * l'autre du bloc « 5,0 ★★★★★ (1 k) » de la fiche et remontent jusqu'à la
 * branche verte, qui se renforce à chaque arrivée.
 *
 * Répartition des rôles :
 *   - BusinessCard      renforce le bloc note · étoiles · avis (il grossit,
 *                       fond vert pâle, bordure épaisse, halo) ;
 *   - CriteriaDiagram   efface les critères barrés, illumine la branche verte
 *                       et fait réagir la pastille « Réputation » ;
 *   - ReviewFlow (ici)  fait voyager les avis entre les deux.
 *
 * Les trois partagent le même barème de frames : `REVIEW_FLOW`.
 * Tout est piloté par useCurrentFrame() : aucune animation CSS temporelle.
 */

import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { G, LAYOUT } from "../config/google-ui";
import {
  REVIEW_FLOW,
  reviewDeparture,
  reviewFocus,
} from "./CriteriaDiagram";
import {
  RATING_BLOCK_WIDTH,
  RATING_ROW_HEIGHT,
  RATING_ROW_TOP,
  RATING_STARS_CENTER_X,
} from "./BusinessCard";
import {
  FLOW_REVIEWS,
  GoogleReviewCard,
  REVIEW_CARD_HEIGHT,
  REVIEW_CARD_WIDTH,
} from "./GoogleReviewCard";

const FRAME_W = 1080;
const FRAME_H = 1920;

/* -------------------------------------------------------------------------- */
/*  Trajectoire                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Abscisse de départ. Un avis mesure 720 px de large : son centre ne peut
 * jamais descendre sous 360 px ni dépasser 720 px sans sortir du cadre. 400 px
 * laisse 90 px de marge à gauche à l'échelle de départ.
 */
const START_X = 400;

/**
 * Ordonnée de départ, relative au bord haut de la fiche : l'avis apparaît dans
 * l'espace blanc juste au-dessus, sans jamais recouvrir le bloc mis en avant.
 */
const START_Y_ABOVE_CARD = REVIEW_CARD_HEIGHT / 2 + 50;

/**
 * Point d'arrivée : contre la pastille « Réputation », côté bas-gauche. On ne
 * vise pas son centre (870) — un avis de 720 px centré là déborderait du cadre.
 */
const END = { x: 720, y: 720 } as const;

/**
 * Points de contrôle des trois trajectoires : chaque avis monte d'abord, puis
 * s'incurve vers la droite. Trois courbes voisines, jamais confondues.
 */
const CONTROLS = [
  [430, 880],
  [360, 900],
  [480, 850],
] as const;

/**
 * Échelle le long du trajet. Le minimum, 0,86, correspond à 619 px de large :
 * bien au-dessus du plancher de 580 px, l'avis reste lisible de bout en bout.
 */
const SCALE_KEYS = [0, 0.2, 0.8, 1] as const;
const SCALE_VALUES = [0.86, 1, 1, 0.88] as const;

const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
const EASE_TRAVEL = Easing.bezier(0.5, 0, 0.28, 1);

/** Bézier quadratique : position d'un avis à l'avancement `t`. */
const quad = (a: number, c: number, b: number, t: number): number =>
  (1 - t) * (1 - t) * a + 2 * (1 - t) * t * c + t * t * b;

/** Vert de « Réputation », identique à celui du diagramme. */
const GREEN = G.openGreen;

/* -------------------------------------------------------------------------- */
/*  Un avis en vol                                                            */
/* -------------------------------------------------------------------------- */

const FlyingReview: React.FC<{
  readonly index: number;
  readonly originY: number;
}> = ({ index, originY }) => {
  const frame = useCurrentFrame();

  const start = REVIEW_FLOW.cardStarts[index];
  const end = start + REVIEW_FLOW.cardTravel;

  // Hors de sa fenêtre, l'avis n'est pas monté du tout : les trois ne se
  // superposent donc jamais.
  if (frame < start || frame > end) {
    return null;
  }

  const t = interpolate(frame, [start, end], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE_TRAVEL,
  });

  const [controlX, controlY] = CONTROLS[index];
  const startY = originY - START_Y_ABOVE_CARD;

  /** Légère montée d'apparition : l'avis semble sortir de la fiche. */
  const rise = interpolate(t, [0, 0.16], [54, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE_OUT,
  });

  const x = quad(START_X, controlX, END.x, t);
  const y = quad(startY, controlY, END.y, t) + rise;

  const scale = interpolate(t, SCALE_KEYS, SCALE_VALUES, {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE_OUT,
  });

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: REVIEW_CARD_WIDTH,
        height: REVIEW_CARD_HEIGHT,
        translate: `${x - REVIEW_CARD_WIDTH / 2}px ${
          y - REVIEW_CARD_HEIGHT / 2
        }px`,
        scale: scale.toString(),
        // Fondu piloté en frames, pas en avancement : l'avis reste pleinement
        // opaque et à pleine taille pendant 21 frames, puis s'efface net en 5
        // frames au contact de la branche verte.
        opacity: interpolate(frame, [start, start + 4, end - 5, end], [0, 1, 1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
      }}
    >
      <GoogleReviewCard review={FLOW_REVIEWS[index]} />
    </div>
  );
};

/* -------------------------------------------------------------------------- */

export const ReviewFlow: React.FC<{
  /** Ordonnée du bord haut de la fiche première, comme pour CriteriaDiagram. */
  readonly originY: number;
}> = ({ originY }) => {
  const frame = useCurrentFrame();

  /** Sursaut de la ligne notée au moment où un avis s'en détache. */
  const departure = reviewDeparture(frame);

  /**
   * Le bloc noté grossit vers la droite : le centre de la rangée d'étoiles se
   * décale d'autant. L'anneau d'émission le suit exactement.
   */
  const focusScale = 1 + reviewFocus(frame) * 0.14;
  const emitterX =
    LAYOUT.pagePaddingX +
    (RATING_STARS_CENTER_X - LAYOUT.pagePaddingX) * focusScale;
  const emitterY = originY + RATING_ROW_TOP + RATING_ROW_HEIGHT / 2;

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: FRAME_W,
        height: FRAME_H,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      {/*
        Anneau d'émission : un contour vert bref, centré sur les étoiles, quand
        un avis s'en détache. Un simple contour — la note, les étoiles et le
        nombre d'avis restent entièrement lisibles pendant l'éclat.
      */}
      {departure > 0 ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: RATING_BLOCK_WIDTH * focusScale,
            height: RATING_ROW_HEIGHT * focusScale + 22,
            borderRadius: 20,
            border: `3px solid ${GREEN}`,
            opacity: departure * 0.45,
            translate: `${emitterX - (RATING_BLOCK_WIDTH * focusScale) / 2}px ${
              emitterY - (RATING_ROW_HEIGHT * focusScale + 22) / 2
            }px`,
            scale: (1 + departure * 0.22).toString(),
          }}
        />
      ) : null}

      {FLOW_REVIEWS.map((review, index) => (
        <FlyingReview key={review.id} index={index} originY={originY} />
      ))}
    </div>
  );
};
