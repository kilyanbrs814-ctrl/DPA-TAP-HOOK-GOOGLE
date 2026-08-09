import React from "react";
import {
  AbsoluteFill,
  Easing,
  Freeze,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { GoogleSearchBar } from "../components/GoogleSearchBar";
import { StarsRating } from "../components/StarsRating";
import { FONT_FAMILY } from "../config/fonts";
import { COMMERCE_VSL } from "../config/commerceVsl";
import { G } from "../config/google-ui";
import { GoogleRankingHook } from "./GoogleRankingHook";

const ease = Easing.bezier(0.22, 1, 0.36, 1);

const inOut = (frame: number, enter: number, hold: number, exit: number) =>
  interpolate(frame, [enter, enter + 12, hold, exit], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });

const SearchStat: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({
    frame,
    fps,
    config: { damping: 200, mass: 0.9, stiffness: 90 },
    durationInFrames: 28,
  });
  const opacity = inOut(frame, 0, 142, 158);
  const typed = Math.round(
    interpolate(frame, [12, 45], [0, "commerce local".length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    }),
  );
  const query = "commerce local".slice(0, typed);

  return (
    <AbsoluteFill style={{ opacity, fontFamily: FONT_FAMILY }}>
      <div
        style={{
          position: "absolute",
          left: 64,
          right: 64,
          top: 92,
          transform: `translateY(${(1 - enter) * 28}px)`,
        }}
      >
        <GoogleSearchBar query={query} />
      </div>

      <div
        style={{
          position: "absolute",
          left: 80,
          right: 80,
          top: 520,
          textAlign: "center",
          color: G.textPrimary,
        }}
      >
        <div
          style={{
            fontSize: 270,
            lineHeight: 0.95,
            fontWeight: 700,
            letterSpacing: -18,
            color: G.actionBlue,
            transform: `scale(${0.88 + enter * 0.12})`,
          }}
        >
          9<span style={{ fontSize: 150, letterSpacing: -8 }}>/10</span>
        </div>
        <div
          style={{
            marginTop: 54,
            fontSize: 58,
            lineHeight: 1.16,
            fontWeight: 500,
            letterSpacing: -1.8,
          }}
        >
          recherches de commerces locaux
          <br />
          <span style={{ color: G.textSecondary, fontWeight: 400 }}>
            se font sur Google
          </span>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 150,
          right: 150,
          bottom: 196,
          height: 8,
          borderRadius: 999,
          backgroundColor: "#E8EAED",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${interpolate(frame, [18, 132], [0, 90], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.inOut(Easing.cubic),
            })}%`,
            borderRadius: 999,
            background:
              "linear-gradient(90deg, #4285F4 0 35%, #EA4335 35% 55%, #FBBC05 55% 75%, #34A853 75%)",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

const ChoiceScene: React.FC = () => {
  const frame = useCurrentFrame();
  const local = frame - COMMERCE_VSL.beats.questionStart;
  const opacity = inOut(
    frame,
    COMMERCE_VSL.beats.questionStart - 8,
    COMMERCE_VSL.beats.rankingStart - 18,
    COMMERCE_VSL.beats.rankingStart,
  );
  const progress = interpolate(local, [8, 34], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });

  const cards = [
    { name: "Votre commerce", rating: 4.2, reviews: 18, owner: true },
    { name: "Commerce concurrent", rating: 4.8, reviews: 347, owner: false },
  ];

  return (
    <AbsoluteFill style={{ opacity, fontFamily: FONT_FAMILY }}>
      <div style={{ position: "absolute", left: 64, right: 64, top: 92 }}>
        <GoogleSearchBar query="votre activité à proximité" />
      </div>
      <div
        style={{
          position: "absolute",
          top: 430,
          left: 80,
          right: 80,
          textAlign: "center",
          fontSize: 66,
          lineHeight: 1.13,
          fontWeight: 500,
          letterSpacing: -2.4,
          color: G.textPrimary,
        }}
      >
        Qui apparaît en premier&nbsp;?
      </div>

      <div style={{ position: "absolute", left: 64, right: 64, top: 650 }}>
        {cards.map((card, index) => {
          const delay = index * 10;
          const cardIn = interpolate(local, [delay, delay + 24], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: ease,
          });
          return (
            <div
              key={card.name}
              style={{
                height: 300,
                marginBottom: 30,
                borderRadius: 30,
                border: `2px solid ${card.owner ? G.border : G.actionBlue}`,
                backgroundColor: G.white,
                boxShadow: card.owner
                  ? "0 10px 30px rgba(32,33,36,0.06)"
                  : "0 18px 48px rgba(26,115,232,0.16)",
                padding: "42px 44px",
                boxSizing: "border-box",
                opacity: cardIn,
                transform: `translateY(${(1 - cardIn) * 34}px) scale(${0.97 + cardIn * 0.03})`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                <div
                  style={{
                    width: 92,
                    height: 92,
                    borderRadius: 24,
                    backgroundColor: card.owner ? "#F1F3F4" : "#E8F0FE",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: card.owner ? G.textSecondary : G.actionBlue,
                    fontSize: 44,
                    fontWeight: 700,
                  }}
                >
                  {card.owner ? "V" : "1"}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 44, fontWeight: 500, color: G.textPrimary }}>
                    {card.name}
                  </div>
                  <div style={{ marginTop: 17, display: "flex", alignItems: "center", gap: 16 }}>
                    <span style={{ fontSize: 34, color: G.textSecondary }}>
                      {String(card.rating).replace(".", ",")}
                    </span>
                    <StarsRating
                      progress={card.rating}
                      size={32}
                      gap={5}
                      idPrefix={`commerce-choice-${index}`}
                    />
                    <span style={{ fontSize: 30, color: G.textSecondary }}>
                      ({card.reviews})
                    </span>
                  </div>
                </div>
                <div
                  style={{
                    fontSize: 34,
                    fontWeight: 700,
                    color: card.owner ? G.textSecondary : G.actionBlue,
                    transform: `translateX(${card.owner ? 0 : (1 - progress) * 18}px)`,
                  }}
                >
                  {card.owner ? "2e" : "1er"}
                </div>
              </div>
              <div
                style={{
                  marginTop: 34,
                  height: 62,
                  borderRadius: 31,
                  backgroundColor: card.owner ? "#F8F9FA" : "#E8F0FE",
                  color: card.owner ? G.textSecondary : G.actionBlue,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 29,
                  fontWeight: 500,
                }}
              >
                {card.owner ? "Moins visible" : "Vu en premier"}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const CommerceGoogleIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const rankingFrame = frame - COMMERCE_VSL.beats.rankingStart;
  const rankingOpacity = interpolate(
    frame,
    [COMMERCE_VSL.beats.rankingStart - 8, COMMERCE_VSL.beats.rankingStart + 8],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease },
  );

  return (
    <AbsoluteFill style={{ backgroundColor: G.white, overflow: "hidden" }}>
      <SearchStat />
      <ChoiceScene />
      {frame >= COMMERCE_VSL.beats.rankingStart - 8 ? (
        <AbsoluteFill style={{ opacity: rankingOpacity }}>
          <Freeze frame={Math.max(0, Math.min(119, rankingFrame))}>
            <GoogleRankingHook />
          </Freeze>
          <div
            style={{
              position: "absolute",
              left: 64,
              right: 64,
              bottom: 82,
              borderRadius: 28,
              padding: "27px 32px",
              backgroundColor: "rgba(255,255,255,0.94)",
              boxShadow: "0 14px 40px rgba(32,33,36,0.14)",
              fontFamily: FONT_FAMILY,
              fontSize: 40,
              lineHeight: 1.2,
              fontWeight: 500,
              textAlign: "center",
              color: G.textPrimary,
            }}
          >
            Plus d’avis. Une meilleure note.
            <br />
            <span style={{ color: G.actionBlue }}>Une fiche qui remonte.</span>
          </div>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
