/**
 * DpaTapFullVsl — le film complet, d'un seul tenant.
 *
 *   frames 0 → 399    le hook Google (`GoogleRankingVsl`), strictement intact ;
 *   frames 400 → 421  swipe horizontal : la page Google sort par la gauche
 *                     pendant que la scène DPA entre par la droite ;
 *   frames 422 → …    le reel NFC occupe tout le cadre et continue.
 *
 * Rien n'est pré-rendu : les deux motion designs sont montés comme composants
 * React et partagent la même timeline Remotion. Aucune balise <Video>, aucun
 * MP4 intermédiaire.
 *
 * La jonction est un défilement horizontal, pas une rotation : les deux scènes
 * sont posées côte à côte sur une piste de 2160 px et c'est la piste entière qui
 * translate. Aucune perspective, aucun `rotateY`, aucun `scale`, aucun fondu —
 * les proportions de chaque panneau sont donc rigoureusement constantes du début
 * à la fin du mouvement.
 */

import React from "react";
import {
  AbsoluteFill,
  Easing,
  Freeze,
  interpolate,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { G } from "../config/google-ui";
import { DpaTapReelBlue } from "../dpa/DpaTapReelBlue";
import { DURATION_IN_FRAMES } from "../dpa/constants";
import { GoogleRankingVsl } from "./GoogleRankingVsl";

/** Durée du hook Google. Sa dernière image visible est la frame 399. */
export const GOOGLE_VSL_DURATION = 400;

/** Durée du swipe : 22 frames ≈ 0,73 s à 30 fps. */
export const SWIPE_DURATION = 22;

/**
 * Première frame du reel NFC : la frame où le swipe commence.
 *
 * Le reel démarre EN MÊME TEMPS que le mouvement, dans le panneau de droite :
 * pendant que ce panneau entre dans le cadre, la plaque joue déjà son fondu
 * d'apparition. À la fin du swipe elle est visible et poursuit son animation
 * sans saut ni redémarrage — sa timeline locale n'est jamais gelée ni remise à
 * zéro, elle court d'une seule traite de 0 à `DURATION_IN_FRAMES - 1`.
 */
export const DPA_START = GOOGLE_VSL_DURATION;

/** Durée totale, calculée — jamais écrite en dur. */
export const FULL_DURATION = DPA_START + DURATION_IN_FRAMES;

/** Easing du swipe : départ doux, arrivée douce, aucun rebond. */
const SWIPE_EASING = Easing.bezier(0.65, 0, 0.35, 1);

/**
 * Le swipe horizontal, puis le reel.
 *
 * Une piste de deux panneaux de 1080 × 1920 collés l'un à l'autre :
 *
 *   ┌──────────────┬──────────────┐
 *   │  frame 399   │  DpaTapReel  │   piste : 2160 × 1920
 *   │  du hook,    │  Blue, en    │   translateX : 0 → -1080
 *   │  figée       │  lecture     │
 *   └──────────────┴──────────────┘
 *   └── cadre ─────┘
 *
 * Le cadre (1080 × 1920, `overflow: hidden`) ne bouge pas ; seule la piste
 * translate. Le regard part donc vers la DROITE, du côté « Réputation » : le
 * contenu Google s'en va vers la gauche et la plaque arrive de la droite.
 *
 * `<Freeze frame={399}>` rend `GoogleRankingVsl` exactement dans l'état de sa
 * frame 399 : ce n'est pas une capture, c'est le même composant, gelé.
 * Ne pas retirer l'`<AbsoluteFill>` qui enveloppe la piste : posé directement
 * sous une `<Sequence from>`, un `<Freeze>` résout une frame erronée (la page
 * revient à un état antérieur, sans le critère « Réputation » en vert). Il lui
 * faut un niveau de séquence intermédiaire — ce qu'est une `<AbsoluteFill>`.
 */
const HorizontalSwipe: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  /** Translation de la piste, en pixels. Pilotée uniquement par la frame. */
  const trackX = interpolate(frame, [0, SWIPE_DURATION], [0, -width], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: SWIPE_EASING,
  });

  const panel: React.CSSProperties = {
    position: "absolute",
    top: 0,
    width,
    height,
    overflow: "hidden",
  };

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: width * 2,
          height,
          transform: `translateX(${trackX}px)`,
        }}
      >
        {/*
          Panneau gauche. Il est démonté dès que la piste a fini sa course : à
          partir de là il est entièrement hors cadre, le garder monté ne ferait
          que rejouer la page Google pour rien pendant 280 frames.
        */}
        {frame <= SWIPE_DURATION ? (
          <div style={{ ...panel, left: 0 }}>
            <Freeze frame={GOOGLE_VSL_DURATION - 1}>
              <GoogleRankingVsl />
            </Freeze>
          </div>
        ) : null}

        {/* Panneau droit : collé au précédent, sans le moindre espace. */}
        <div style={{ ...panel, left: width }}>
          <DpaTapReelBlue />
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const DpaTapFullVsl: React.FC = () => {
  return (
    /*
      Fond racine permanent. Il est déjà blanc pendant le hook, il l'est encore
      derrière la piste qui défile et pendant tout le reel : à aucun moment un
      pixel noir ou gris n'est peint en plein cadre, donc ni flash, ni fondu.
    */
    <AbsoluteFill style={{ backgroundColor: G.white }}>
      <Sequence
        durationInFrames={GOOGLE_VSL_DURATION}
        name="Hook Google (0-399)"
      >
        <GoogleRankingVsl />
      </Sequence>

      {/*
        Swipe + reel NFC. La frame interne repart de 0 à la frame globale 400,
        donc tous les `T.*`, les sons et les animations restent synchronisés
        entre eux. `premountFor` monte la séquence 30 frames plus tôt, invisible :
        le GLB de la plaque, les captures d'écran et les .wav sont déjà chargés
        quand le mouvement démarre.
      */}
      <Sequence
        from={DPA_START}
        durationInFrames={DURATION_IN_FRAMES}
        premountFor={30}
        name="Swipe horizontal + DPA TAP (400+)"
      >
        <HorizontalSwipe />
      </Sequence>
    </AbsoluteFill>
  );
};
