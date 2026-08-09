import "./index.css";
import React from "react";
import { Composition } from "remotion";
import { GoogleRankingHook } from "./compositions/GoogleRankingHook";
import {
  GOOGLE_VSL_DURATION,
  GoogleRankingVsl,
} from "./compositions/GoogleRankingVsl";
import { DpaTapFullVsl, FULL_DURATION } from "./compositions/DpaTapFullVsl";
import {
  DpaTapTikTokShort,
  TIKTOK_SHORT_DURATION,
} from "./compositions/DpaTapTikTokShort";
import {
  COMMERCE_VSL_DURATION,
  DpaTapCommerceVsl,
} from "./compositions/DpaTapCommerceVsl";

/** Paramètres imposés par le brief du hook. */
export const HOOK = {
  fps: 30,
  width: 1080,
  height: 1920,
  durationInFrames: 120,
} as const;

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
        durationInFrames={GOOGLE_VSL_DURATION}
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
      {/*
        Version courte TikTok (~45 s) : mêmes composants, même voix off,
        montage resserré. Ne modifie ni ne consomme les timecodes de
        `DpaTapFullVsl` — sa timeline tient en tête de `DpaTapTikTokShort.tsx`.
      */}
      <Composition
        id="DpaTapTikTokShort"
        component={DpaTapTikTokShort}
        durationInFrames={TIKTOK_SHORT_DURATION}
        fps={HOOK.fps}
        width={HOOK.width}
        height={HOOK.height}
      />
      <Composition
        id="DpaTapCommerceVsl"
        component={DpaTapCommerceVsl}
        durationInFrames={COMMERCE_VSL_DURATION}
        fps={HOOK.fps}
        width={HOOK.width}
        height={HOOK.height}
      />
    </>
  );
};
