import "./index.css";
import React from "react";
import { Composition } from "remotion";
import { GoogleRankingHook } from "./compositions/GoogleRankingHook";
import { GoogleRankingVsl } from "./compositions/GoogleRankingVsl";
import { DpaTapFullVsl, FULL_DURATION } from "./compositions/DpaTapFullVsl";

/** Paramètres imposés par le brief du hook. */
export const HOOK = {
  fps: 30,
  width: 1080,
  height: 1920,
  durationInFrames: 120,
} as const;

/** Hook (120 frames) + séquence des trois critères. */
const VSL_DURATION = 400;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="GoogleRankingHook"
        component={GoogleRankingHook}
        durationInFrames={HOOK.durationInFrames}
        fps={HOOK.fps}
        width={HOOK.width}
        height={HOOK.height}
      />
      <Composition
        id="GoogleRankingVsl"
        component={GoogleRankingVsl}
        durationInFrames={VSL_DURATION}
        fps={HOOK.fps}
        width={HOOK.width}
        height={HOOK.height}
      />
      {/*
        Livrable complet : le hook Google, la rotation de sortie et le reel NFC
        DPA TAP dans une seule timeline. `GoogleRankingHook` et
        `GoogleRankingVsl` restent enregistrées au-dessus pour comparaison.
      */}
      <Composition
        id="DpaTapFullVsl"
        component={DpaTapFullVsl}
        durationInFrames={FULL_DURATION}
        fps={HOOK.fps}
        width={HOOK.width}
        height={HOOK.height}
      />
    </>
  );
};
