/**
 * ReviewCollectionProblem — « le client est content, mais il ne laisse pas
 * d'avis ».
 *
 * Scène insérée entre la fin du flux d'avis qui renforce « Réputation » et le
 * swipe horizontal vers la plaque NFC. Elle installe la difficulté commerciale
 * que la plaque vient résoudre :
 *
 *   1. la question « Mais comment obtenir plus d'avis Google ? » ;
 *   2. un client satisfait apparaît (coche verte, aucun texte) ;
 *   3. le parcours classique pour déposer un avis : chercher, trouver la
 *      section des avis, rédiger et publier — trois étapes, uniquement des
 *      icônes ;
 *   4. le client va au bout et publie réellement son avis ;
 *   5. la conclusion révèle pourquoi ce parcours ne suffit pas : presque
 *      personne ne pense à faire spontanément toutes ces étapes.
 *
 * Aucun pourcentage, aucune statistique : la difficulté se lit uniquement dans
 * les abandons et dans la longueur du parcours.
 *
 * Le composant est monté dans une <Sequence>, sa frame locale part donc de 0.
 * Tous les repères ci-dessous sont locaux ; le seul point d'ancrage absolu est
 * `PROBLEM_START`, calculé depuis `REVIEW_FLOW_END`.
 */

import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { G } from "../config/google-ui";
import { FONT_FAMILY } from "../config/fonts";
import { VOICEOVER_FRAMES } from "../config/voiceover";
import {
  FLOW_REVIEWS,
  GoogleReviewCard,
  type GoogleReview,
} from "./GoogleReviewCard";
import { StarsRating } from "./StarsRating";

/* -------------------------------------------------------------------------- */
/*  Ancrage sur la timeline de GoogleRankingVsl                               */
/* -------------------------------------------------------------------------- */

/**
 * Temps de pose sur la pastille « Réputation » renforcée avant que l'arbre ne
 * commence à s'effacer. La scène ne démarre donc jamais sur une coupure.
 */
export const PROBLEM_HOLD = 10;

/** Première frame absolue de la scène, dérivée de la fin réelle du flux. */
/** Pré-roll de 8 frames : le titre est déjà en mouvement au premier mot. */
export const PROBLEM_START = VOICEOVER_FRAMES.questionStart - 8;

/**
 * Disparition de l'arbre, des avis et de la fiche établissement, en frames
 * absolues. Elle chevauche l'entrée des clients : l'histoire se poursuit, elle
 * ne redémarre pas.
 */
export const SCENE_OUT = [PROBLEM_START - 16, PROBLEM_START + 8] as const;

/* -------------------------------------------------------------------------- */
/*  Rythme interne (frames locales)                                           */
/* -------------------------------------------------------------------------- */

const PROBLEM_TIMING_DEMO_OFFSET =
  VOICEOVER_FRAMES.classicJourneyStart - PROBLEM_START - 8;

export const PROBLEM_TIMING = {
  /** Question d'abord, tenue pour la voix off, puis transition vers la démo. */
  questionIn: [0, 16] as const,
  questionOut: [58, 76] as const,
  demoStart: PROBLEM_TIMING_DEMO_OFFSET,
  /** Entrée du seul client satisfait. */
  clientsIn: [0, 18] as const,
  clientStagger: 0,
  /** Tracé du parcours puis apparition des trois étapes. */
  pathDraw: [18, 54] as const,
  tileStarts: [30, 58, 86] as const,
  tileDuration: 20,
  /**
   * Un parcours par client. `arrivals` donne la frame d'arrivée à chaque
   * étape ; `abandon` la fenêtre de disparition pour ceux qui renoncent.
   */
  journeys: [
    { start: 42, arrivals: [94], abandon: [108, 126] },
    { start: 82, arrivals: [132, 212], abandon: [230, 250] },
    {
      start: 42,
      arrivals: [
        VOICEOVER_FRAMES.searchComplete - PROBLEM_START - PROBLEM_TIMING_DEMO_OFFSET,
        VOICEOVER_FRAMES.reviewsSectionFound - PROBLEM_START - PROBLEM_TIMING_DEMO_OFFSET,
        VOICEOVER_FRAMES.writingStart - PROBLEM_START - PROBLEM_TIMING_DEMO_OFFSET,
      ],
      abandon: null,
    },
  ],
  /** L'avis réellement publié par le client vert. */
  review: [
    VOICEOVER_FRAMES.publishStart - PROBLEM_START - PROBLEM_TIMING_DEMO_OFFSET,
    VOICEOVER_FRAMES.classicJourneyEnd - PROBLEM_START - PROBLEM_TIMING_DEMO_OFFSET + 6,
  ] as const,
  /** Effacement des profils, du parcours et de l'avis publié. */
  fadeOut: [
    VOICEOVER_FRAMES.frictionStart - PROBLEM_START - PROBLEM_TIMING_DEMO_OFFSET - 8,
    VOICEOVER_FRAMES.frictionStart - PROBLEM_START - PROBLEM_TIMING_DEMO_OFFSET + 14,
  ] as const,
  /** Conclusion commerciale, en frames absolues dans la scène. */
  conclusionIn: [
    VOICEOVER_FRAMES.frictionStart - PROBLEM_START - 10,
    VOICEOVER_FRAMES.frictionStart - PROBLEM_START + 10,
  ] as const,
} as const;

/**
 * Durée totale de la scène.
 *
 *   0 → 76       la question entre, reste lisible, puis s'efface ;
 *   99 → 489     le client apparaît, parcourt les trois étapes et publie ;
 *   489 → fin    la conclusion explique pourquoi presque personne ne le fait.
 */
export const PROBLEM_DURATION =
  VOICEOVER_FRAMES.plaqueVisualStart - PROBLEM_START;

/* -------------------------------------------------------------------------- */
/*  Géométrie (repère 1080 × 1920)                                            */
/* -------------------------------------------------------------------------- */

const FRAME_W = 1080;
const FRAME_H = 1920;

/** Position du seul client satisfait. */
const ROW_Y = 400;
const ROW_X = [300, 540, 540] as const;
const AVATAR_SIZE = 132;
const ACTIVE_CLIENT_INDEX = 2;

/** Colonne du parcours : c'est elle que les clients descendent. */
const LINE_X = 380;
const LINE_TOP = 560;
const LINE_BOTTOM = 1440;

/** Ordonnées des trois étapes. */
const STEP_Y = [700, 1000, 1300] as const;

/** Tuiles d'étape, à droite de la colonne. */
const TILE_X = 700;
const TILE_SIZE = 168;

/** Avis publié, en bas de la scène. */
const PUBLISHED_Y = 1600;

const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
const EASE_MOVE = Easing.bezier(0.45, 0, 0.25, 1);

const GREEN = G.openGreen;
const BLUE = G.actionBlue;
const GREY_LINE = "#DADCE0";

/* -------------------------------------------------------------------------- */
/*  Pictogrammes, dessinés en SVG inline                                      */
/* -------------------------------------------------------------------------- */

/** Le « G » Google quadricolore. */
const GoogleG: React.FC<{ readonly size: number }> = ({ size }) => (
  <svg viewBox="0 0 24 24" width={size} height={size}>
    <path
      d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47a5.54 5.54 0 0 1-2.4 3.63v3h3.86c2.26-2.09 3.56-5.17 3.56-8.87z"
      fill="#4285F4"
    />
    <path
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09A11.99 11.99 0 0 0 12 24z"
      fill="#34A853"
    />
    <path
      d="M5.27 14.29a7.2 7.2 0 0 1 0-4.58V6.62H1.29a12 12 0 0 0 0 10.76l3.98-3.09z"
      fill="#FBBC05"
    />
    <path
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z"
      fill="#EA4335"
    />
  </svg>
);

/** Étape 1 — chercher l'établissement : une loupe, et le « G » dans le verre. */
const SearchStepIcon: React.FC = () => (
  <div style={{ position: "relative", width: 104, height: 104 }}>
    <svg viewBox="0 0 48 48" width={104} height={104}>
      <circle
        cx={21}
        cy={21}
        r={14}
        fill="none"
        stroke={G.textSecondary}
        strokeWidth={3.4}
      />
      <path
        d="M31.5 31.5 L42 42"
        stroke={G.textSecondary}
        strokeWidth={4.2}
        strokeLinecap="round"
      />
    </svg>
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        translate: "27.5px 27.5px",
      }}
    >
      <GoogleG size={36} />
    </div>
  </div>
);

/** Étape 2 — trouver la section des avis : une fiche et ses étoiles. */
const ReviewsStepIcon: React.FC = () => (
  <svg viewBox="0 0 48 48" width={104} height={104}>
    <rect
      x={6}
      y={8}
      width={36}
      height={32}
      rx={5}
      fill="none"
      stroke={G.textSecondary}
      strokeWidth={3}
    />
    <rect x={12} y={15} width={16} height={3} rx={1.5} fill={G.border} />
    <rect x={12} y={22} width={24} height={3} rx={1.5} fill={G.border} />
    {[0, 1, 2, 3, 4].map((i) => (
      <path
        key={i}
        d="M4 0.6l1.06 2.2 2.4.32-1.76 1.66.44 2.38L4 6.02 1.86 7.16l.44-2.38L.54 3.12l2.4-.32z"
        transform={`translate(${8.8 + i * 5.6} 30)`}
        fill={G.starYellow}
      />
    ))}
  </svg>
);

/** Étape 3 — rédiger puis publier : un crayon. */
const WriteStepIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" width={104} height={104}>
    <path
      d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
      fill={BLUE}
    />
  </svg>
);

const STEP_ICONS = [SearchStepIcon, ReviewsStepIcon, WriteStepIcon] as const;

/** Coche « client satisfait », posée en bas à droite de chaque avatar. */
const SatisfiedCheck: React.FC<{ readonly size: number }> = ({ size }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: GREEN,
      border: `${size * 0.09}px solid ${G.white}`,
      boxSizing: "border-box",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <svg viewBox="0 0 24 24" width={size * 0.62} height={size * 0.62}>
      <path
        d="M9.6 16.2 5.4 12l-1.4 1.4 5.6 5.6L20.4 7.8 19 6.4z"
        fill={G.white}
      />
    </svg>
  </div>
);

/* -------------------------------------------------------------------------- */
/*  L'avis réellement publié par le troisième client                          */
/* -------------------------------------------------------------------------- */

const PUBLISHED_REVIEW: GoogleReview = {
  id: "publie",
  author: FLOW_REVIEWS[2].author,
  avatarColor: FLOW_REVIEWS[2].avatarColor,
  date: "à l'instant",
  comment: FLOW_REVIEWS[2].comment,
  isNew: true,
};

/* -------------------------------------------------------------------------- */
/*  Un client et sa progression                                               */
/* -------------------------------------------------------------------------- */

type ClientState = {
  readonly x: number;
  readonly y: number;
  readonly size: number;
  /** 0 → 1 : présence à l'écran. */
  readonly alive: number;
  /** 0 → 1 : perte de saturation quand le client renonce. */
  readonly dropout: number;
};

/** Fonction pure : aucun hook React, elle ne lit que la frame qu'on lui passe. */
const computeClientState = (
  index: number,
  frame: number,
  activeJourneyArrivals?: readonly [number, number, number],
): ClientState => {
  const journey = PROBLEM_TIMING.journeys[index];
  const arrivals =
    index === ACTIVE_CLIENT_INDEX && activeJourneyArrivals
      ? activeJourneyArrivals
      : journey.arrivals;
  const appear =
    PROBLEM_TIMING.clientsIn[0] + index * PROBLEM_TIMING.clientStagger;

  const enter = interpolate(
    frame,
    [
      appear,
      appear + (PROBLEM_TIMING.clientsIn[1] - PROBLEM_TIMING.clientsIn[0]),
    ],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT },
  );

  /** Rejoint la colonne du parcours en 10 frames, puis descend d'étape en étape. */
  const detach = journey.start + 10;

  const x = interpolate(
    frame,
    [journey.start, detach],
    [ROW_X[index], LINE_X],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: EASE_MOVE,
    },
  );

  const y = interpolate(
    frame,
    [journey.start, detach, ...arrivals],
    [ROW_Y, LINE_TOP, ...arrivals.map((_, k) => STEP_Y[k])],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_MOVE },
  );

  const shrink = interpolate(frame, [journey.start, detach], [1, 0.84], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE_MOVE,
  });

  /** Renoncement : la progression s'arrête, l'avatar se désature et s'efface. */
  const dropout = journey.abandon
    ? interpolate(frame, [journey.abandon[0], journey.abandon[1]], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.inOut(Easing.cubic),
      })
    : 0;

  return {
    x,
    y,
    size: AVATAR_SIZE * shrink,
    alive: enter * (1 - dropout),
    dropout,
  };
};

/* -------------------------------------------------------------------------- */

export const ReviewCollectionProblem: React.FC<{
  /**
   * Démonstration du parcours classique (clients, colonne, tuiles, avis
   * publié). Vraie par défaut : `GoogleRankingVsl` — et donc `DpaTapFullVsl` —
   * monte la scène sans aucune prop et reste rigoureusement inchangée.
   *
   * Le montage court la passe à `false` : il a coupé les 8,3 s de voix off qui
   * commentent ce parcours, il ne doit donc pas en afficher la fin en train de
   * s'effacer — le spectateur ne l'a jamais vu commencer. Seule la conclusion
   * reste, avec son entrée échelonnée intacte.
   */
  readonly showJourney?: boolean;
  /**
   * Première ligne de la question. La VSL complète conserve sa formulation
   * historique par défaut ; le Short peut retirer « Mais » sans la modifier.
   */
  readonly questionLead?: string;
  /**
   * Frames d'arrivée du client vert aux trois étapes. Sans cette prop, les
   * repères historiques de la Full VSL restent utilisés.
   */
  readonly activeJourneyArrivals?: readonly [number, number, number];
}> = ({
  showJourney = true,
  questionLead = "Mais comment obtenir",
  activeJourneyArrivals,
}) => {
  const frame = useCurrentFrame();
  const T = PROBLEM_TIMING;
  const demoFrame = frame - T.demoStart;

  /** Entrée après la question, puis effacement global de la démonstration. */
  const demoIn = interpolate(demoFrame, [0, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE_OUT,
  });
  const demoOut = interpolate(demoFrame, [T.fadeOut[0], T.fadeOut[1]], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const demo = demoIn * demoOut;

  /** Tracé de la colonne du parcours. */
  const pathDraw = interpolate(
    demoFrame,
    [T.pathDraw[0], T.pathDraw[1]],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: EASE_OUT,
    },
  );

  const activeClient = computeClientState(
    ACTIVE_CLIENT_INDEX,
    demoFrame,
    activeJourneyArrivals,
  );
  const activeArrivals =
    activeJourneyArrivals ?? T.journeys[ACTIVE_CLIENT_INDEX].arrivals;

  /** Étape atteinte : la tuile et son nœud passent au bleu Google. */
  const stepReached = STEP_Y.map((_, step) => {
    const arrival = activeArrivals[step];
    return interpolate(demoFrame, [arrival - 4, arrival + 4], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: EASE_OUT,
    }) * activeClient.alive;
  });

  /** Apparition de l'avis publié par le client vert. */
  const published = interpolate(demoFrame, [T.review[0], T.review[1]], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE_OUT,
  });

  /** Entrée de la question, ligne par ligne. */
  const question = (delay: number) =>
    interpolate(
      frame,
      [T.questionIn[0] + delay, T.questionIn[1] + delay],
      [0, 1],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT },
    );

  const questionOut = interpolate(frame, T.questionOut, [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const line1 = question(0) * questionOut;
  const line2 = question(5) * questionOut;
  const stars = question(11) * questionOut;

  /** Conclusion : le parcours démontré est trop long pour être spontané. */
  const conclusion = (delay: number) =>
    interpolate(
      frame,
      [T.conclusionIn[0] + delay, T.conclusionIn[1] + delay],
      [0, 1],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT },
    );

  const conclusionIcon = conclusion(0);
  const conclusionTitle = conclusion(5);
  const conclusionReason = conclusion(11);

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: FRAME_W,
        height: FRAME_H,
        // Aucun fond ici : la scène se pose PAR-DESSUS le premier acte pendant
        // qu'il s'efface. Un blanc opaque le masquerait d'un coup et
        // remplacerait le fondu par une coupure. Le blanc permanent est celui
        // de GoogleRankingVsl, juste en dessous.
        fontFamily: FONT_FAMILY,
        overflow: "hidden",
      }}
    >
      {/* ---------------------------------------------------------------- */}
      {/*  Parties 1 à 3 — clients, parcours, abandons, avis publié         */}
      {/* ---------------------------------------------------------------- */}
      {showJourney && demo > 0 ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: FRAME_W,
            height: FRAME_H,
            opacity: demo,
          }}
        >
          <svg
            viewBox={`0 0 ${FRAME_W} ${FRAME_H}`}
            width={FRAME_W}
            height={FRAME_H}
            style={{ position: "absolute", left: 0, top: 0 }}
          >
            {/* Colonne du parcours, discrète, tracée de haut en bas */}
            <path
              d={`M${LINE_X} ${LINE_TOP} L ${LINE_X} ${LINE_BOTTOM}`}
              fill="none"
              stroke={GREY_LINE}
              strokeWidth={5}
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray="1 1"
              strokeDashoffset={1 - pathDraw}
            />

            {/*
              Progression de chaque client, en bleu Google. Elle s'arrête net
              là où il renonce et s'efface avec lui : le chemin devant lui
              redevient gris.
            */}
            {activeClient.alive > 0.01 && activeClient.y > LINE_TOP ? (
              <path
                d={`M${LINE_X} ${LINE_TOP} L ${LINE_X} ${activeClient.y}`}
                fill="none"
                stroke={published > 0 ? GREEN : BLUE}
                strokeWidth={5}
                strokeLinecap="round"
                opacity={activeClient.alive}
              />
            ) : null}

            {/* Nœuds et connecteurs pointillés vers les tuiles d'étape */}
            {STEP_Y.map((stepY, step) => (
              <g key={`node-${step}`} opacity={pathDraw}>
                <line
                  x1={LINE_X + 34}
                  y1={stepY}
                  x2={TILE_X - TILE_SIZE / 2 - 18}
                  y2={stepY}
                  stroke={GREY_LINE}
                  strokeWidth={3}
                  strokeDasharray="7 11"
                  strokeLinecap="round"
                />
                <circle
                  cx={LINE_X}
                  cy={stepY}
                  r={12 + stepReached[step] * 4}
                  fill={stepReached[step] > 0.5 ? BLUE : GREY_LINE}
                />
              </g>
            ))}
          </svg>

          {/* Les trois tuiles d'étape */}
          {STEP_Y.map((stepY, step) => {
            const Icon = STEP_ICONS[step];
            const appear = interpolate(
              demoFrame,
              [T.tileStarts[step], T.tileStarts[step] + T.tileDuration],
              [0, 1],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: EASE_OUT,
              },
            );
            const active = stepReached[step];

            return (
              <div
                key={`tile-${step}`}
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  width: TILE_SIZE,
                  height: TILE_SIZE,
                  borderRadius: 34,
                  boxSizing: "border-box",
                  backgroundColor: G.white,
                  border: `2px solid ${active > 0.5 ? BLUE : G.border}`,
                  boxShadow: `0 4px 18px rgba(32,33,36,${
                    0.06 + active * 0.06
                  })`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: appear,
                  translate: `${TILE_X - TILE_SIZE / 2}px ${
                    stepY - TILE_SIZE / 2 + (1 - appear) * 18
                  }px`,
                  scale: (0.94 + appear * 0.06 + active * 0.03).toString(),
                }}
              >
                <Icon />
              </div>
            );
          })}

          {/* Le seul client satisfait */}
          {([ACTIVE_CLIENT_INDEX] as const).map((i) => {
            const client = activeClient;
            return (
              <div
                key={FLOW_REVIEWS[i].id}
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  width: client.size,
                  height: client.size,
                  opacity: client.alive,
                  filter: `saturate(${1 - client.dropout * 0.7})`,
                  translate: `${client.x - client.size / 2}px ${
                    client.y - client.size / 2
                  }px`,
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    backgroundColor: FLOW_REVIEWS[i].avatarColor,
                    color: G.white,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: client.size * 0.44,
                    fontWeight: 500,
                    lineHeight: 1,
                    boxShadow: "0 6px 20px rgba(32,33,36,0.16)",
                  }}
                >
                  {FLOW_REVIEWS[i].author.charAt(0)}
                </div>
                <div
                  style={{
                    position: "absolute",
                    right: -2,
                    bottom: -2,
                    // La coche disparaît avec l'avatar, jamais avant lui.
                    opacity: 1,
                  }}
                >
                  <SatisfiedCheck size={client.size * 0.36} />
                </div>
              </div>
            );
          })}

          {/* L'avis réellement publié, au bout du parcours */}
          {published > 0 ? (
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                translate: `${(FRAME_W - 720) / 2}px ${
                  PUBLISHED_Y - 88 + (1 - published) * 24
                }px`,
                opacity: published,
                scale: (0.94 + published * 0.06).toString(),
              }}
            >
              <GoogleReviewCard review={PUBLISHED_REVIEW} />
            </div>
          ) : null}
        </div>
      ) : null}

      {/* ---------------------------------------------------------------- */}
      {/*  Partie 4 — la question, tenue pour la voix off                   */}
      {/* ---------------------------------------------------------------- */}
      {line1 > 0 ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: FRAME_W,
            height: FRAME_H,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            paddingLeft: 70,
            paddingRight: 70,
            boxSizing: "border-box",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 80,
              fontWeight: 400,
              color: G.textPrimary,
              lineHeight: 1.18,
              whiteSpace: "nowrap",
              opacity: line1,
              translate: `0px ${(1 - line1) * 24}px`,
            }}
          >
            {questionLead}
          </div>
          <div
            style={{
              marginTop: 14,
              fontSize: 88,
              fontWeight: 700,
              color: G.textPrimary,
              lineHeight: 1.18,
              whiteSpace: "nowrap",
              opacity: line2,
              translate: `0px ${(1 - line2) * 24}px`,
            }}
          >
            plus d’avis{" "}
            {Array.from("Google").map((letter, index) => (
              <span key={letter + index} style={{ color: G.logo[index] }}>
                {letter}
              </span>
            ))}{" "}
            ?
          </div>
          <div
            style={{
              marginTop: 48,
              opacity: stars * 0.92,
              translate: `0px ${(1 - stars) * 16}px`,
            }}
          >
            <StarsRating
              progress={5}
              size={40}
              gap={6}
              idPrefix="question-stars"
            />
          </div>
        </div>
      ) : null}

      {/* ---------------------------------------------------------------- */}
      {/*  Conclusion — pourquoi le parcours classique ne suffit pas       */}
      {/* ---------------------------------------------------------------- */}
      {conclusionIcon > 0 ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: FRAME_W,
            height: FRAME_H,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            paddingLeft: 72,
            paddingRight: 72,
            boxSizing: "border-box",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 180,
              height: 180,
              borderRadius: 36,
              border: `2px solid ${G.border}`,
              backgroundColor: G.white,
              boxShadow: "0 8px 28px rgba(32,33,36,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 62,
              opacity: conclusionIcon * 0.72,
              translate: `0px ${(1 - conclusionIcon) * 24}px`,
              scale: (0.94 + conclusionIcon * 0.06).toString(),
            }}
          >
            <SearchStepIcon />
          </div>

          <div
            style={{
              fontSize: 76,
              fontWeight: 700,
              color: G.textPrimary,
              lineHeight: 1.16,
              opacity: conclusionTitle,
              translate: `0px ${(1 - conclusionTitle) * 24}px`,
            }}
          >
            Presque aucun client
            <br />
            ne fait cette recherche.
          </div>

          <div
            style={{
              marginTop: 42,
              maxWidth: 850,
              fontSize: 43,
              fontWeight: 400,
              color: G.textSecondary,
              lineHeight: 1.38,
              opacity: conclusionReason,
              translate: `0px ${(1 - conclusionReason) * 20}px`,
            }}
          >
            Ils oublient… ou n’ont simplement pas envie
            <br />
            de faire toutes ces étapes.
          </div>
        </div>
      ) : null}
    </div>
  );
};
