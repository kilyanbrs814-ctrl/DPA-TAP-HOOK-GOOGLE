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
          bottom: 104,
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
