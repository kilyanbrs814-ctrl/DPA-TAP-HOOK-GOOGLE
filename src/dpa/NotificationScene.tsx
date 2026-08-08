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
import { ASSETS, PHONE, SPRINGS, TRANSITION_FRAMES } from "./constants";
import { TapRing } from "./NfcWaves";
import { useDpaTiming } from "./timing";

const NOTIF_WIDTH = 402;
const NOTIF_HEIGHT = Math.round((NOTIF_WIDTH * 267) / 1127);
const NOTIF_TOP = 62;

/**
 * iOS NFC notification, rendered in the local coordinates of the phone screen.
 *
 * Three beats, all frame-exact and all driven from `TRANSITION_FRAMES`:
 *   1. it springs in from the top of the screen,
 *   2. it takes a short touch-down compression when it is pressed (5 frames) —
 *      a haptic nudge, never a bounce,
 *   3. it lifts, shrinks a hair and fades out in 7 frames, so it is gone from
 *      the screen before Safari has finished covering it.
 */
export const NotificationScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const T = useDpaTiming();

  const enter = spring({
    frame: frame - T.notifStart,
    fps,
    config: SPRINGS.snap,
    durationInFrames: TRANSITION_FRAMES.notifEnter,
  });

  // Touch-down feedback: a 5-frame compression, back to rest, nothing else.
  const pressLocal = frame - T.notifTap;
  const press = interpolate(
    pressLocal,
    [0, 2, TRANSITION_FRAMES.notifPress],
    [0, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Dismissal: up, out, quickly.
  const exitLocal = frame - T.notifExitStart;
  const exit = interpolate(
    exitLocal,
    [0, TRANSITION_FRAMES.notifExit],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.in(Easing.quad),
    },
  );

  if (
    frame < T.notifStart ||
    frame >= T.notifExitStart + TRANSITION_FRAMES.notifExit
  ) {
    return null;
  }

  return (
    <>
      <div
        style={{
          position: "absolute",
          top: NOTIF_TOP,
          left: (PHONE.screenWidth - NOTIF_WIDTH) / 2,
          width: NOTIF_WIDTH,
          height: NOTIF_HEIGHT,
          opacity:
            interpolate(enter, [0, 0.35], [0, 1], {
              extrapolateRight: "clamp",
            }) * interpolate(exit, [0, 1], [1, 0]),
          translate: `0px ${
            interpolate(enter, [0, 1], [-140, 0]) +
            interpolate(exit, [0, 1], [0, -26])
          }px`,
          scale:
            interpolate(press, [0, 1], [1, 0.965]) *
            interpolate(exit, [0, 1], [1, 0.97]),
          filter: `drop-shadow(0 18px 34px rgba(0,0,0,0.65)) brightness(${
            1 + press * 0.08
          })`,
        }}
      >
        <Img
          src={staticFile(ASSETS.notification)}
          style={{ width: "100%", height: "100%", display: "block" }}
        />
      </div>

      <TapRing
        x={PHONE.screenWidth / 2 + 40}
        y={NOTIF_TOP + NOTIF_HEIGHT / 2}
        startFrame={T.notifTap}
        size={120}
      />
    </>
  );
};
