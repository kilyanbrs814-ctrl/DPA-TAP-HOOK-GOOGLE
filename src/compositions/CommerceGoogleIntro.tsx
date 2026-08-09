import React from "react";
import {
  AbsoluteFill,
  Easing,
  Freeze,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { GoogleSearchBar } from "../components/GoogleSearchBar";
import { COMMERCE_VSL } from "../config/commerceVsl";
import { FONT_FAMILY } from "../config/fonts";
import { G } from "../config/google-ui";
import { GoogleRankingHook } from "./GoogleRankingHook";

const EASE = Easing.bezier(0.22, 1, 0.36, 1);

const fade = (
  frame: number,
  enterStart: number,
  enterEnd: number,
  exitStart: number,
  exitEnd: number,
) =>
  interpolate(
    frame,
    [enterStart, enterEnd, exitStart, exitEnd],
    [0, 1, 1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: EASE,
    },
  );

/**
 * Ouverture minimaliste inspirée de la référence Apple : typographie courte,
 * puis un vrai en-tête Google. Aucun faux résultat ni fausse carte marketing.
 */
const GoogleSearchOpening: React.FC = () => {
  const frame = useCurrentFrame();
  const questionStart = COMMERCE_VSL.beats.questionStart;
  const opacity = fade(frame, 0, 10, questionStart - 12, questionStart);
  const query = "commerce à proximité";
  const typedLength = Math.round(
    interpolate(frame, [24, 68], [0, query.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    }),
  );
  const statistic = interpolate(frame, [64, 82], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE,
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: G.white,
        fontFamily: FONT_FAMILY,
        opacity,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 170,
          left: 64,
          right: 64,
          opacity: interpolate(frame, [16, 30], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: `0px ${interpolate(frame, [16, 34], [24, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: EASE,
          })}px`,
        }}
      >
        <GoogleSearchBar query={query.slice(0, typedLength)} />
      </div>

      <div
        style={{
          position: "absolute",
          top: 690,
          left: 70,
          right: 70,
          color: G.textPrimary,
          textAlign: "center",
          opacity: statistic,
          scale: interpolate(statistic, [0, 1], [0.94, 1], {
            output: "perceptual-scale",
          }),
        }}
      >
        <div
          style={{
            fontSize: 230,
            lineHeight: 0.9,
            fontWeight: 500,
            letterSpacing: -14,
          }}
        >
          9<span style={{ fontSize: 132, letterSpacing: -6 }}>/10</span>
        </div>
        <div
          style={{
            marginTop: 58,
            fontSize: 53,
            lineHeight: 1.18,
            fontWeight: 400,
            letterSpacing: -1.5,
          }}
        >
          recherches de commerces locaux
          <br />
          <span style={{ color: G.actionBlue, fontWeight: 500 }}>
            se font sur Google
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/**
 * La question est racontée uniquement avec la vraie page de résultats locaux
 * du projet. La caméra descend jusqu'à « Votre établissement », classé 4e,
 * puis revient au sommet avant la remontée : aucun composant inventé.
 */
const GenuineGoogleStory: React.FC = () => {
  const frame = useCurrentFrame();
  const start = COMMERCE_VSL.beats.questionStart;
  const rankingStart = COMMERCE_VSL.beats.rankingStart;
  const local = frame - start;
  const questionDuration = rankingStart - start;
  const opacity = interpolate(frame, [start - 8, start + 4], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE,
  });
  const pageY = interpolate(
    local,
    [0, 22, 62, questionDuration - 38, questionDuration],
    [0, 0, -640, -640, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.cubic),
    },
  );
  const hookFrame =
    frame < rankingStart ? 0 : Math.min(119, frame - rankingStart);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: G.white,
        opacity,
        overflow: "hidden",
      }}
    >
      <AbsoluteFill style={{ translate: `0px ${pageY}px` }}>
        <Freeze frame={hookFrame}>
          <GoogleRankingHook />
        </Freeze>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const CommerceGoogleIntro: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ backgroundColor: G.white }}>
      <GoogleSearchOpening />
      {frame >= COMMERCE_VSL.beats.questionStart - 8 ? (
        <GenuineGoogleStory />
      ) : null}
    </AbsoluteFill>
  );
};
