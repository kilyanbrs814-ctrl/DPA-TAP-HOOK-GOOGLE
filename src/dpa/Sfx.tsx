import { Audio } from "@remotion/media";
import React from "react";
import { Sequence, staticFile } from "remotion";
import { ASSETS, T, starFrame } from "./constants";

/**
 * Original, synthesized sound design (see `scripts/make-sfx.mjs`).
 * No voice-over: the reel stays fully understandable with the sound off.
 */
export const Sfx: React.FC = () => {
  return (
    <>
      <Sequence from={T.contact - 3} durationInFrames={10} layout="none">
        <Audio src={staticFile(ASSETS.sfx.nfc)} volume={0.8} />
      </Sequence>
      {/* Bell on the frame the banner starts sliding in. */}
      <Sequence from={T.notifStart} durationInFrames={18} layout="none">
        <Audio src={staticFile(ASSETS.sfx.notification)} volume={0.65} />
      </Sequence>
      {/* Discreet tick, exactly on the banner's touch-down compression. */}
      <Sequence from={T.notifTap} durationInFrames={4} layout="none" hidden>
        <Audio src={staticFile(ASSETS.sfx.star)} volume={0.3} />
      </Sequence>
      {new Array(5).fill(true).map((_, index) => (
        <Sequence
          key={index}
          from={starFrame(index)}
          durationInFrames={3}
          layout="none"
          hidden
        >
          <Audio src={staticFile(ASSETS.sfx.star)} volume={0.55} />
        </Sequence>
      ))}
      <Sequence from={T.publishTap} durationInFrames={6} layout="none">
        <Audio src={staticFile(ASSETS.sfx.publish)} volume={0.75} />
      </Sequence>
      <Sequence from={T.successStart + 2} durationInFrames={30} layout="none">
        <Audio src={staticFile(ASSETS.sfx.success)} volume={0.6} />
      </Sequence>
    </>
  );
};
