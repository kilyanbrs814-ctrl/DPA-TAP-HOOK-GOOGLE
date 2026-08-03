import React from "react";
import {
  Easing,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  ASSETS,
  COLORS,
  FINAL_SCREEN,
  PHONE,
  REVIEW_PAGE,
  SPRINGS,
  T,
} from "./constants";

/**
 * The "+1 avis" confirmation, rendered in the LOCAL coordinates of the phone
 * screen — exactly like `PhoneReviewScreen`.
 *
 * Mounted as a child of `PhoneMockup`, so it is clipped by the screen's
 * `overflow: hidden` + rounded corners and it rides the phone's transform. The
 * reel never leaves the iPhone: the confirmation replaces the Google page
 * *inside the screen*, under the publish flash, and the phone simply steps back
 * afterwards to make room for the signature.
 */

/** `ecran-final-plus-1-avis.png` is 968 × 1624 → fitted to the screen width. */
const SCREEN_SCALE = PHONE.screenWidth / FINAL_SCREEN.srcWidth;
const IMG_WIDTH = PHONE.screenWidth;
const IMG_HEIGHT = FINAL_SCREEN.srcHeight * SCREEN_SCALE;
/** Centered; the strips above and below take the asset's own background. */
const IMG_TOP = (PHONE.screenHeight - IMG_HEIGHT) / 2;

/**
 * Rect of the baked "+1 avis" headline in SOURCE pixels. The headline is hidden
 * with a card-coloured patch and re-introduced as a clipped copy of the very
 * same image, so the animated text is pixel-identical to the asset — no font
 * guessing, no restyling.
 */
const HEADLINE = { x: 330, y: 694, width: 310, height: 102 };
const CARD_BG = "#2a2a2b";

const h = {
  left: HEADLINE.x * SCREEN_SCALE,
  top: HEADLINE.y * SCREEN_SCALE,
  width: HEADLINE.width * SCREEN_SCALE,
  height: HEADLINE.height * SCREEN_SCALE,
};

/**
 * Restrained Google-coloured accents — six shapes only, kept in the empty parts
 * of the card so they never sit on top of "+1 avis" or the labels. Expressed in
 * source pixels, like every other overlay, so they follow the screen scale.
 */
/**
 * Avatar continuity.
 *
 * The confirmation asset ships its own placeholder avatar, which is a different
 * person from the one on the review page. Rather than generating or picking a
 * look-alike, the placeholder is covered with a card-coloured disc and the REAL
 * avatar is re-cropped straight out of `page-avis-google.png` — the same file,
 * the same pixels, the same circular framing. No new asset, no second source.
 *
 * `page-avis-google.png` is scaled so its `REVIEW_PAGE.avatar.size` disc exactly
 * fills the confirmation's avatar disc, then offset so the two centers coincide.
 */
const AVATAR_SIZE = FINAL_SCREEN.avatar.size * SCREEN_SCALE;
const AVATAR_LEFT = FINAL_SCREEN.avatar.x * SCREEN_SCALE - AVATAR_SIZE / 2;
const AVATAR_TOP =
  IMG_TOP + FINAL_SCREEN.avatar.y * SCREEN_SCALE - AVATAR_SIZE / 2;

/** Scale applied to the whole review screenshot inside the avatar disc. */
const AVATAR_SRC_SCALE = AVATAR_SIZE / REVIEW_PAGE.avatar.size;
/** Offsets that bring the review avatar's center onto the disc's center. */
const AVATAR_SRC_LEFT =
  AVATAR_SIZE / 2 - REVIEW_PAGE.avatar.x * AVATAR_SRC_SCALE;
const AVATAR_SRC_TOP =
  AVATAR_SIZE / 2 - REVIEW_PAGE.avatar.y * AVATAR_SRC_SCALE;

/** The patch is a touch wider than the placeholder, so no rim can survive. */
const AVATAR_PATCH = (FINAL_SCREEN.avatar.size + 12) * SCREEN_SCALE;

const ACCENTS = [
  { x: 226, y: 328, size: 41, color: COLORS.googleBlue, delay: 2 },
  { x: 744, y: 290, size: 34, color: COLORS.googleYellow, delay: 5 },
  { x: 163, y: 452, size: 27, color: COLORS.googleGreen, delay: 9 },
  { x: 805, y: 459, size: 30, color: COLORS.googleRed, delay: 4 },
  { x: 269, y: 1146, size: 34, color: COLORS.googleYellow, delay: 7 },
  { x: 710, y: 1190, size: 27, color: COLORS.googleBlue, delay: 10 },
] as const;

export const PhoneSuccessScreen: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({
    frame: frame - T.successStart,
    fps,
    config: SPRINGS.glide,
    durationInFrames: 12,
  });

  const headline = spring({
    frame: frame - (T.successStart + 4),
    fps,
    config: SPRINGS.snap,
    durationInFrames: 22,
  });

  if (frame < T.successStart) {
    return null;
  }

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: COLORS.successBg,
        overflow: "hidden",
      }}
    >
      {/* Success glow behind the card */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(46% 26% at 50% 44%, rgba(52,168,83,0.30) 0%, rgba(66,133,244,0.14) 42%, rgba(0,0,0,0) 74%)",
          opacity: interpolate(
            frame,
            [T.successStart, T.successStart + 10, T.successStart + 40],
            [0, 1, 0.55],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          ),
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: interpolate(enter, [0, 0.5], [0, 1], {
            extrapolateRight: "clamp",
          }),
          scale: interpolate(enter, [0, 1], [1.06, 1], {
            output: "perceptual-scale",
          }),
        }}
      >
        <Img
          src={staticFile(ASSETS.finalScreen)}
          style={{
            position: "absolute",
            top: IMG_TOP,
            left: 0,
            width: IMG_WIDTH,
            height: IMG_HEIGHT,
            display: "block",
          }}
        />

        {/* Cover the placeholder avatar with the card background … */}
        <div
          style={{
            position: "absolute",
            left:
              FINAL_SCREEN.avatar.x * SCREEN_SCALE - AVATAR_PATCH / 2,
            top:
              IMG_TOP +
              FINAL_SCREEN.avatar.y * SCREEN_SCALE -
              AVATAR_PATCH / 2,
            width: AVATAR_PATCH,
            height: AVATAR_PATCH,
            borderRadius: "50%",
            backgroundColor: CARD_BG,
          }}
        />

        {/* … and re-crop the real one out of the review screenshot. */}
        <div
          style={{
            position: "absolute",
            left: AVATAR_LEFT,
            top: AVATAR_TOP,
            width: AVATAR_SIZE,
            height: AVATAR_SIZE,
            borderRadius: "50%",
            overflow: "hidden",
          }}
        >
          <Img
            src={staticFile(ASSETS.reviewPage)}
            style={{
              position: "absolute",
              left: AVATAR_SRC_LEFT,
              top: AVATAR_SRC_TOP,
              width: REVIEW_PAGE.srcWidth * AVATAR_SRC_SCALE,
              height: REVIEW_PAGE.srcHeight * AVATAR_SRC_SCALE,
              /*
                Obligatoire ici. Le Preflight de Tailwind pose
                `img { max-width: 100% }` : la capture, large de ~530 px, était
                donc ramenée de force à la largeur du disque (58 px) tandis que
                la hauteur en ligne, elle, restait appliquée. L'image était
                écrasée horizontalement d'un facteur 9 et le disque montrait le
                fond noir du bord droit de la page au lieu de l'avatar — d'où le
                croissant sombre. Le projet d'origine n'avait pas Tailwind, le
                bug n'y apparaissait donc pas.
              */
              maxWidth: "none",
              display: "block",
            }}
          />
        </div>

        {/* Hide the baked headline … */}
        <div
          style={{
            position: "absolute",
            left: h.left,
            top: IMG_TOP + h.top,
            width: h.width,
            height: h.height,
            backgroundColor: CARD_BG,
          }}
        />

        {/* … and bring it back with a controlled spring. */}
        <Img
          src={staticFile(ASSETS.finalScreen)}
          style={{
            position: "absolute",
            top: IMG_TOP,
            left: 0,
            width: IMG_WIDTH,
            height: IMG_HEIGHT,
            display: "block",
            clipPath: `inset(${h.top}px ${IMG_WIDTH - h.left - h.width}px ${
              IMG_HEIGHT - h.top - h.height
            }px ${h.left}px)`,
            transformOrigin: `${h.left + h.width / 2}px ${h.top + h.height / 2}px`,
            opacity: interpolate(headline, [0, 0.3], [0, 1], {
              extrapolateRight: "clamp",
            }),
            scale: interpolate(headline, [0, 1], [0.62, 1], {
              output: "perceptual-scale",
            }),
            translate: `0px ${interpolate(headline, [0, 1], [12, 0])}px`,
          }}
        />

        {ACCENTS.map((accent, index) => {
          const local = frame - (T.successStart + 3 + accent.delay);
          const size = accent.size * SCREEN_SCALE;
          return (
            <div
              key={index}
              style={{
                position: "absolute",
                left: accent.x * SCREEN_SCALE - size / 2,
                top: IMG_TOP + accent.y * SCREEN_SCALE - size / 2,
                width: size,
                height: size,
                borderRadius: index % 2 === 0 ? "50%" : size / 3,
                backgroundColor: accent.color,
                opacity: interpolate(local, [0, 4, 30, 44], [0, 0.95, 0.9, 0], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }),
                scale: interpolate(local, [0, 8], [0.2, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: Easing.out(Easing.cubic),
                  output: "perceptual-scale",
                }),
                translate: `0px ${interpolate(local, [0, 26], [7, -4.5], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                })}px`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
};
