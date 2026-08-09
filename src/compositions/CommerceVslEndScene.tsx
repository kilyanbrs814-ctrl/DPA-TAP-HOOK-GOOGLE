import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { FONT_FAMILY } from "../config/fonts";
import { G } from "../config/google-ui";
import { ASSETS } from "../dpa/constants";
import { GoogleRankingHook } from "./GoogleRankingHook";

const EASE = Easing.bezier(0.22, 1, 0.36, 1);

const WORDS = ["Visibilité", "Image en ligne", "Confiance"] as const;

/**
 * Conclusion dans le langage visuel de la référence : le vrai résultat Google
 * arrivé en première position, trois mots simples, puis le vrai produit et le
 * logo officiel DPA TAP. Aucun badge ou faux composant Google.
 */
export const CommerceVslEndScene: React.FC = () => {
  const frame = useCurrentFrame();
  const switchStart = 62;
  const switchEnd = 80;
  const pageX = interpolate(frame, [switchStart, switchEnd], [0, -1080], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE,
  });
  const productX = interpolate(frame, [switchStart, switchEnd], [1080, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE,
  });
  const productOpacity = interpolate(frame, [switchStart + 3, switchEnd], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: G.white,
        fontFamily: FONT_FAMILY,
        overflow: "hidden",
      }}
    >
      <AbsoluteFill style={{ translate: `${pageX}px 0px` }}>
        <Sequence from={-119}>
          <GoogleRankingHook />
        </Sequence>

        <div
          style={{
            position: "absolute",
            left: 48,
            right: 48,
            bottom: 64,
            height: 112,
            backgroundColor: "rgba(255,255,255,0.96)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 38,
            borderTop: `1px solid ${G.border}`,
            zIndex: 10,
          }}
        >
          {WORDS.map((word, index) => {
            const progress = interpolate(
              frame,
              [index * 8, index * 8 + 12],
              [0, 1],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: EASE,
              },
            );

            return (
              <React.Fragment key={word}>
                {index > 0 ? (
                  <div
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      backgroundColor: G.textTertiary,
                      opacity: progress,
                    }}
                  />
                ) : null}
                <div
                  style={{
                    fontSize: 31,
                    fontWeight: 500,
                    color: index === 0 ? G.actionBlue : G.textPrimary,
                    opacity: progress,
                    translate: `0px ${(1 - progress) * 14}px`,
                    whiteSpace: "nowrap",
                  }}
                >
                  {word}
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          translate: `${productX}px 0px`,
          opacity: productOpacity,
          backgroundColor: G.white,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 176,
            left: 0,
            right: 0,
            textAlign: "center",
            fontSize: 56,
            fontWeight: 500,
            letterSpacing: -1.6,
            color: G.textPrimary,
          }}
        >
          Découvrez
        </div>

        <Img
          src={staticFile(ASSETS.plaqueBluePng)}
          style={{
            position: "absolute",
            left: 130,
            top: 410,
            width: 820,
            height: 820,
            objectFit: "contain",
            maxWidth: "none",
          }}
        />

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
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
