/**
 * DpaTapFullVsl — le film complet, d'un seul tenant.
 *
 *   0 → 1200      classement, critères et difficulté à récolter des avis ;
 *   1201 → 1836   plaque NFC, iPhone, notification, étoiles et publication ;
 *   1837 → 1911   présentation visuelle finale de DPA TAP.
 *
 * Rien n'est pré-rendu : les deux motion designs sont montés comme composants
 * React et partagent la même timeline Remotion. La voix ElevenLabs est la piste
 * maîtresse ; ses repères sont centralisés dans `config/voiceover.ts`.
 *
 * La jonction est un défilement horizontal, pas une rotation : les deux scènes
 * sont posées côte à côte sur une piste de 2160 px et c'est la piste entière qui
 * translate. Aucune perspective, aucun `rotateY`, aucun `scale`, aucun fondu —
 * les proportions de chaque panneau sont donc rigoureusement constantes du début
 * à la fin du mouvement.
 */

import React from "react";
import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Easing,
  Freeze,
  interpolate,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  staticFile,
} from "remotion";
import { G } from "../config/google-ui";
import { DpaTapReelBlue } from "../dpa/DpaTapReelBlue";
import { DURATION_IN_FRAMES } from "../dpa/constants";
import { DpaSalesEndScene, SALES_END_DURATION } from "./DpaSalesEndScene";
import { GOOGLE_VSL_DURATION, GoogleRankingVsl } from "./GoogleRankingVsl";
import { GoogleRankingHook } from "./GoogleRankingHook";
import { VOICEOVER, VOICEOVER_FRAMES } from "../config/voiceover";

/**
 * Durée du hook Google. Sa dernière image visible précède l'arrivée de la
 * plaque à 40,811 secondes.
 * La valeur est définie une seule fois, dans `GoogleRankingVsl` ; elle est
 * simplement réexportée ici pour les consommateurs historiques.
 */
export { GOOGLE_VSL_DURATION };

/** Durée du swipe : 22 frames ≈ 0,73 s à 30 fps. */
export const SWIPE_DURATION = 22;

/**
 * Payoff visuel de la phrase : « Chaque nouvel avis renforce votre réputation
 * et vous aide à remonter face à vos concurrents. »
 *
 * Ces repères sont volontairement indépendants de `voiceover.ts` : ajouter ce
 * rappel visuel ne déplace aucune scène ni aucun réglage déjà validé.
 */
const RANKING_PAYOFF_START = 52 * 30;
const RANKING_PAYOFF_DURATION = 5 * 30;
const RANKING_PAYOFF_SWIPE = 12;

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

/** Fin du reel NFC, au début de la promesse commerciale. */
export const CORE_DURATION = DPA_START + DURATION_IN_FRAMES;

/** Durée totale, calculée — jamais écrite en dur. */
export const FULL_DURATION = CORE_DURATION + SALES_END_DURATION;

/** Easing du swipe : départ doux, arrivée douce, aucun rebond. */
const SWIPE_EASING = Easing.bezier(0.65, 0, 0.35, 1);

/**
 * Le swipe horizontal, utilisé à l'identique aux deux jonctions du film.
 *
 * Une piste de deux panneaux de 1080 × 1920 collés l'un à l'autre :
 *
 *   ┌──────────────┬──────────────┐
 *   │  scène qui   │  scène qui   │   piste : 2160 × 1920
 *   │  sort, figée │  arrive, en  │   translateX : 0 → -1080
 *   │              │  lecture     │
 *   └──────────────┴──────────────┘
 *   └── cadre ─────┘
 *
 * Le cadre (1080 × 1920, `overflow: hidden`) ne bouge pas ; seule la piste
 * translate. Le regard part donc toujours vers la DROITE : le contenu courant
 * s'en va vers la gauche et le suivant arrive de la droite.
 *
 * Le panneau gauche reçoit un `<Freeze>` : ce n'est pas une capture, c'est le
 * même composant, gelé sur sa dernière frame.
 * Ne pas retirer l'`<AbsoluteFill>` qui enveloppe la piste : posé directement
 * sous une `<Sequence from>`, un `<Freeze>` résout une frame erronée (la page
 * revient à un état antérieur, sans le critère « Réputation » en vert). Il lui
 * faut un niveau de séquence intermédiaire — ce qu'est une `<AbsoluteFill>`.
 */
const HorizontalSwipe: React.FC<{
  /** Scène sortante, déjà enveloppée dans son `<Freeze>`. */
  readonly outgoing: React.ReactNode;
  /** Scène entrante, qui joue sa timeline locale dès la première frame. */
  readonly incoming: React.ReactNode;
}> = ({ outgoing, incoming }) => {
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
          que rejouer la scène précédente pour rien pendant des centaines de
          frames.
        */}
        {frame <= SWIPE_DURATION ? (
          <div style={{ ...panel, left: 0 }}>{outgoing}</div>
        ) : null}

        {/* Panneau droit : collé au précédent, sans le moindre espace. */}
        <div style={{ ...panel, left: width }}>{incoming}</div>
      </div>
    </AbsoluteFill>
  );
};

/**
 * Rejoue le hook Google validé dans une fenêtre de cinq secondes.
 * La page entre depuis la droite, l'animation attend la fin du swipe, puis la
 * fiche gagne ses avis et dépasse les trois concurrents avant de sortir à
 * gauche. La scène principale continue de tourner dessous sans être modifiée.
 */
const RankingPayoff: React.FC = () => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();

  const x = interpolate(
    frame,
    [
      0,
      RANKING_PAYOFF_SWIPE,
      RANKING_PAYOFF_DURATION - RANKING_PAYOFF_SWIPE,
      RANKING_PAYOFF_DURATION,
    ],
    [width, 0, 0, -width],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: [SWIPE_EASING, Easing.linear, SWIPE_EASING],
    },
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: G.white,
        translate: `${x}px 0px`,
        boxShadow: "-18px 0 42px rgba(60, 64, 67, 0.12)",
      }}
    >
      <Freeze frame={Math.max(0, frame - RANKING_PAYOFF_SWIPE)}>
        <GoogleRankingHook />
      </Freeze>
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
    <AbsoluteFill
      style={{
        backgroundColor: G.white,
      }}
    >
      <Audio
        src={staticFile(VOICEOVER.asset)}
        trimAfter={VOICEOVER_FRAMES.spokenEnd}
        volume={1}
      />
      <Sequence
        durationInFrames={GOOGLE_VSL_DURATION}
        name="Hook Google + acte 2 (0-731)"
        from={-2}
      >
        <GoogleRankingVsl />
      </Sequence>
      {/*
        Swipe + reel NFC. La frame interne repart de 0 à la frame globale 732,
        donc tous les `T.*`, les sons et les animations restent synchronisés
        entre eux. `premountFor` monte la séquence 30 frames plus tôt, invisible :
        le GLB de la plaque, les captures d'écran et les .wav sont déjà chargés
        quand le mouvement démarre.
      */}
      <Sequence
        from={DPA_START}
        durationInFrames={DURATION_IN_FRAMES}
        premountFor={30}
        name="Swipe horizontal + DPA TAP (732+)"
      >
        <HorizontalSwipe
          outgoing={
            <Freeze frame={GOOGLE_VSL_DURATION - 1}>
              <GoogleRankingVsl />
            </Freeze>
          }
          incoming={<DpaTapReelBlue />}
        />
      </Sequence>
      {/*
        Seconde jonction, rigoureusement identique à la première : l'écran
        « +1 avis » — le reel gelé sur sa dernière frame — sort par la gauche
        pendant que la page de présentation entre par la droite. À la frame
        globale 1035 la piste est encore à `translateX(0)`, l'image est donc
        exactement celle de la frame 1034.
      */}
      <Sequence
        from={CORE_DURATION}
        durationInFrames={SALES_END_DURATION}
        premountFor={30}
        name="Swipe horizontal + Présentation DPA TAP (1035+)"
      >
        <HorizontalSwipe
          outgoing={
            <Freeze frame={DURATION_IN_FRAMES - 1}>
              <DpaTapReelBlue />
            </Freeze>
          }
          incoming={<DpaSalesEndScene />}
        />
      </Sequence>

      {/*
        Rappel du hook entre 52 s et 57 s. Placé en dernier, il passe au-dessus
        du montage existant sans en changer les durées ni les timecodes.
      */}
      <Sequence
        from={RANKING_PAYOFF_START}
        durationInFrames={RANKING_PAYOFF_DURATION}
        premountFor={30}
        name="Payoff : les avis font remonter l'établissement (52-57 s)"
      >
        <RankingPayoff />
      </Sequence>
    </AbsoluteFill>
  );
};
