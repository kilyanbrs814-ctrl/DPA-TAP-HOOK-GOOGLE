import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { T } from "./constants";

/**
 * Very short bright transition when "Publier" is pressed — the only flash left
 * in the reel. The notification → Safari hand-off no longer needs one: Safari
 * genuinely opens inside the phone screen, so there is nothing to hide.
 *
 * Rendered as SCREEN content, inside `PhoneMockup`: it is the phone screen that
 * flashes, not the composition. The chassis, the bezels and the Dynamic Island
 * stay visible right through it.
 */
export const PublishFlash: React.FC = () => {
  const frame = useCurrentFrame();

  const opacity = interpolate(
    frame,
    [T.publishFlash, T.successStart, T.successStart + 8],
    [0, 0.9, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.quad),
    },
  );

  if (opacity <= 0) {
    return null;
  }

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "radial-gradient(70% 40% at 50% 84%, #ffffff 0%, #dbe7ff 55%, #ffffff 100%)",
        opacity,
      }}
    />
  );
};
