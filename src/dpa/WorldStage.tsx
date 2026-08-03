import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { PHONE, PHONE_CLOSEUP, PLAQUE, SPRINGS, T } from "./constants";
import { NfcWaves } from "./NfcWaves";
import { NotificationScene } from "./NotificationScene";
import { PhoneMockup, PhoneWallpaper } from "./PhoneMockup";
import { PhoneReviewScreen } from "./PhoneReviewScreen";
import { PhoneSuccessScreen } from "./PhoneSuccessScreen";
import { PlaqueScene, plaqueAnchorAt } from "./PlaqueScene";
import { PublishFlash } from "./TransitionFx";

/**
 * The physical stage. Three transforms live here and they are deliberately kept
 * independent of each other:
 *
 *   1. the plaque + NFC layer — never scaled, only pushed back once the phone
 *      takes over the frame,
 *   2. the phone body — the only thing that moves during the close-up,
 *   3. the screen content — mounted inside `PhoneMockup`, so it simply rides
 *      along with the phone.
 *
 * There is no camera push and no full-screen hand-off any more: the whole reel
 * is played inside the iPhone screen, and the "zoom" is the phone itself coming
 * towards the camera.
 */
export const WorldStage: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const approach = spring({
    frame: frame - T.contactStart,
    fps,
    config: SPRINGS.glide,
    durationInFrames: T.contact - T.contactStart,
  });

  // Micro bounce on contact — a nudge, never a cartoon bounce.
  const bounce = spring({
    frame: frame - T.contact,
    fps,
    config: SPRINGS.contact,
    durationInFrames: 20,
  });
  const bounceY = interpolate(bounce, [0, 0.45, 1], [0, -9, 0]);

  /**
   * Close-up: the phone travels to the middle of the frame, grows to
   * `PHONE_CLOSEUP.scale` and straightens up.
   *
   * Bezier rather than a spring, so there is not a single frame of overshoot.
   * The curve is a true ease-in-out — a front-loaded "out" curve spends the
   * whole move already arrived, which reads as a snap instead of a 0.93 s
   * approach.
   */
  const closeUp = interpolate(frame, [T.closeUpStart, T.closeUpEnd], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.33, 0, 0.2, 1),
  });

  const anchor = plaqueAnchorAt(frame);
  const phoneVisible = frame >= T.contactStart - 6;

  const translateX =
    interpolate(approach, [0, 1], [168, 0]) +
    closeUp * (PHONE_CLOSEUP.centerX - PHONE.restX);
  const translateY =
    interpolate(approach, [0, 1], [660, 0]) +
    bounceY +
    closeUp * (PHONE_CLOSEUP.centerY - PHONE.restY);

  return (
    <AbsoluteFill>
      {/*
        Plaque + NFC rings. They keep their own scale — the decor is never blown
        up with the phone — and simply fade back so the screen owns the frame.
        No cut: the phone physically covers most of it anyway.
      */}
      <AbsoluteFill
        style={{
          opacity: interpolate(closeUp, [0, 1], [1, PLAQUE.closeUpOpacity]),
        }}
      >
        <PlaqueScene />
        <AbsoluteFill>
          <NfcWaves x={anchor.x} y={anchor.y} startFrame={T.contact - 8} />
        </AbsoluteFill>
      </AbsoluteFill>

      {/*
        Le voile noir plein cadre qui assombrissait le plateau pendant le
        close-up a été supprimé : il repeignait tout le fond en gris foncé.
        La mise en avant de l'écran est déjà assurée par la plaque qui s'efface
        (`PLAQUE.closeUpOpacity`) et par l'iPhone qui grossit.
      */}

      {phoneVisible ? (
        <div
          style={{
            position: "absolute",
            left: PHONE.restX - PHONE.width / 2,
            top: PHONE.restY - PHONE.height / 2,
            width: PHONE.width,
            height: PHONE.height,
            opacity: interpolate(
              frame,
              [T.contactStart - 6, T.contactStart + 4],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
            ),
            translate: `${translateX}px ${translateY}px`,
            // The residual 0.6° tilt is corrected back to a perfect 0° on arrival.
            rotate: `${
              interpolate(approach, [0, 1], [7.5, 0.6]) * (1 - closeUp)
            }deg`,
            scale:
              interpolate(approach, [0, 1], [1.05, 1], {
                output: "perceptual-scale",
              }) *
              interpolate(closeUp, [0, 1], [1, PHONE_CLOSEUP.scale], {
                output: "perceptual-scale",
              }),
          }}
        >
          <PhoneMockup
            /*
              The publish whiteout goes above the iOS chrome, so page, status bar
              and home indicator wash together — none of them appears to blink.
            */
            screenOverlay={
              frame >= T.publishFlash && frame < T.successStart + 8 ? (
                <PublishFlash />
              ) : null
            }
          >
            <PhoneWallpaper />
            {/*
              Safari + the Google review page. Mounted as screen content, so it
              is clipped by the screen and can never reach the chassis.
            */}
            <PhoneReviewScreen />
            {/*
              The banner is painted last, exactly like on iOS: it stays on top
              while it lifts away, over a Safari that is still loading. It has
              fully unmounted before the Google page paints, so it never sits on
              top of the review interface.
            */}
            <NotificationScene />
            {/*
              The "+1 avis" confirmation — screen content too, so the reel never
              leaves the iPhone.
            */}
            <PhoneSuccessScreen />
          </PhoneMockup>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
