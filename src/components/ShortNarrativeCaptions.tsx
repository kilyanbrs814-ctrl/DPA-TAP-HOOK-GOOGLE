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

type VisualKind =
  | "search"
  | "business"
  | "reviews"
  | "comment"
  | "publish"
  | "clock"
  | "plaque"
  | "phone"
  | "notification"
  | "reviewPage"
  | "stars"
  | "reputation"
  | "ranking";

type PhrasePart =
  | {
      readonly kind: "text";
      readonly text: string;
      readonly color?: string;
      readonly weight?: number;
    }
  | {
      readonly kind: "visual";
      readonly visual: VisualKind;
    };

type NarrativePhrase = Caption & {
  readonly parts: readonly PhrasePart[];
  readonly placement: "top" | "bottom";
};

const text = (
  value: string,
  options?: { readonly color?: string; readonly weight?: number },
): PhrasePart => ({ kind: "text", text: value, ...options });

const visual = (kind: VisualKind): PhrasePart => ({ kind: "visual", visual: kind });

/**
 * Les textes restent fidèles à la voix off. Les mots remplacés visuellement
 * sont conservés dans `text`, la valeur officielle du Caption.
 */
const PHRASES: readonly NarrativePhrase[] = [
  {
    text: "Habituellement, le client doit rechercher votre établissement.",
    startMs: 2520,
    endMs: 5820,
    timestampMs: null,
    confidence: null,
    placement: "top",
    parts: [
      text("Habituellement, le client doit"),
      visual("search"),
      text("votre établissement.", { weight: 700 }),
    ],
  },
  {
    text: "Ouvrir votre fiche, trouver la section des avis.",
    startMs: 5870,
    endMs: 8710,
    timestampMs: null,
    confidence: null,
    placement: "top",
    parts: [text("Ouvrir"), visual("business"), text("trouver la section des"), visual("reviews")],
  },
  {
    text: "Écrire son commentaire, puis le publier.",
    startMs: 8790,
    endMs: 11200,
    timestampMs: null,
    confidence: null,
    placement: "top",
    parts: [text("Écrire son"), visual("comment"), text("puis le"), visual("publish")],
  },
  {
    text: "C’est trop long.",
    startMs: 11520,
    endMs: 12480,
    timestampMs: null,
    confidence: null,
    placement: "bottom",
    parts: [text("C’est", { weight: 700 }), visual("clock")],
  },
  {
    text: "La plupart des clients oublient ou abandonnent.",
    startMs: 12720,
    endMs: 15660,
    timestampMs: null,
    confidence: null,
    placement: "bottom",
    parts: [
      text("La plupart des clients"),
      text("oublient", { color: "#D93025", weight: 700 }),
      text("ou"),
      text("abandonnent.", { color: "#D93025", weight: 700 }),
    ],
  },
  {
    text: "Avec une plaque connectée à votre fiche Google, un seul geste suffit.",
    startMs: 15960,
    endMs: 20190,
    timestampMs: null,
    confidence: null,
    placement: "top",
    parts: [
      text("Avec une"),
      visual("plaque"),
      text("connectée à votre"),
      visual("business"),
      text("un seul geste suffit.", { color: G.openGreen, weight: 700 }),
    ],
  },
  {
    text: "Le client approche son téléphone de la plaque.",
    startMs: 20600,
    endMs: 23050,
    timestampMs: null,
    confidence: null,
    placement: "top",
    parts: [text("Le client approche son"), visual("phone"), text("de la"), visual("plaque")],
  },
  {
    text: "Une notification NFC s’affiche et ouvre la page d’avis Google.",
    startMs: 23310,
    endMs: 27410,
    timestampMs: null,
    confidence: null,
    placement: "bottom",
    parts: [
      text("Une"),
      visual("notification"),
      text("s’affiche et ouvre la"),
      visual("reviewPage"),
    ],
  },
  {
    text: "Il choisit ses étoiles et publie son avis en quelques secondes.",
    startMs: 27870,
    endMs: 31770,
    timestampMs: null,
    confidence: null,
    placement: "top",
    parts: [
      text("Il choisit ses"),
      visual("stars"),
      text("et"),
      visual("publish"),
      text("son avis en quelques secondes."),
    ],
  },
  {
    text: "Chaque nouvel avis renforce votre réputation,",
    startMs: 32080,
    endMs: 34880,
    timestampMs: null,
    confidence: null,
    placement: "bottom",
    parts: [text("Chaque nouvel"), visual("reviews"), text("renforce votre"), visual("reputation")],
  },
  {
    text: "et vous aide à remonter face à vos concurrents.",
    startMs: 35020,
    endMs: 37590,
    timestampMs: null,
    confidence: null,
    placement: "bottom",
    parts: [text("et vous aide à"), visual("ranking"), text("face à vos concurrents.")],
  },
] as const;

const GoogleLogo: React.FC<{ readonly size?: number }> = ({ size = 34 }) => (
  <span style={{ display: "inline-flex", fontSize: size, fontWeight: 700, lineHeight: 1 }}>
    {Array.from("Google").map((letter, index) => (
      <span key={`${letter}-${index}`} style={{ color: G.logo[index] }}>
        {letter}
      </span>
    ))}
  </span>
);

const Magnifier: React.FC<{ readonly size?: number }> = ({ size = 34 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size}>
    <circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke={G.actionBlue} strokeWidth="2.3" />
    <path d="M15.4 15.4L21 21" fill="none" stroke={G.actionBlue} strokeWidth="2.3" strokeLinecap="round" />
  </svg>
);

const Stars: React.FC<{ readonly count?: number; readonly size?: number }> = ({
  count = 5,
  size = 25,
}) => (
  <span style={{ display: "inline-flex", gap: 2 }}>
    {Array.from({ length: count }).map((_, index) => (
      <svg key={index} viewBox="0 0 24 24" width={size} height={size}>
        <path
          d="M12 2.5l2.86 5.79 6.39.93-4.62 4.5 1.09 6.36L12 17.07l-5.72 3.01 1.09-6.36-4.62-4.5 6.39-.93z"
          fill={G.starYellow}
        />
      </svg>
    ))}
  </span>
);

const chipStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  minHeight: 72,
  boxSizing: "border-box",
  padding: "12px 20px",
  border: `2px solid ${G.border}`,
  borderRadius: 22,
  backgroundColor: "rgba(255,255,255,0.98)",
  boxShadow: "0 8px 24px rgba(32,33,36,0.13)",
  color: G.textPrimary,
  fontSize: 35,
  fontWeight: 600,
  whiteSpace: "nowrap",
};

const VisualWord: React.FC<{ readonly kind: VisualKind }> = ({ kind }) => {
  if (kind === "search") {
    return (
      <span style={{ ...chipStyle, minWidth: 330, borderRadius: 40, justifyContent: "flex-start" }}>
        <GoogleLogo size={27} />
        <span style={{ flex: 1, color: G.textSecondary, fontWeight: 400 }}>Rechercher</span>
        <Magnifier size={30} />
      </span>
    );
  }

  if (kind === "business") {
    return (
      <span style={chipStyle}>
        <span
          style={{
            width: 42,
            height: 42,
            borderRadius: 21,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: G.openGreen,
            color: G.white,
            fontSize: 24,
          }}
        >
          L
        </span>
        <span>votre fiche</span>
        <GoogleLogo size={27} />
      </span>
    );
  }

  if (kind === "reviews") {
    return (
      <span style={chipStyle}>
        <span style={{ fontWeight: 700 }}>avis</span>
        <Stars size={22} />
      </span>
    );
  }

  if (kind === "comment") {
    return (
      <span style={{ ...chipStyle, padding: "12px 18px" }}>
        <svg viewBox="0 0 64 44" width={64} height={44}>
          <rect x="2" y="2" width="60" height="34" rx="9" fill={G.white} stroke={G.actionBlue} strokeWidth="3" />
          <path d="M16 36l-3 7 12-7" fill={G.white} stroke={G.actionBlue} strokeWidth="3" strokeLinejoin="round" />
          <path d="M14 13h36M14 22h27" stroke={G.border} strokeWidth="4" strokeLinecap="round" />
        </svg>
        <span>commentaire</span>
      </span>
    );
  }

  if (kind === "publish") {
    return (
      <span
        style={{
          ...chipStyle,
          minHeight: 68,
          borderColor: G.actionBlue,
          backgroundColor: G.actionBlue,
          color: G.white,
          borderRadius: 18,
          fontWeight: 700,
        }}
      >
        Publier
      </span>
    );
  }

  if (kind === "clock") {
    return (
      <span style={{ ...chipStyle, color: "#D93025", fontWeight: 800 }}>
        <svg viewBox="0 0 24 24" width={42} height={42}>
          <circle cx="12" cy="12" r="9" fill="#FCE8E6" stroke="#D93025" strokeWidth="2" />
          <path d="M12 6.8v5.6l4 2.3" fill="none" stroke="#D93025" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
        trop long.
      </span>
    );
  }

  if (kind === "plaque") {
    return (
      <span style={{ ...chipStyle, padding: "9px 16px" }}>
        <span
          style={{
            width: 58,
            height: 58,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            border: `2px solid ${G.actionBlue}`,
            borderRadius: 12,
            backgroundColor: G.white,
          }}
        >
          <GoogleLogo size={18} />
        </span>
        <span>plaque NFC</span>
        <svg viewBox="0 0 34 34" width={34} height={34}>
          <path d="M10 8a13 13 0 010 18M16 12a7 7 0 010 10" fill="none" stroke={G.actionBlue} strokeWidth="2.4" strokeLinecap="round" />
          <circle cx="22" cy="17" r="3" fill={G.actionBlue} />
        </svg>
      </span>
    );
  }

  if (kind === "phone") {
    return (
      <span style={{ ...chipStyle, padding: "8px 18px" }}>
        <span
          style={{
            width: 40,
            height: 68,
            display: "inline-flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
            boxSizing: "border-box",
            padding: "7px 5px 5px",
            border: `4px solid ${G.textPrimary}`,
            borderRadius: 11,
          }}
        >
          <span style={{ width: 14, height: 3, borderRadius: 2, backgroundColor: G.textPrimary }} />
          <span style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: G.textSecondary }} />
        </span>
        <span>téléphone</span>
      </span>
    );
  }

  if (kind === "notification") {
    return (
      <span style={{ ...chipStyle, minWidth: 390, justifyContent: "flex-start" }}>
        <span
          style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: G.actionBlue,
            color: G.white,
            fontSize: 23,
            fontWeight: 800,
          }}
        >
          NFC
        </span>
        <span style={{ display: "inline-flex", flexDirection: "column", alignItems: "flex-start", lineHeight: 1.08 }}>
          <span style={{ fontSize: 23, color: G.textSecondary }}>NOTIFICATION</span>
          <span>Ouvrir l’avis Google</span>
        </span>
      </span>
    );
  }

  if (kind === "reviewPage") {
    return (
      <span style={{ ...chipStyle, padding: "9px 18px" }}>
        <span style={{ display: "inline-flex", flexDirection: "column", gap: 5, alignItems: "flex-start" }}>
          <GoogleLogo size={25} />
          <span style={{ fontSize: 24, fontWeight: 700 }}>Donnez votre avis</span>
          <Stars size={19} />
        </span>
      </span>
    );
  }

  if (kind === "stars") {
    return (
      <span style={{ ...chipStyle, padding: "12px 18px" }}>
        <Stars size={31} />
      </span>
    );
  }

  if (kind === "reputation") {
    return (
      <span style={{ ...chipStyle, borderColor: "#A8DAB5", color: G.openGreen }}>
        <span style={{ fontSize: 42, fontWeight: 800 }}>5,0</span>
        <Stars count={1} size={31} />
        <span style={{ fontSize: 42, fontWeight: 800 }}>↑</span>
        <span>réputation</span>
      </span>
    );
  }

  return (
    <span style={{ ...chipStyle, borderColor: "#A8DAB5", color: G.openGreen }}>
      <svg viewBox="0 0 72 48" width={72} height={48}>
        <rect x="4" y="31" width="12" height="13" rx="3" fill={G.border} />
        <rect x="26" y="21" width="12" height="23" rx="3" fill="#A8DAB5" />
        <rect x="48" y="9" width="12" height="35" rx="3" fill={G.openGreen} />
        <path d="M8 25L29 14l13 3L64 3" fill="none" stroke={G.openGreen} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M56 3h8v8" fill="none" stroke={G.openGreen} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span style={{ fontWeight: 800 }}>remonter</span>
      <span style={{ padding: "4px 10px", borderRadius: 10, backgroundColor: G.openGreen, color: G.white }}>1er</span>
    </span>
  );
};

const AnimatedPart: React.FC<{
  readonly part: PhrasePart;
  readonly revealFrame: number;
}> = ({ part, revealFrame }) => {
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
      {part.kind === "visual" ? (
        <VisualWord kind={part.visual} />
      ) : (
        <span
          style={{
            color: part.color ?? G.textPrimary,
            fontWeight: part.weight ?? 520,
            textShadow: "0 2px 0 #fff, 0 0 12px #fff, 0 0 24px #fff",
          }}
        >
          {part.text}
        </span>
      )}
    </span>
  );
};

const KineticPhrase: React.FC<{
  readonly phrase: NarrativePhrase;
  readonly durationInFrames: number;
}> = ({ phrase, durationInFrames }) => {
  const frame = useCurrentFrame();
  const revealWindow = Math.min(durationInFrames * 0.68, durationInFrames - 8);
  const denominator = Math.max(1, phrase.parts.length - 1);

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: 58,
          right: 58,
          top: phrase.placement === "top" ? 82 : undefined,
          bottom: phrase.placement === "bottom" ? 104 : undefined,
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
            maxWidth: 960,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: "14px 18px",
            fontFamily: FONT_FAMILY,
            fontSize: 54,
            lineHeight: 1.14,
            letterSpacing: -0.7,
            textAlign: "center",
          }}
        >
          {phrase.parts.map((part, index) => (
            <AnimatedPart
              key={`${phrase.startMs}-${index}`}
              part={part}
              revealFrame={(index / denominator) * revealWindow}
            />
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** Typographie cinétique narrative, sans effet sur la timeline du Short. */
export const ShortNarrativeCaptions: React.FC = () => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {PHRASES.map((phrase) => {
        const from = Math.round((phrase.startMs / 1000) * fps);
        const durationInFrames = Math.max(
          1,
          Math.round(((phrase.endMs - phrase.startMs) / 1000) * fps),
        );

        return (
          <Sequence
            key={`${phrase.startMs}-${phrase.text}`}
            from={from}
            durationInFrames={durationInFrames}
            name={`Phrase animée — ${phrase.text}`}
          >
            <KineticPhrase phrase={phrase} durationInFrames={durationInFrames} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
