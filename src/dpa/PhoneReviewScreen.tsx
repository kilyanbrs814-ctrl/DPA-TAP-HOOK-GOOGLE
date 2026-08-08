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
  FONT_STACK,
  PHONE,
  REVIEW_PAGE,
  SCREEN,
  SPRINGS,
  TRANSITION_FRAMES,
} from "./constants";
import { TapRing } from "./NfcWaves";
import { starFrameAt, useDpaTiming } from "./timing";

/**
 * Safari and the Google review page, rendered in the LOCAL coordinate system of
 * the phone screen (`PHONE.screenWidth` × `PHONE.screenHeight`).
 *
 * This component is mounted as a child of `PhoneMockup`, so it is clipped by the
 * screen's `overflow: hidden` + border radius and it inherits, for free, every
 * transform applied to the phone: the close-up moves Safari, the page, the stars
 * and the titanium frame as one physical object. Nothing here ever leaves the
 * phone, and no coordinate is expressed against the 1080 × 1920 composition.
 */

/** The 1024 × 1536 screenshot is fitted to the screen width — never stretched. */
const PAGE_SCALE = PHONE.screenWidth / REVIEW_PAGE.srcWidth;
const PAGE_WIDTH = PHONE.screenWidth;
const PAGE_HEIGHT = REVIEW_PAGE.srcHeight * PAGE_SCALE;

/**
 * The page is centered in the area left between the status bar and the Safari
 * toolbar. The strips above and below it are painted in `COLORS.screenBg`, the
 * screenshot's own background, so the seam is invisible.
 */
const PAGE_TOP =
  SCREEN.contentTop + (SCREEN.contentHeight - PAGE_HEIGHT) / 2;

const toScreenX = (srcX: number) => srcX * PAGE_SCALE;
const toScreenY = (srcY: number) => PAGE_TOP + srcY * PAGE_SCALE;

const STAR_DRAW_SIZE = REVIEW_PAGE.starSize * PAGE_SCALE * 1.14;
const STAR_TAP_SIZE = 42;
const PUBLISH_TAP_SIZE = 84;

const BUTTON = {
  left: toScreenX(REVIEW_PAGE.publishButton.x),
  top: toScreenY(REVIEW_PAGE.publishButton.y),
  width: REVIEW_PAGE.publishButton.width * PAGE_SCALE,
  height: REVIEW_PAGE.publishButton.height * PAGE_SCALE,
  radius: REVIEW_PAGE.publishButton.radius * PAGE_SCALE,
};

const FilledStar: React.FC<{ readonly index: number }> = ({ index }) => {
  const frame = useCurrentFrame();
  const T = useDpaTiming();
  const local = frame - starFrameAt(T, index);

  if (local < 0) {
    return null;
  }

  return (
    <div
      style={{
        position: "absolute",
        left: toScreenX(REVIEW_PAGE.starCentersX[index]) - STAR_DRAW_SIZE / 2,
        top: toScreenY(REVIEW_PAGE.starCenterY) - STAR_DRAW_SIZE / 2,
        width: STAR_DRAW_SIZE,
        height: STAR_DRAW_SIZE,
        opacity: interpolate(local, [0, 1.5], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        // 0.10–0.14 s reaction: 0.92 → 1.12 → 1
        scale: interpolate(local, [0, 1.6, T.starReact], [0.92, 1.12, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.out(Easing.quad),
          output: "perceptual-scale",
        }),
        filter: `drop-shadow(0 0 ${interpolate(
          local,
          [0, T.starReact, T.starReact + 6],
          [9, 6, 2.5],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        )}px rgba(250,187,5,0.55))`,
      }}
    >
      <svg viewBox="0 0 24 24" width="100%" height="100%">
        <polygon
          points="12,1.6 15.2,8.4 22.6,9.4 17.2,14.5 18.6,22 12,18.4 5.4,22 6.8,14.5 1.4,9.4 8.8,8.4"
          fill={COLORS.googleYellow}
        />
      </svg>
    </div>
  );
};

/**
 * Safari bottom toolbar: address field + the thin loading line that runs while
 * the page is being fetched.
 */
const SafariBar: React.FC<{
  readonly progress: number;
  /** How much of the page is already painted — the bar clears as it appears. */
  readonly painted: number;
}> = ({ progress, painted }) => (
  <div
    style={{
      position: "absolute",
      bottom: 0,
      left: 0,
      width: PHONE.screenWidth,
      height: SCREEN.safariBarHeight,
      backgroundColor: COLORS.safariChrome,
      fontFamily: FONT_STACK,
    }}
  >
    {/* Loading line, pinned to the top edge of the toolbar like on iOS. */}
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        height: 2,
        width: `${progress * 100}%`,
        backgroundColor: COLORS.googleBlue,
        opacity:
          interpolate(progress, [0, 0.1], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }) * (1 - painted),
      }}
    />
    <div
      style={{
        position: "absolute",
        left: 62,
        right: 62,
        top: 16,
        height: 32,
        borderRadius: 10,
        backgroundColor: COLORS.safariField,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "rgba(255,255,255,0.86)",
        fontSize: 15,
        letterSpacing: 0.1,
      }}
    >
      search.google.com
    </div>
  </div>
);

export const PhoneReviewScreen: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const T = useDpaTiming();

  // Safari taking the screen: opacity + 0.97 → 1 + a short vertical settle and a
  // blur that clears immediately. Heavily damped, no overshoot, no wipe.
  const open = spring({
    frame: frame - T.safariStart,
    fps,
    config: SPRINGS.ios,
    durationInFrames: TRANSITION_FRAMES.safariOpen,
  });

  // The wallpaper darkens under Safari, the way iOS dims what is being covered.
  const dim = interpolate(open, [0, 0.5], [0, 0.55], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const loading = interpolate(frame, [T.safariStart, T.pageStart], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  const page = interpolate(
    frame,
    [T.pageStart, T.pageStart + TRANSITION_FRAMES.pageFade],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    },
  );

  const press = spring({
    frame: frame - T.publishTap,
    fps,
    config: SPRINGS.contact,
    durationInFrames: 14,
  });
  const pressAmount = interpolate(press, [0, 0.45, 1], [0, 1, 0]);

  if (frame < T.safariStart) {
    return null;
  }

  const blur = interpolate(open, [0, 0.45], [5, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <>
      {/* Wallpaper dim — unscaled, so it covers the screen edge to edge. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "#000000",
          opacity: dim,
        }}
      />

      {/*
        The Safari surface. Its background stays crisp (the blur lives on the
        inner wrapper) so no wallpaper bleeds through the rim while it opens.
      */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: COLORS.screenBg,
          borderRadius: PHONE.radius - PHONE.bezel,
          opacity: interpolate(open, [0, 0.45], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          scale: interpolate(open, [0, 1], [0.97, 1], {
            output: "perceptual-scale",
          }),
          translate: `0px ${interpolate(open, [0, 1], [12, 0])}px`,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            filter: blur > 0.05 ? `blur(${blur}px)` : undefined,
          }}
        >
          <SafariBar progress={loading} painted={page} />

          {/* The Google page: fitted by width, ratio untouched, never stretched. */}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: PAGE_TOP,
              width: PAGE_WIDTH,
              height: PAGE_HEIGHT,
              opacity: page,
              translate: `0px ${
                interpolate(page, [0, 1], [8, 0]) + pressAmount * 1.4
              }px`,
              scale: interpolate(pressAmount, [0, 1], [1, 0.997], {
                output: "perceptual-scale",
              }),
            }}
          >
            <Img
              src={staticFile(ASSETS.reviewPage)}
              style={{ width: "100%", height: "100%", display: "block" }}
            />
          </div>

          {new Array(5).fill(true).map((_, index) => (
            <FilledStar key={index} index={index} />
          ))}

          {new Array(5).fill(true).map((_, index) => (
            <TapRing
              key={index}
              x={toScreenX(REVIEW_PAGE.starCentersX[index])}
              y={toScreenY(REVIEW_PAGE.starCenterY)}
              startFrame={starFrameAt(T, index)}
              size={STAR_TAP_SIZE}
            />
          ))}

          {/* "Publier" press: the button sinks slightly. */}
          <div
            style={{
              position: "absolute",
              left: BUTTON.left,
              top: BUTTON.top,
              width: BUTTON.width,
              height: BUTTON.height,
              borderRadius: BUTTON.radius,
              backgroundColor: "rgba(0,0,0,0.22)",
              boxShadow: "inset 0 2px 5px rgba(0,0,0,0.35)",
              opacity: pressAmount,
            }}
          />
          <TapRing
            x={BUTTON.left + BUTTON.width / 2}
            y={BUTTON.top + BUTTON.height / 2}
            startFrame={T.publishTap}
            size={PUBLISH_TAP_SIZE}
          />
        </div>
      </div>
    </>
  );
};
