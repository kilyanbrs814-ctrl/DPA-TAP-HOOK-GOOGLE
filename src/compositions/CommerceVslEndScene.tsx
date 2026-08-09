import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { FONT_FAMILY } from "../config/fonts";
import { G } from "../config/google-ui";
import { ASSETS } from "../dpa/constants";

const WORDS = ["Visibilité", "Image en ligne", "Confiance"] as const;

const reveal = (frame: number, from: number, to: number) =>
  interpolate(frame, [from, to], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

const PLAQUE_SOURCE = {
  black: {
    canvas: 430,
    bodyWidth: 430,
    bodyHeight: 430,
    bodyCenterX: 215,
    bodyCenterY: 215,
  },
  blue: {
    canvas: 1024,
    bodyWidth: 750,
    bodyHeight: 693,
    bodyCenterX: 511,
    bodyCenterY: 497.5,
  },
} as const;

const PLAQUE_FRAME = {
  width: 368,
  height: 350,
  radius: 24,
  centerY: 720,
} as const;

const plaqueArtworkLayout = (
  source: (typeof PLAQUE_SOURCE)[keyof typeof PLAQUE_SOURCE],
) => {
  const width = (PLAQUE_FRAME.width * source.canvas) / source.bodyWidth;
  const height = (PLAQUE_FRAME.height * source.canvas) / source.bodyHeight;
  const scaleX = width / source.canvas;
  const scaleY = height / source.canvas;

  return {
    width,
    height,
    left: PLAQUE_FRAME.width / 2 - source.bodyCenterX * scaleX,
    top: PLAQUE_FRAME.height / 2 - source.bodyCenterY * scaleY,
  };
};

const PLAQUES = [
  {
    key: "black",
    asset: ASSETS.plaqueBlackPng,
    centerX: 332,
    artwork: plaqueArtworkLayout(PLAQUE_SOURCE.black),
  },
  {
    key: "blue",
    asset: ASSETS.plaqueBluePng,
    centerX: 748,
    artwork: plaqueArtworkLayout(PLAQUE_SOURCE.blue),
  },
] as const;

export const CommerceVslEndScene: React.FC = () => {
  const frame = useCurrentFrame();
  const titleProgress = reveal(frame, 0, 10);
  const plaqueProgress = reveal(frame, 5, 20);
  const logoProgress = reveal(frame, 28, 42);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: G.white,
        fontFamily: FONT_FAMILY,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 178,
          left: 0,
          right: 0,
          textAlign: "center",
          fontSize: 56,
          fontWeight: 500,
          letterSpacing: -1.6,
          color: G.textPrimary,
          opacity: titleProgress,
          translate: `0px ${(1 - titleProgress) * 22}px`,
        }}
      >
        Découvrez
      </div>

      {PLAQUES.map((plaque) => (
        <div
          key={plaque.key}
          style={{
            position: "absolute",
            left: plaque.centerX - PLAQUE_FRAME.width / 2,
            top: PLAQUE_FRAME.centerY - PLAQUE_FRAME.height / 2,
            width: PLAQUE_FRAME.width,
            height: PLAQUE_FRAME.height,
            borderRadius: PLAQUE_FRAME.radius,
            overflow: "hidden",
            opacity: plaqueProgress,
            translate: `0px ${(1 - plaqueProgress) * 28}px`,
            scale: interpolate(plaqueProgress, [0, 1], [0.94, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              output: "perceptual-scale",
            }),
          }}
        >
          <Img
            src={staticFile(plaque.asset)}
            style={{
              position: "absolute",
              left: plaque.artwork.left,
              top: plaque.artwork.top,
              width: plaque.artwork.width,
              height: plaque.artwork.height,
              maxWidth: "none",
            }}
          />
        </div>
      ))}

      <div
        style={{
          position: "absolute",
          top: 1060,
          left: 48,
          right: 48,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 26,
        }}
      >
        {WORDS.map((word, index) => {
          const progress = reveal(frame, 16 + index * 4, 28 + index * 4);

          return (
            <React.Fragment key={word}>
              {index > 0 ? (
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    backgroundColor: G.textTertiary,
                    opacity: progress,
                  }}
                />
              ) : null}
              <div
                style={{
                  fontSize: 46,
                  fontWeight: 650,
                  letterSpacing: -0.7,
                  color: index === 0 ? G.actionBlue : G.textPrimary,
                  opacity: progress,
                  translate: `0px ${(1 - progress) * 24}px`,
                  whiteSpace: "nowrap",
                }}
              >
                {word}
              </div>
            </React.Fragment>
          );
        })}
      </div>

      <Img
        src={staticFile(ASSETS.logo)}
        style={{
          position: "absolute",
          left: 150,
          top: 1260,
          width: 780,
          height: 520,
          objectFit: "contain",
          maxWidth: "none",
          opacity: logoProgress,
          translate: `0px ${(1 - logoProgress) * 20}px`,
        }}
      />
    </AbsoluteFill>
  );
};
