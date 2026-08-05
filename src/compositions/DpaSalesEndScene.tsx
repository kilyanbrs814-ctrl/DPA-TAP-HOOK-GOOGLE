/**
 * DpaSalesEndScene — la page de présentation qui clôt le film.
 *
 * 1080 × 1920, fond #FFFFFF, même palette et même typographie (Roboto) que
 * l'interface Google reconstituée du hook. Elle ne contient ni prix, ni bouton,
 * ni lien, ni QR code : la seule invitation est le mot « Découvrez » suivi du
 * logotype officiel, affiché en image et jamais réécrit avec une police.
 *
 * Les deux plaques sont les visuels détourés authentiques du dépôt d'assets,
 * posées côte à côte — la noire à gauche, la bleue à droite — dans deux
 * empreintes produit strictement identiques. Elles ne se chevauchent jamais et
 * restent entièrement dans la safe zone, y compris pendant leur apparition.
 *
 * Tout est piloté par `useCurrentFrame()` : aucune animation CSS temporelle.
 */

import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, staticFile } from "remotion";
import { useCurrentFrame } from "remotion";
import { FONT_FAMILY } from "../config/fonts";
import { G } from "../config/google-ui";
import { ASSETS } from "../dpa/constants";
import { VOICEOVER_FRAMES } from "../config/voiceover";

/** Durée restante jusqu'à la fin exacte du fichier voix off. */
export const SALES_END_DURATION =
  VOICEOVER_FRAMES.total - VOICEOVER_FRAMES.salesEndStart;

/** Marge latérale, alignée sur la safe zone du reel (`SAFE.left` / `SAFE.right`). */
const MARGIN = 110;
const CONTENT_WIDTH = 1080 - MARGIN * 2;

/** Accents Google, repris de la palette du logo déjà définie dans le projet. */
const ACCENT = {
  blue: G.logo[0],
  red: G.logo[1],
  yellow: G.logo[2],
  green: G.logo[4],
} as const;

/**
 * Fondu + montée de quelques pixels, borné aux deux extrémités : après `to`, la
 * valeur vaut exactement 1 et l'élément ne bouge plus d'un pixel jusqu'à la fin
 * de la scène.
 */
const reveal = (frame: number, from: number, to: number) =>
  interpolate(frame, [from, to], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

const lift = (progress: number, distance: number) =>
  `0px ${((1 - progress) * distance).toFixed(2)}px`;

/* ────────────────────────────────────────────────────────────────────────── */
/*  Icônes — traits simples, jamais de pictogramme cliquable                  */
/* ────────────────────────────────────────────────────────────────────────── */

const ICON_SIZE = 26;

/** Sans abonnement : le cycle de renouvellement, barré. */
const IconNoSubscription: React.FC<{ readonly color: string }> = ({ color }) => (
  <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none">
    <path
      d="M20 12a8 8 0 0 1-8 8 8 8 0 0 1-6.9-4"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
    />
    <path
      d="M4 12a8 8 0 0 1 8-8 8 8 0 0 1 6.9 4"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
    />
    <path d="M5 5l14 14" stroke={color} strokeWidth={2} strokeLinecap="round" />
  </svg>
);

/** Prête à l'emploi : la coche. */
const IconReady: React.FC<{ readonly color: string }> = ({ color }) => (
  <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none">
    <path
      d="M4.5 12.5l5 5 10-11"
      stroke={color}
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/** Garantie à vie : le bouclier. */
const IconWarranty: React.FC<{ readonly color: string }> = ({ color }) => (
  <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none">
    <path
      d="M12 3l7 3v5.5c0 4.3-2.9 7.9-7 9.5-4.1-1.6-7-5.2-7-9.5V6l7-3z"
      stroke={color}
      strokeWidth={2}
      strokeLinejoin="round"
    />
    <path
      d="M8.8 12.2l2.2 2.2 4.2-4.6"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/** Livraison gratuite : le colis. */
const IconDelivery: React.FC<{ readonly color: string }> = ({ color }) => (
  <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none">
    <path
      d="M3.5 7.6L12 3.5l8.5 4.1v8.8L12 20.5l-8.5-4.1V7.6z"
      stroke={color}
      strokeWidth={2}
      strokeLinejoin="round"
    />
    <path
      d="M3.5 7.6L12 11.8l8.5-4.2M12 11.8v8.7"
      stroke={color}
      strokeWidth={2}
      strokeLinejoin="round"
    />
  </svg>
);

/* ────────────────────────────────────────────────────────────────────────── */
/*  Les quatre avantages                                                      */
/* ────────────────────────────────────────────────────────────────────────── */

const CARD = {
  top: 1070,
  width: (CONTENT_WIDTH - 24) / 2,
  height: 113,
  gapX: 24,
  gapY: 24,
  radius: 18,
} as const;

const ADVANTAGES = [
  { label: "Sans abonnement", color: ACCENT.blue, Icon: IconNoSubscription },
  { label: "Prête à l’emploi", color: ACCENT.green, Icon: IconReady },
  { label: "Garantie à vie", color: ACCENT.yellow, Icon: IconWarranty },
  { label: "Livraison gratuite", color: ACCENT.red, Icon: IconDelivery },
] as const;

/* ────────────────────────────────────────────────────────────────────────── */
/*  Plaques — un seul gabarit extérieur, deux designs intérieurs             */
/* ────────────────────────────────────────────────────────────────────────── */

/**
 * Géométrie mesurée sur les deux fichiers. Le nouveau visuel noir remplit son
 * canevas 430 × 430 px, tandis que la plaque bleue occupe 750 × 693 px dans un
 * canevas de 1024 × 1024 px. Afficher simplement les deux canevas à la même
 * taille ferait donc paraître les produits différents.
 *
 * Chaque design est normalisé puis placé DANS le même masque extérieur. Ainsi,
 * les dimensions, les coins et l'animation sont rigoureusement identiques au
 * pixel près ; seule l'image visible à l'intérieur du gabarit change.
 */
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

/** Gabarit physique commun aux deux produits — source unique de leur forme. */
const PLAQUE_FRAME = {
  width: 368,
  height: 350,
  radius: 24,
  centerY: 790,
} as const;

/**
 * Centres visibles : 48 px d'air entre les produits, et 148 px de marge entre
 * chaque plaque et le bord du cadre. Même au pic de l'animation, aucun produit
 * ne passe devant l'autre et aucun bord n'est masqué.
 */
const PLAQUE_CENTER_X = {
  black: 332,
  blue: 748,
} as const;

/** Place l'empreinte visible exactement bord à bord dans le masque commun. */
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
    centerX: PLAQUE_CENTER_X.black,
    artwork: plaqueArtworkLayout(PLAQUE_SOURCE.black),
  },
  {
    key: "blue",
    asset: ASSETS.plaqueBluePng,
    centerX: PLAQUE_CENTER_X.blue,
    artwork: plaqueArtworkLayout(PLAQUE_SOURCE.blue),
  },
] as const;

/* ────────────────────────────────────────────────────────────────────────── */
/*  Logotype officiel                                                         */
/* ────────────────────────────────────────────────────────────────────────── */

/**
 * `logo-dpa.png` : canevas 1536 × 1024 à fond transparent, dans lequel le
 * logotype lui-même ne mesure que 1050 × 173 px, centré en (754,5 ; 476).
 * Comme pour les plaques, on pilote la largeur du LOGOTYPE et non celle du
 * canevas — sinon la marge vide du fichier ferait paraître le logo minuscule.
 *
 * L'image est affichée entière et à son rapport exact 1536 : 1024 (soit
 * 3 : 2) : rien n'est recadré, rien n'est étiré, aucune couleur n'est touchée.
 */
const LOGO_SOURCE = {
  width: 1536,
  height: 1024,
  markWidth: 1050,
  markHeight: 173,
  markCenterX: 754.5,
  markCenterY: 476,
} as const;

/** Largeur visible du logotype, et position de son centre dans le cadre. */
const LOGO_MARK_WIDTH = 320;
const LOGO_MARK_CENTER = { x: 540, y: 1554 } as const;

const LOGO = (() => {
  const scale = LOGO_MARK_WIDTH / LOGO_SOURCE.markWidth;
  return {
    width: LOGO_SOURCE.width * scale,
    height: LOGO_SOURCE.height * scale,
    left: LOGO_MARK_CENTER.x - LOGO_SOURCE.markCenterX * scale,
    top: LOGO_MARK_CENTER.y - LOGO_SOURCE.markCenterY * scale,
    markHeight: LOGO_SOURCE.markHeight * scale,
  };
})();

/* ────────────────────────────────────────────────────────────────────────── */

export const DpaSalesEndScene: React.FC = () => {
  const frame = useCurrentFrame();

  const title = reveal(frame, 0, 16);
  const subtitle = reveal(frame, 8, 28);
  const plaques = reveal(frame, 10, 34);
  const outro = reveal(frame, 68, 92);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: G.white,
        fontFamily: FONT_FAMILY,
      }}
    >
      {/* ── Titre ───────────────────────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          top: 236,
          left: MARGIN,
          width: CONTENT_WIDTH,
          textAlign: "center",
          fontSize: 50,
          lineHeight: "66px",
          fontWeight: 500,
          letterSpacing: -0.4,
          color: G.textPrimary,
          opacity: title,
          translate: lift(title, 22),
        }}
      >
        <div>Transformez chaque client satisfait</div>
        <div>en nouvel avis Google.</div>
      </div>

      {/* ── Sous-titre ──────────────────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          top: 400,
          left: MARGIN,
          width: CONTENT_WIDTH,
          textAlign: "center",
          fontSize: 36,
          fontWeight: 400,
          color: G.textSecondary,
          opacity: subtitle,
          translate: lift(subtitle, 18),
        }}
      >
        Un geste. Quelques secondes.
      </div>

      {/*
        Un masque absolument identique pour les deux plaques. Le wrapper est
        la forme physique du produit ; l'<Img> interne n'est que son design.
      */}
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
            opacity: plaques,
            translate: lift(plaques, 26),
            scale: interpolate(plaques, [0, 1], [0.95, 1], {
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

      {/* ── Les quatre avantages, grille 2 × 2 ──────────────────────────── */}
      {ADVANTAGES.map((advantage, index) => {
        const column = index % 2;
        const row = Math.floor(index / 2);
        const start = 46 + index * 6;
        const progress = reveal(frame, start, start + 12);

        return (
          <div
            key={advantage.label}
            style={{
              position: "absolute",
              left: MARGIN + column * (CARD.width + CARD.gapX),
              top: CARD.top + row * (CARD.height + CARD.gapY),
              width: CARD.width,
              height: CARD.height,
              boxSizing: "border-box",
              borderRadius: CARD.radius,
              border: `1px solid ${G.border}`,
              backgroundColor: G.white,
              display: "flex",
              alignItems: "center",
              gap: 20,
              paddingLeft: 24,
              opacity: progress,
              translate: lift(progress, 16),
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 14,
                /* Pastille très pâle : une information, pas un bouton. */
                backgroundColor: `${advantage.color}1F`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <advantage.Icon color={advantage.color} />
            </div>
            <span
              style={{
                fontSize: 29,
                fontWeight: 500,
                color: G.textPrimary,
                letterSpacing: -0.2,
              }}
            >
              {advantage.label}
            </span>
          </div>
        );
      })}

      {/* ── Conclusion, seule invitation de toute la scène ──────────────── */}
      <div
        style={{
          position: "absolute",
          top: 1448,
          left: MARGIN,
          width: CONTENT_WIDTH,
          textAlign: "center",
          fontSize: 50,
          lineHeight: "60px",
          fontWeight: 500,
          letterSpacing: -0.4,
          color: G.textPrimary,
          opacity: outro,
          translate: lift(outro, 20),
        }}
      >
        Découvrez
      </div>

      {/*
        Le logotype officiel, en image. La marque n'est plus écrite avec une
        police : c'est le fichier `logo-dpa.png` lui-même, affiché entier, à son
        rapport exact (1536 × 1024), sans recadrage ni retouche de couleur.
      */}
      <Img
        src={staticFile(ASSETS.logo)}
        style={{
          position: "absolute",
          left: LOGO.left,
          top: LOGO.top,
          width: LOGO.width,
          height: LOGO.height,
          maxWidth: "none",
          opacity: outro,
          translate: lift(outro, 20),
        }}
      />
    </AbsoluteFill>
  );
};
