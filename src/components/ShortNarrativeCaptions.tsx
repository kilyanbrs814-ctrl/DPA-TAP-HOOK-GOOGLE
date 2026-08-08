import React from "react";
import type { Caption } from "@remotion/captions";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { FONT_FAMILY } from "../config/fonts";
import { G } from "../config/google-ui";
import { StarsRating } from "./StarsRating";

/** Seul texte ajouté au Short : la phrase de rupture de la voix off. */
const TOO_LONG_CAPTION: Caption = {
  text: "C’est trop long.",
  startMs: 11520,
  endMs: 12480,
  timestampMs: null,
  confidence: null,
};

const AnimatedPart: React.FC<{
  readonly children: React.ReactNode;
  readonly revealFrame: number;
}> = ({ children, revealFrame }) => {
  const frame = useCurrentFrame();

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        opacity: interpolate(frame, [revealFrame, revealFrame + 5], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        }),
        translate: `0px ${interpolate(frame, [revealFrame, revealFrame + 7], [24, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        })}px`,
        scale: interpolate(frame, [revealFrame, revealFrame + 7], [0.9, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        }),
      }}
    >
      {children}
    </span>
  );
};


/**
 * Question d’ouverture du Short, calée sur les attaques mesurées de la voix :
 * Comment f0 · obtenir f14 · plus f25 · d’avis f33 · Google f45 · ? f56.
 */
export const OpeningQuestionWordByWord: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: G.white,
        opacity: interpolate(frame, [63, 75], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.inOut(Easing.cubic),
        }),
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: FONT_FAMILY,
      pointerEvents: "none",
    }}
  >
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingLeft: 70,
        paddingRight: 70,
        boxSizing: "border-box",
        textAlign: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 22,
          fontSize: 80,
          fontWeight: 400,
          color: G.textPrimary,
          lineHeight: 1.18,
          whiteSpace: "nowrap",
        }}
      >
        <AnimatedPart revealFrame={0}>Comment</AnimatedPart>
        <AnimatedPart revealFrame={14}>obtenir</AnimatedPart>
      </div>

      <div
        style={{
          marginTop: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 20,
          fontSize: 88,
          fontWeight: 700,
          color: G.textPrimary,
          lineHeight: 1.18,
          whiteSpace: "nowrap",
        }}
      >
        <AnimatedPart revealFrame={25}>plus</AnimatedPart>
        <AnimatedPart revealFrame={33}>d’avis</AnimatedPart>
        <AnimatedPart revealFrame={45}>
          <span style={{ display: "inline-flex" }}>
            {Array.from("Google").map((letter, index) => (
              <span key={letter + index} style={{ color: G.logo[index] }}>
                {letter}
              </span>
            ))}
          </span>
        </AnimatedPart>
        <AnimatedPart revealFrame={56}>?</AnimatedPart>
      </div>

      <div style={{ marginTop: 48 }}>
        <AnimatedPart revealFrame={58}>
          <StarsRating
            progress={5}
            size={40}
            gap={6}
            idPrefix="short-question-stars"
          />
        </AnimatedPart>
      </div>
      </div>
    </AbsoluteFill>
  );
};

const TooLongPhrase: React.FC<{ readonly durationInFrames: number }> = ({
  durationInFrames,
}) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: 58,
          right: 58,
          top: 400,
          display: "flex",
          justifyContent: "center",
          opacity: interpolate(
            frame,
            [Math.max(0, durationInFrames - 6), durationInFrames],
            [1, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          ),
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 18,
            fontFamily: FONT_FAMILY,
            fontSize: 58,
            lineHeight: 1.1,
            letterSpacing: -0.8,
            textAlign: "center",
          }}
        >
          <AnimatedPart revealFrame={0}>
            <span
              style={{
                color: G.textPrimary,
                fontWeight: 700,
                textShadow: "0 2px 0 #fff, 0 0 12px #fff, 0 0 24px #fff",
              }}
            >
              C’est
            </span>
          </AnimatedPart>

          <AnimatedPart revealFrame={7}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 12,
                minHeight: 72,
                boxSizing: "border-box",
                padding: "12px 20px",
                border: "2px solid #F4C7C3",
                borderRadius: 22,
                backgroundColor: "rgba(255,255,255,0.98)",
                boxShadow: "0 8px 24px rgba(32,33,36,0.13)",
                color: "#D93025",
                fontSize: 42,
                fontWeight: 800,
                whiteSpace: "nowrap",
              }}
            >
              <svg viewBox="0 0 24 24" width={42} height={42}>
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                  fill="#FCE8E6"
                  stroke="#D93025"
                  strokeWidth="2"
                />
                <path
                  d="M12 6.8v5.6l4 2.3"
                  fill="none"
                  stroke="#D93025"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              </svg>
              trop long.
            </span>
          </AnimatedPart>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** Couche minimale : aucun autre texte n'est superposé aux scènes. */
export const ShortNarrativeCaptions: React.FC = () => {
  const { fps } = useVideoConfig();
  const from = Math.round((TOO_LONG_CAPTION.startMs / 1000) * fps);
  const durationInFrames = Math.max(
    1,
    Math.round(
      ((TOO_LONG_CAPTION.endMs - TOO_LONG_CAPTION.startMs) / 1000) * fps,
    ),
  );

  return (
    <Sequence
      from={from}
      durationInFrames={durationInFrames}
      name="Phrase animée — C’est trop long."
    >
      <TooLongPhrase durationInFrames={durationInFrames} />
    </Sequence>
  );
};
