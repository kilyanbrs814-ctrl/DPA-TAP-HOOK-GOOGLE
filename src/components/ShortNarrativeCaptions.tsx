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

type CaptionAccent = "blue" | "green" | "red" | "yellow";
type CaptionIcon =
  | "search"
  | "steps"
  | "write"
  | "time"
  | "drop"
  | "nfc"
  | "phone"
  | "google"
  | "stars"
  | "review"
  | "ranking";

type NarrativeCaption = Caption & {
  readonly accent: CaptionAccent;
  readonly emphasis: readonly string[];
  readonly icon: CaptionIcon;
  readonly placement: "top" | "bottom";
};

/**
 * Transcription fidèle de l'extrait réellement monté dans le Short.
 * La question et le CTA ne sont pas répétés : leur texte existe déjà dans les
 * scènes. Les autres phrases sont regroupées en blocs narratifs lisibles.
 */
const CAPTIONS: readonly NarrativeCaption[] = [
  {
    text: "Habituellement, le client doit rechercher votre établissement.",
    startMs: 2520,
    endMs: 5820,
    timestampMs: null,
    confidence: null,
    accent: "blue",
    emphasis: ["rechercher", "établissement"],
    icon: "search",
    placement: "top",
  },
  {
    text: "Ouvrir votre fiche, trouver la section des avis.",
    startMs: 5870,
    endMs: 8710,
    timestampMs: null,
    confidence: null,
    accent: "blue",
    emphasis: ["fiche", "avis"],
    icon: "steps",
    placement: "top",
  },
  {
    text: "Écrire son commentaire, puis le publier.",
    startMs: 8790,
    endMs: 11200,
    timestampMs: null,
    confidence: null,
    accent: "blue",
    emphasis: ["écrire", "publier"],
    icon: "write",
    placement: "top",
  },
  {
    text: "C’est trop long.",
    startMs: 11520,
    endMs: 12480,
    timestampMs: null,
    confidence: null,
    accent: "red",
    emphasis: ["trop", "long"],
    icon: "time",
    placement: "bottom",
  },
  {
    text: "La plupart des clients oublient ou abandonnent.",
    startMs: 12720,
    endMs: 15660,
    timestampMs: null,
    confidence: null,
    accent: "red",
    emphasis: ["oublient", "abandonnent"],
    icon: "drop",
    placement: "bottom",
  },
  {
    text: "Avec une plaque connectée à votre fiche Google, un seul geste suffit.",
    startMs: 15960,
    endMs: 20190,
    timestampMs: null,
    confidence: null,
    accent: "green",
    emphasis: ["plaque", "connectée", "seul", "geste"],
    icon: "nfc",
    placement: "top",
  },
  {
    text: "Le client approche son téléphone de la plaque.",
    startMs: 20600,
    endMs: 23050,
    timestampMs: null,
    confidence: null,
    accent: "blue",
    emphasis: ["téléphone", "plaque"],
    icon: "phone",
    placement: "top",
  },
  {
    text: "Une notification NFC s’affiche et ouvre la page d’avis Google.",
    startMs: 23310,
    endMs: 27410,
    timestampMs: null,
    confidence: null,
    accent: "blue",
    emphasis: ["notification", "nfc", "avis"],
    icon: "google",
    placement: "bottom",
  },
  {
    text: "Il choisit ses étoiles et publie son avis en quelques secondes.",
    startMs: 27870,
    endMs: 31770,
    timestampMs: null,
    confidence: null,
    accent: "yellow",
    emphasis: ["étoiles", "publie", "secondes"],
    icon: "stars",
    placement: "top",
  },
  {
    text: "Chaque nouvel avis renforce votre réputation,",
    startMs: 32080,
    endMs: 34880,
    timestampMs: null,
    confidence: null,
    accent: "green",
    emphasis: ["avis", "renforce", "réputation"],
    icon: "review",
    placement: "bottom",
  },
  {
    text: "et vous aide à remonter face à vos concurrents.",
    startMs: 35020,
    endMs: 37590,
    timestampMs: null,
    confidence: null,
    accent: "green",
    emphasis: ["remonter", "concurrents"],
    icon: "ranking",
    placement: "bottom",
  },
] as const;

const ACCENT_COLORS: Record<CaptionAccent, string> = {
  blue: G.actionBlue,
  green: G.openGreen,
  red: "#D93025",
  yellow: G.starYellow,
};

const normalizeWord = (word: string) =>
  word.toLocaleLowerCase("fr").replace(/[.,!?;:’']/g, "");

const GoogleWord: React.FC = () => (
  <span style={{ whiteSpace: "nowrap" }}>
    {Array.from("Google").map((letter, index) => (
      <span key={`${letter}-${index}`} style={{ color: G.logo[index] }}>
        {letter}
      </span>
    ))}
  </span>
);

const CaptionIcon: React.FC<{
  readonly accent: CaptionAccent;
  readonly icon: CaptionIcon;
}> = ({ accent, icon }) => {
  const color = ACCENT_COLORS[accent];

  if (icon === "google") {
    return (
      <div style={{ fontSize: 34, fontWeight: 700, lineHeight: 1 }}>
        <GoogleWord />
      </div>
    );
  }

  if (icon === "stars") {
    return (
      <div style={{ display: "flex", gap: 2 }}>
        {[0, 1, 2].map((star) => (
          <svg key={star} viewBox="0 0 24 24" width={22} height={22}>
            <path
              d="M12 2.4l2.85 5.78 6.38.93-4.61 4.49 1.09 6.35L12 16.95l-5.71 3 1.09-6.35-4.61-4.49 6.38-.93z"
              fill={G.starYellow}
            />
          </svg>
        ))}
      </div>
    );
  }

  if (icon === "steps") {
    return (
      <div style={{ display: "flex", gap: 5 }}>
        {[G.logo[0], G.logo[1], G.logo[2]].map((dot, index) => (
          <div
            key={`${dot}-${index}`}
            style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: dot }}
          />
        ))}
      </div>
    );
  }

  const paths: Record<Exclude<CaptionIcon, "google" | "stars" | "steps">, string> = {
    search: "M10.8 4.2a6.6 6.6 0 104.12 11.75l4.57 4.57 1.41-1.41-4.57-4.57A6.6 6.6 0 0010.8 4.2zm0 2a4.6 4.6 0 110 9.2 4.6 4.6 0 010-9.2z",
    write: "M4 17.25V21h3.75L18.81 9.94l-3.75-3.75L4 17.25zm17.71-10.21a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z",
    time: "M12 2a10 10 0 100 20 10 10 0 000-20zm1 5h-2v6l5.1 3.05 1-1.64-4.1-2.41V7z",
    drop: "M5 11h14v2H5z",
    nfc: "M7.5 6.2a8.2 8.2 0 010 11.6l1.42 1.42a10.2 10.2 0 000-14.44L7.5 6.2zm3.2 3.2a3.68 3.68 0 010 5.2l1.42 1.42a5.68 5.68 0 000-8.04L10.7 9.4zM14 12a2 2 0 11-4 0 2 2 0 014 0z",
    phone: "M7 2h10a2 2 0 012 2v16a2 2 0 01-2 2H7a2 2 0 01-2-2V4a2 2 0 012-2zm0 3v14h10V5H7zm4 15h2v1h-2v-1z",
    review: "M12 2.4l2.85 5.78 6.38.93-4.61 4.49 1.09 6.35L12 16.95l-5.71 3 1.09-6.35-4.61-4.49 6.38-.93z",
    ranking: "M4 17l5-5 4 4 7-8v5h2V4h-9v2h5.4L13 12.2l-4-4L2.6 14.6 4 17z",
  };

  return (
    <svg viewBox="0 0 24 24" width={34} height={34}>
      <path d={paths[icon]} fill={color} />
    </svg>
  );
};

const RichCaptionText: React.FC<{
  readonly caption: NarrativeCaption;
}> = ({ caption }) => {
  const accent = ACCENT_COLORS[caption.accent];

  return (
    <div>
      {caption.text.split(/(\s+)/).map((token, index) => {
        if (/^google[.,!?;:]?$/i.test(token)) {
          const punctuation = token.replace(/^google/i, "");
          return (
            <React.Fragment key={`${token}-${index}`}>
              <GoogleWord />
              {punctuation}
            </React.Fragment>
          );
        }

        const emphasized = caption.emphasis.includes(normalizeWord(token));
        return (
          <span
            key={`${token}-${index}`}
            style={{
              color: emphasized ? accent : G.textPrimary,
              fontWeight: emphasized ? 700 : 500,
            }}
          >
            {token}
          </span>
        );
      })}
    </div>
  );
};

const NarrativeCaptionCard: React.FC<{
  readonly caption: NarrativeCaption;
  readonly durationInFrames: number;
}> = ({ caption, durationInFrames }) => {
  const frame = useCurrentFrame();
  const accent = ACCENT_COLORS[caption.accent];
  const entranceEnd = Math.min(7, Math.max(2, durationInFrames - 1));
  const exitStart = Math.max(entranceEnd, durationInFrames - 5);

  const opacity = interpolate(
    frame,
    [0, entranceEnd, exitStart, durationInFrames],
    [0, 1, 1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    },
  );

  const entrance = interpolate(frame, [0, entranceEnd], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: 64,
          right: 64,
          top: caption.placement === "top" ? 92 : undefined,
          bottom: caption.placement === "bottom" ? 116 : undefined,
          display: "flex",
          justifyContent: "center",
          opacity,
          translate: `0px ${(1 - entrance) * 22}px`,
          scale: (0.97 + entrance * 0.03).toString(),
        }}
      >
        <div
          style={{
            position: "relative",
            maxWidth: 920,
            minHeight: 106,
            boxSizing: "border-box",
            display: "flex",
            alignItems: "center",
            gap: 24,
            padding: "24px 34px 24px 28px",
            borderRadius: 28,
            border: `2px solid ${G.border}`,
            backgroundColor: "rgba(255,255,255,0.96)",
            boxShadow: "0 12px 36px rgba(32,33,36,0.14)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: 7,
              backgroundColor: accent,
            }}
          />
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: `${accent}18`,
            }}
          >
            <CaptionIcon accent={caption.accent} icon={caption.icon} />
          </div>
          <div
            style={{
              fontFamily: FONT_FAMILY,
              fontSize: caption.text.length > 62 ? 43 : 48,
              lineHeight: 1.14,
              letterSpacing: -0.6,
              textAlign: "left",
            }}
          >
            <RichCaptionText caption={caption} />
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** Couche de sous-titres narrative, sans effet sur la timeline du Short. */
export const ShortNarrativeCaptions: React.FC = () => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {CAPTIONS.map((caption) => {
        const from = Math.round((caption.startMs / 1000) * fps);
        const durationInFrames = Math.max(
          1,
          Math.round(((caption.endMs - caption.startMs) / 1000) * fps),
        );

        return (
          <Sequence
            key={`${caption.startMs}-${caption.text}`}
            from={from}
            durationInFrames={durationInFrames}
            name={`Texte voix off — ${caption.text}`}
          >
            <NarrativeCaptionCard
              caption={caption}
              durationInFrames={durationInFrames}
            />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
