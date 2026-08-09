import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { FONT_FAMILY } from "../config/fonts";
import { G } from "../config/google-ui";
import { ASSETS } from "../dpa/constants";

const benefits = [
  { label: "Visibilité", color: "#4285F4" },
  { label: "Image en ligne", color: "#34A853" },
  { label: "Confiance", color: "#FBBC05" },
] as const;

const reveal = (frame: number, from: number, to: number) =>
  interpolate(frame, [from, to], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

export const CommerceVslEndScene: React.FC = () => {
  const frame = useCurrentFrame();
  const product = reveal(frame, 0, 18);
  const logo = reveal(frame, 72, 92);

  return (
    <AbsoluteFill style={{ backgroundColor: G.white, fontFamily: FONT_FAMILY }}>
      <div
        style={{
          position: "absolute",
          left: 70,
          top: 118,
          width: 940,
          textAlign: "center",
          fontSize: 66,
          lineHeight: 1.12,
          fontWeight: 500,
          letterSpacing: -2.4,
          color: G.textPrimary,
          opacity: product,
          transform: `translateY(${(1 - product) * 24}px)`,
        }}
      >
        Faites de vos clients satisfaits
        <br />
        <span style={{ color: G.actionBlue }}>votre meilleur classement.</span>
      </div>

      <Img
        src={staticFile(ASSETS.plaqueBluePng)}
        style={{
          position: "absolute",
          width: 670,
          height: 670,
          objectFit: "contain",
          left: 205,
          top: 430,
          opacity: product,
          transform: `translateY(${(1 - product) * 34}px) scale(${0.94 + product * 0.06})`,
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 70,
          right: 70,
          top: 1160,
          display: "flex",
          gap: 18,
        }}
      >
        {benefits.map((benefit, index) => {
          const p = reveal(frame, 22 + index * 8, 36 + index * 8);
          return (
            <div
              key={benefit.label}
              style={{
                flex: 1,
                height: 112,
                borderRadius: 24,
                border: `2px solid ${benefit.color}38`,
                backgroundColor: `${benefit.color}12`,
                color: benefit.color === "#FBBC05" ? "#9A6B00" : benefit.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                fontSize: 29,
                fontWeight: 500,
                opacity: p,
                transform: `translateY(${(1 - p) * 18}px)`,
              }}
            >
              {benefit.label}
            </div>
          );
        })}
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 1450,
          textAlign: "center",
          fontSize: 44,
          fontWeight: 500,
          color: G.textPrimary,
          opacity: logo,
          transform: `translateY(${(1 - logo) * 18}px)`,
        }}
      >
        Découvrez
      </div>
      <Img
        src={staticFile(ASSETS.logo)}
        style={{
          position: "absolute",
          left: 190,
          top: 1390,
          width: 700,
          height: 467,
          objectFit: "contain",
          opacity: logo,
          transform: `translateY(${(1 - logo) * 18}px)`,
        }}
      />
    </AbsoluteFill>
  );
};
