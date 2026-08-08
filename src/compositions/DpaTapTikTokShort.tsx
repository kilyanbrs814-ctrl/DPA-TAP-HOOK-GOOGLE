/**
 * DpaTapTikTokShort — version courte (≈ 45 s) destinée à TikTok.
 *
 * Même modèle que `DpaTapFullVsl` : six scènes posées les unes après les
 * autres, chacune dans sa `<Sequence>`. Aucun timing n'est écrit ici — ils
 * viennent tous de `config/tiktokShort.ts`, exactement comme `DpaTapFullVsl`
 * lit les siens dans `config/voiceover.ts`.
 *
 * Les composants, les animations et les transitions sont ceux de
 * `DpaTapFullVsl`, simplement rejoués à d'autres frames. Rien n'y est modifié.
 */

import React from "react";
import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Easing,
  Freeze,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { G } from "../config/google-ui";
import {
  TIKTOK_SHORT_AUDIO,
  TIKTOK_SHORT_AUDIO_FRAMES,
  TIKTOK_SHORT_FRAMES,
  TIKTOK_SHORT_SOURCE_FRAMES,
} from "../config/tiktokShort";
import {
  PROBLEM_DURATION,
  ReviewCollectionProblem,
} from "../components/ReviewCollectionProblem";
import { DpaTapReelBlue } from "../dpa/DpaTapReelBlue";
import { DpaSalesEndScene } from "./DpaSalesEndScene";
import { GoogleRankingHook } from "./GoogleRankingHook";
import { GoogleRankingVsl } from "./GoogleRankingVsl";
import { HorizontalSwipe } from "./DpaTapFullVsl";

const F = TIKTOK_SHORT_FRAMES;
const SOURCE = TIKTOK_SHORT_SOURCE_FRAMES;

/** Durée totale — celle déclarée en secondes dans `config/tiktokShort.ts`. */
export const TIKTOK_SHORT_DURATION = F.total;

/* -------------------------------------------------------------------------- */
/*  Scènes                                                                    */
/* -------------------------------------------------------------------------- */

/** Fiche « Votre établissement » gelée en 1re place. */
const FrozenHook: React.FC = () => (
  <Freeze frame={SOURCE.hookSettled}>
    <GoogleRankingHook />
  </Freeze>
);

/**
 * La conclusion « Presque aucun client… », sur fond blanc (elle n'a pas de fond
 * propre). `showJourney={false}` : le montage court a coupé la démonstration du
 * parcours classique, sa fin ne doit pas s'effacer par-dessus la conclusion.
 */
const FrictionConclusion: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: G.white }}>
    <Sequence from={-SOURCE.frictionSeek}>
      <ReviewCollectionProblem showJourney={false} />
    </Sequence>
  </AbsoluteFill>
);

/** La même scène, gelée sur sa dernière frame : panneau sortant du swipe. */
const FrictionConclusionEnd: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: G.white }}>
    <Freeze frame={PROBLEM_DURATION - 1}>
      <ReviewCollectionProblem showJourney={false} />
    </Freeze>
  </AbsoluteFill>
);

/**
 * La page Google revient par la droite et la fiche regrimpe jusqu'à la 1re
 * place, où elle se maintient.
 *
 * Copie fidèle de `RankingPayoff` (`DpaTapFullVsl`). Elle est redéfinie ici, et
 * non importée, parce que `DpaTapFullVsl` doit rester strictement intact.
 */
const RankingPayoff: React.FC = () => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();

  /** Durée du swipe, déduite des deux repères du Short. */
  const swipe = F.rankingPageIn - F.payoffStart;

  const x = interpolate(frame, [0, swipe], [width, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.65, 0, 0.35, 1),
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: G.white,
        translate: `${x}px 0px`,
        boxShadow: "-18px 0 42px rgba(60, 64, 67, 0.12)",
      }}
    >
      <Freeze frame={Math.max(0, frame - swipe)}>
        <GoogleRankingHook />
      </Freeze>
    </AbsoluteFill>
  );
};

/* -------------------------------------------------------------------------- */

export const DpaTapTikTokShort: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: G.white }}>
      {TIKTOK_SHORT_AUDIO_FRAMES.map((segment) => (
        <Sequence
          key={segment.name}
          from={segment.start}
          durationInFrames={segment.trimAfter - segment.trimBefore}
          layout="none"
          name={`Voix off — ${segment.name}`}
        >
          <Audio
            src={staticFile(TIKTOK_SHORT_AUDIO.asset)}
            trimBefore={segment.trimBefore}
            trimAfter={segment.trimAfter}
            volume={1}
          />
        </Sequence>
      ))}

      <Sequence
        from={F.hookStart}
        durationInFrames={F.hookEnd - F.hookStart}
        name="Hook Google"
      >
        <GoogleRankingHook />
      </Sequence>

      <Sequence
        from={F.criteriaStart}
        durationInFrames={F.criteriaEnd - F.criteriaStart}
        name="Critères Google"
      >
        <HorizontalSwipe
          outgoing={<FrozenHook />}
          incoming={
            <Sequence from={-SOURCE.criteriaSeek}>
              <GoogleRankingVsl />
            </Sequence>
          }
        />
      </Sequence>

      <Sequence
        from={F.frictionStart}
        durationInFrames={F.frictionEnd - F.frictionStart}
        name="Les clients oublient"
      >
        <FrictionConclusion />
      </Sequence>

      <Sequence
        from={F.plaqueVisualStart}
        durationInFrames={F.plaqueVisualEnd - F.plaqueVisualStart}
        premountFor={30}
        name="Plaque NFC + téléphone"
      >
        <HorizontalSwipe
          outgoing={<FrictionConclusionEnd />}
          incoming={<DpaTapReelBlue />}
        />
      </Sequence>

      <Sequence
        from={F.payoffStart}
        durationInFrames={F.payoffEnd - F.payoffStart}
        premountFor={30}
        name="Remontée Google"
      >
        <RankingPayoff />
      </Sequence>

      <Sequence
        from={F.ctaStart}
        durationInFrames={F.ctaEnd - F.ctaStart}
        premountFor={20}
        name="CTA DPA TAP"
      >
        <HorizontalSwipe
          outgoing={<FrozenHook />}
          incoming={<DpaSalesEndScene />}
        />
      </Sequence>
    </AbsoluteFill>
  );
};
