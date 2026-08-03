import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { COLORS } from "./constants";

const WAVE_COUNT = 3;
const WAVE_LIFETIME = 24;
const WAVE_STAGGER = 6;

/**
 * Three clean NFC rings, emitted from the point where the phone meets the
 * plaque. Purely frame-driven so every ring is identical on every render.
 */
export const NfcWaves: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly startFrame: number;
}> = ({ x, y, startFrame }) => {
  const frame = useCurrentFrame();

  return (
    <>
      {new Array(WAVE_COUNT).fill(true).map((_, index) => {
        const local = frame - startFrame - index * WAVE_STAGGER;
        if (local < 0 || local > WAVE_LIFETIME) {
          return null;
        }
        return (
          <div
            key={index}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: 300,
              height: 300,
              marginLeft: -150,
              marginTop: -150,
              borderRadius: "50%",
              border: `5px solid ${COLORS.googleBlueSoft}`,
              boxShadow: `0 0 34px rgba(138,180,248,0.45)`,
              opacity: interpolate(
                local,
                [0, 3, WAVE_LIFETIME * 0.6, WAVE_LIFETIME],
                [0, 0.85, 0.42, 0],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
              ),
              scale: interpolate(local, [0, WAVE_LIFETIME], [0.32, 2.6], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.out(Easing.quad),
                output: "perceptual-scale",
              }),
            }}
          />
        );
      })}
    </>
  );
};

/**
 * Discreet pressure circle used to show a finger tap without drawing a hand.
 */
export const TapRing: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly startFrame: number;
  readonly size?: number;
}> = ({ x, y, startFrame, size = 150 }) => {
  const frame = useCurrentFrame();
  const local = frame - startFrame;

  if (local < 0 || local > 16) {
    return null;
  }

  return (
    <>
      <div
        style={{
          position: "absolute",
          left: x,
          top: y,
          width: size,
          height: size,
          marginLeft: -size / 2,
          marginTop: -size / 2,
          borderRadius: "50%",
          backgroundColor: "rgba(255,255,255,0.10)",
          opacity: interpolate(local, [0, 2, 10, 16], [0, 1, 0.4, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          scale: interpolate(local, [0, 16], [0.45, 1.35], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.cubic),
            output: "perceptual-scale",
          }),
        }}
      />
      <div
        style={{
          position: "absolute",
          left: x,
          top: y,
          width: size * 0.42,
          height: size * 0.42,
          marginLeft: (-size * 0.42) / 2,
          marginTop: (-size * 0.42) / 2,
          borderRadius: "50%",
          backgroundColor: "rgba(255,255,255,0.85)",
          opacity: interpolate(local, [0, 2, 8, 13], [0, 0.55, 0.2, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          scale: interpolate(local, [0, 13], [0.6, 1.1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            output: "perceptual-scale",
          }),
        }}
      />
    </>
  );
};
