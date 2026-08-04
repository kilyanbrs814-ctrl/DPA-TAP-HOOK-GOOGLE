/**
 * Schéma des trois critères de classement Google.
 *
 * Un trait part du bord haut de la fiche classée première, monte dans l'espace
 * libéré, puis se divise en trois branches qui portent chacune un critère.
 * Ensuite : "Pertinence de la recherche" barrée en rouge, "Proximité" barrée
 * en rouge, puis "Réputation" mise en valeur en vert.
 *
 * Tout est piloté par useCurrentFrame() en frames absolues de la composition :
 * aucune animation CSS temporelle, donc un rendu strictement déterministe.
 * Le composant se contente de dessiner ; il ne touche à rien du hook.
 */

import React from "react";
import {
  Easing,
  interpolate,
  interpolateColors,
  useCurrentFrame,
} from "remotion";
import { G } from "../config/google-ui";
import { FONT_FAMILY } from "../config/fonts";

/* -------------------------------------------------------------------------- */
/*  Géométrie (repère 1080 × 1920)                                            */
/* -------------------------------------------------------------------------- */

const FRAME_W = 1080;
const FRAME_H = 1920;

/** Axe vertical du schéma. */
const AXIS_X = FRAME_W / 2;

/** Hauteur du nœud où le tronc se divise en trois. */
const SPLIT_Y = 830;

/** Bas des pastilles = arrivée des branches. */
const CHIP_BOTTOM = 670;
const CHIP_HEIGHT = 200;
const CHIP_TOP = CHIP_BOTTOM - CHIP_HEIGHT;
const CHIP_WIDTH = 300;

/** Centres des trois colonnes. */
const COLUMNS = [210, 540, 870] as const;

/**
 * Géométrie exportée : la séquence « avis → réputation » (ReviewFlow) vise la
 * branche verte, elle doit connaître exactement où elle arrive. Une seule
 * source de vérité, aucune coordonnée recopiée à la main.
 */
export const DIAGRAM_GEOMETRY = {
  axisX: AXIS_X,
  splitY: SPLIT_Y,
  chipTop: CHIP_TOP,
  chipBottom: CHIP_BOTTOM,
  chipWidth: CHIP_WIDTH,
  chipHeight: CHIP_HEIGHT,
  /** Colonne de « Réputation » : cible du flux d'avis. */
  reputationX: COLUMNS[2],
} as const;

/* -------------------------------------------------------------------------- */
/*  Rythme (frames absolues de la composition)                                */
/* -------------------------------------------------------------------------- */

export const CRITERIA_TIMING = {
  trunk: [158, 188] as const,
  /** Départ décalé de chaque branche ; chacune se trace en 26 frames. */
  branchStarts: [184, 190, 196] as const,
  branchDuration: 26,
  /** Départ décalé de l'apparition des trois pastilles. */
  chipStarts: [202, 210, 218] as const,
  chipDuration: 22,
  strikeRelevance: [250, 274] as const,
  dimRelevance: [262, 282] as const,
  strikeProximity: [286, 310] as const,
  dimProximity: [298, 318] as const,
  reputation: [322, 348] as const,
} as const;

/* -------------------------------------------------------------------------- */
/*  Séquence « avis Google → réputation » (après la mise en vert, frame 348)   */
/* -------------------------------------------------------------------------- */

/**
 * Rythme du flux d'avis, en frames absolues de la composition.
 * Tout commence après la mise en vert complète de « Réputation » (348) et se
 * termine à 470, suivi d'un temps de pose avant le swipe vers la plaque NFC.
 */
export const REVIEW_FLOW = {
  /** Effacement des deux branches barrées : il ne reste que « Réputation ». */
  fadeOthers: [350, 376] as const,
  /** Mise en avant du bloc note · étoiles · avis de la fiche Google. */
  highlight: [352, 382] as const,
  /** Départ de chacun des trois avis Google depuis la fiche. */
  cardStarts: [364, 396, 428] as const,
  /** Trajet d'un avis, de la fiche jusqu'à la branche verte. */
  cardTravel: 30,
  /** Durée du renforcement déclenché par un avis qui arrive. */
  impact: 12,
} as const;

/** Frames d'arrivée des avis sur la branche verte : 394, 426, 458. */
export const REVIEW_ARRIVALS = REVIEW_FLOW.cardStarts.map(
  (start) => start + REVIEW_FLOW.cardTravel,
);

/** Dernière frame animée de la séquence : 422 + 12 = 434. */
export const REVIEW_FLOW_END =
  REVIEW_ARRIVALS[REVIEW_ARRIVALS.length - 1] + REVIEW_FLOW.impact;

/** Courbe 0 → 1 → 0 d'un sursaut, centrée sur une frame d'arrivée. */
const impulse = (frame: number, at: number, duration: number): number =>
  interpolate(
    frame,
    [at, at + duration * 0.3, at + duration],
    [0, 1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.quad),
    },
  );

/** Sursaut le plus fort à cette frame, toutes cartes confondues (0 → 1). */
export const reviewImpact = (frame: number): number =>
  REVIEW_ARRIVALS.reduce(
    (peak, at) => Math.max(peak, impulse(frame, at, REVIEW_FLOW.impact)),
    0,
  );

/**
 * 0 → 1 : mise en avant du bloc « note · étoiles · avis » de la fiche Google.
 * Source unique, partagée par la fiche (qui grossit) et par ReviewFlow (qui en
 * fait partir les avis).
 */
export const reviewFocus = (frame: number): number =>
  interpolate(
    frame,
    [REVIEW_FLOW.highlight[0], REVIEW_FLOW.highlight[1]],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    },
  );

/** Sursaut au moment où un avis QUITTE la fiche Google (0 → 1). */
export const reviewDeparture = (frame: number): number =>
  REVIEW_FLOW.cardStarts.reduce(
    (peak, at) => Math.max(peak, impulse(frame, at, 10)),
    0,
  );

/** Renforcement cumulé de « Réputation » : une marche par carte reçue. */
export const reviewStrength = (frame: number): number =>
  REVIEW_ARRIVALS.reduce(
    (total, at) =>
      total +
      interpolate(frame, [at, at + 10], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.out(Easing.cubic),
      }),
    0,
  ) / REVIEW_ARRIVALS.length;

const CRITERIA = [
  "Pertinence de la recherche",
  "Proximité",
  "Réputation",
] as const;

/** Rouge et vert Google, alignés sur la palette déjà utilisée par le hook. */
const RED = "#D93025";
const GREEN = G.openGreen;
const GREEN_SOFT = "#E6F4EA";
const GREEN_BORDER = "#A8DAB5";
const LINE = "#C4C7CA";

/** Branches : le tronc s'ouvre en trois courbes douces, sans angle dur. */
const BRANCH_PATHS = [
  `M${AXIS_X} ${SPLIT_Y} C ${AXIS_X} ${SPLIT_Y - 70}, ${COLUMNS[0]} ${
    CHIP_BOTTOM + 110
  }, ${COLUMNS[0]} ${CHIP_BOTTOM}`,
  `M${AXIS_X} ${SPLIT_Y} L ${COLUMNS[1]} ${CHIP_BOTTOM}`,
  `M${AXIS_X} ${SPLIT_Y} C ${AXIS_X} ${SPLIT_Y - 70}, ${COLUMNS[2]} ${
    CHIP_BOTTOM + 110
  }, ${COLUMNS[2]} ${CHIP_BOTTOM}`,
] as const;

const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);

export const CriteriaDiagram: React.FC<{
  /** Ordonnée du bord haut de la fiche première : origine du trait. */
  originY: number;
}> = ({ originY }) => {
  const frame = useCurrentFrame();

  const T = CRITERIA_TIMING;

  // Tracé progressif du tronc, depuis la fiche vers le haut.
  const trunk = interpolate(frame, [T.trunk[0], T.trunk[1]], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE_OUT,
  });

  // Mise en valeur finale de "Réputation".
  const green = interpolate(
    frame,
    [T.reputation[0], T.reputation[1]],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.cubic),
    },
  );

  /** Respiration lente une fois le vert installé : 1,2 % d'amplitude. */
  const pulse =
    green * 0.012 * Math.sin((frame - T.reputation[1]) / 11) * (frame > T.reputation[1] ? 1 : 0);

  /**
   * Effacement des deux critères barrés : 1 tant que rien ne bouge, 0 une fois
   * « Pertinence de la recherche » et « Proximité » entièrement dissoutes.
   */
  const others = interpolate(
    frame,
    [REVIEW_FLOW.fadeOthers[0], REVIEW_FLOW.fadeOthers[1]],
    [1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.cubic),
    },
  );

  /** Renforcement cumulé et sursaut ponctuel apportés par les avis reçus. */
  const strength = reviewStrength(frame);
  const impact = reviewImpact(frame);

  return (
    <svg
      viewBox={`0 0 ${FRAME_W} ${FRAME_H}`}
      width={FRAME_W}
      height={FRAME_H}
      style={{ position: "absolute", left: 0, top: 0 }}
    >
      {/*
        Tronc : part du bord haut de la fiche. Il vire progressivement au vert
        au fil des avis reçus — c'est lui qui matérialise la connexion directe
        « avis de la fiche Google → Réputation ».
      */}
      <path
        d={`M${AXIS_X} ${originY} L ${AXIS_X} ${SPLIT_Y}`}
        fill="none"
        stroke={interpolateColors(strength, [0, 1], [LINE, GREEN])}
        strokeWidth={3 + strength * 1.4}
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray="1 1"
        strokeDashoffset={1 - trunk}
      />

      {/* Point d'attache, posé sur la fiche */}
      <circle
        cx={AXIS_X}
        cy={originY}
        r={interpolate(frame, [T.trunk[0], T.trunk[0] + 10], [0, 10], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: EASE_OUT,
        })}
        fill={interpolateColors(strength, [0, 1], [G.actionBlue, GREEN])}
      />

      {/* Nœud de division */}
      <circle
        cx={AXIS_X}
        cy={SPLIT_Y}
        r={interpolate(
          frame,
          [T.branchStarts[0], T.branchStarts[0] + 10],
          [0, 6],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: EASE_OUT,
          },
        )}
        fill={interpolateColors(strength, [0, 1], [LINE, GREEN])}
      />

      {/*
        Lueur de la branche verte : un doublon large et translucide posé SOUS
        la branche. Il gonfle à chaque carte d'avis reçue, puis retombe.
      */}
      <path
        d={BRANCH_PATHS[2]}
        fill="none"
        stroke={GREEN}
        strokeWidth={10 + impact * 12}
        strokeLinecap="round"
        opacity={strength * 0.1 + impact * 0.22}
        pathLength={1}
        strokeDasharray="1 1"
        strokeDashoffset={
          1 -
          interpolate(
            frame,
            [T.branchStarts[2], T.branchStarts[2] + T.branchDuration],
            [0, 1],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: EASE_OUT,
            },
          )
        }
      />

      {/* Trois branches */}
      {BRANCH_PATHS.map((d, i) => (
        <path
          key={i}
          d={d}
          fill="none"
          stroke={
            i === 2 ? interpolateColors(green, [0, 1], [LINE, GREEN]) : LINE
          }
          strokeWidth={
            i === 2 ? 3 + green * 1.4 + strength * 2 + impact * 1.4 : 3
          }
          strokeLinecap="round"
          // Les deux branches barrées s'effacent une fois « Réputation » verte.
          opacity={i === 2 ? 1 : others}
          pathLength={1}
          strokeDasharray="1 1"
          strokeDashoffset={
            1 -
            interpolate(
              frame,
              [T.branchStarts[i], T.branchStarts[i] + T.branchDuration],
              [0, 1],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: EASE_OUT,
              },
            )
          }
        />
      ))}

      {/*
        Halo vert discret autour de « Réputation » : il apparaît à chaque
        arrivée de carte et disparaît aussitôt. Posé avant les pastilles, il
        reste donc derrière elles.
      */}
      {impact > 0 ? (
        <rect
          x={COLUMNS[2] - CHIP_WIDTH / 2 - (8 + impact * 26)}
          y={CHIP_TOP - (8 + impact * 26)}
          width={CHIP_WIDTH + 2 * (8 + impact * 26)}
          height={CHIP_HEIGHT + 2 * (8 + impact * 26)}
          rx={22 + impact * 20}
          fill="none"
          stroke={GREEN}
          strokeWidth={2}
          opacity={impact * 0.32}
        />
      ) : null}

      {/* Trois pastilles de critères */}
      {CRITERIA.map((label, i) => {
        const appear = interpolate(
          frame,
          [T.chipStarts[i], T.chipStarts[i] + T.chipDuration],
          [0, 1],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: EASE_OUT,
          },
        );

        const isRelevance = i === 0;
        const isProximity = i === 1;
        const isReputation = i === 2;

        const strikeWindow = isRelevance
          ? T.strikeRelevance
          : isProximity
            ? T.strikeProximity
            : null;

        const strike = strikeWindow
          ? interpolate(frame, [strikeWindow[0], strikeWindow[1]], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.inOut(Easing.cubic),
            })
          : 0;

        const dimWindow = isRelevance
          ? T.dimRelevance
          : isProximity
            ? T.dimProximity
            : null;

        // Barré = moins présent, mais toujours parfaitement lisible.
        const dim = dimWindow
          ? interpolate(frame, [dimWindow[0], dimWindow[1]], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.inOut(Easing.cubic),
            })
          : 0;

        const g = isReputation ? green : 0;

        /** Les critères barrés disparaissent ; « Réputation » se renforce. */
        const fade = isReputation ? 1 : others;
        const boost = isReputation ? strength : 0;
        const hit = isReputation ? impact : 0;

        return (
          <foreignObject
            key={label}
            x={COLUMNS[i] - CHIP_WIDTH / 2}
            y={CHIP_TOP}
            width={CHIP_WIDTH}
            height={CHIP_HEIGHT}
            style={{ overflow: "visible" }}
          >
            <div
              style={{
                width: CHIP_WIDTH,
                height: CHIP_HEIGHT,
                boxSizing: "border-box",
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                paddingLeft: 22,
                paddingRight: 22,
                borderRadius: 22,
                backgroundColor: interpolateColors(
                  g,
                  [0, 1],
                  [G.white, GREEN_SOFT],
                ),
                border: `1px solid ${interpolateColors(
                  g,
                  [0, 1],
                  [G.border, GREEN_BORDER],
                )}`,
                boxShadow: `0 ${2 + boost * 8}px ${10 + boost * 20}px rgba(32,33,36,${
                  (0.07 + boost * 0.06) * appear
                }), 0 0 0 ${10 * g + 8 * boost + 16 * hit}px rgba(24,128,56,${
                  0.08 + hit * 0.04
                })`,
                opacity: appear * (1 - dim * 0.42) * fade,
                translate: `0px ${(1 - appear) * 26 + (1 - fade) * 18}px`,
                scale: (
                  0.96 +
                  appear * 0.04 +
                  g * 0.045 +
                  pulse +
                  boost * 0.055 +
                  hit * 0.022
                ).toString(),
              }}
            >
              {/*
                Le barré est une copie exacte du libellé, soulignée en rouge et
                révélée de gauche à droite par un clip. Un simple rectangle
                tomberait entre les deux lignes d'un libellé sur plusieurs
                lignes : ici chaque ligne est réellement barrée.
              */}
              <span
                style={{
                  position: "relative",
                  display: "inline-block",
                  fontFamily: FONT_FAMILY,
                  fontSize: 38,
                  fontWeight: 500,
                  lineHeight: 1.25,
                  textAlign: "center",
                  color: interpolateColors(
                    g,
                    [0, 1],
                    [G.textPrimary, GREEN],
                  ),
                }}
              >
                {label}
                {strike > 0 ? (
                  <span
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      width: "100%",
                      textAlign: "center",
                      textDecoration: "line-through",
                      textDecorationColor: RED,
                      textDecorationThickness: 5,
                      clipPath: `inset(0 ${(1 - strike) * 100}% 0 0)`,
                    }}
                  >
                    {label}
                  </span>
                ) : null}
              </span>
            </div>
          </foreignObject>
        );
      })}
    </svg>
  );
};
