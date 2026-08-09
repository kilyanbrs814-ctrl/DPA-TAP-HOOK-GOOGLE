import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, Sequence, staticFile } from "remotion";
import {
  COMMERCE_DPA_TIMING,
  COMMERCE_VSL,
  COMMERCE_VSL_DURATION,
  COMMERCE_VSL_EXISTING_VOICE_START,
  COMMERCE_VSL_SECOND_VOICE_START,
} from "../config/commerceVsl";
import { G } from "../config/google-ui";
import { DpaTapReelBlue } from "../dpa/DpaTapReelBlue";
import { CommerceGoogleIntro } from "./CommerceGoogleIntro";
import { CommerceVslEndScene } from "./CommerceVslEndScene";

export { COMMERCE_VSL_DURATION };

export const DpaTapCommerceVsl: React.FC = () => {
  const { audio, beats } = COMMERCE_VSL;

  return (
    <AbsoluteFill style={{ backgroundColor: G.white }}>
      <Sequence durationInFrames={audio.newVoiceFirstEnd} layout="none">
        <Audio
          src={staticFile(audio.newVoice)}
          trimBefore={0}
          trimAfter={audio.newVoiceFirstEnd}
          volume={1}
        />
      </Sequence>
      <Sequence
        from={COMMERCE_VSL_EXISTING_VOICE_START}
        durationInFrames={audio.existingDemoEnd - audio.existingActionStart}
        layout="none"
      >
        <Audio
          src={staticFile(audio.existingVoice)}
          trimBefore={audio.existingActionStart}
          trimAfter={audio.existingDemoEnd}
          volume={1}
        />
      </Sequence>
      <Sequence
        from={COMMERCE_VSL_SECOND_VOICE_START}
        durationInFrames={audio.newVoiceEnd - audio.newVoiceSecondStart}
        layout="none"
      >
        <Audio
          src={staticFile(audio.newVoice)}
          trimBefore={audio.newVoiceSecondStart}
          trimAfter={audio.newVoiceEnd}
          volume={1}
        />
      </Sequence>
      <Sequence
        durationInFrames={beats.productStart}
        name="Hook Google commerces"
      >
        <CommerceGoogleIntro />
      </Sequence>
      <Sequence
        from={beats.productStart}
        durationInFrames={beats.demoEnd - beats.productStart}
        premountFor={30}
        name="Produit + démonstration NFC"
      >
        <DpaTapReelBlue timing={COMMERCE_DPA_TIMING} />
      </Sequence>
      <Sequence
        from={beats.demoEnd}
        durationInFrames={COMMERCE_VSL_DURATION - beats.demoEnd}
        name="Bénéfices + CTA"
      >
        <CommerceVslEndScene />
      </Sequence>
    </AbsoluteFill>
  );
};
