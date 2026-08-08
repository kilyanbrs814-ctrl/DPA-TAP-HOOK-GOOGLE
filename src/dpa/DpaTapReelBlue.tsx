import React from "react";
import { AbsoluteFill } from "remotion";
import { COLORS } from "./constants";
import { Sfx } from "./Sfx";
import { WorldStage } from "./WorldStage";
import { DpaTimingProvider, type DpaTiming } from "./timing";

/**
 * DPA TAP — Reel NFC, plaque bleue.
 *
 * 0.00–1.20 s  hook: 3D plaque reveal, no text
 * 1.20–2.60 s  the phone comes to the plaque, NFC rings, micro contact bounce,
 *              then it holds perfectly still
 * 2.60–3.40 s  iOS notification, tap, banner dismissal
 * 3.40–4.70 s  Safari opens INSIDE the screen and the phone comes closer
 * 4.70–7.50 s  five stars and "Publier" — still inside the iPhone screen
 * 7.50–10.1 s  "+1 avis", then a static hold — the reel ends on this shot
 *
 * There is no signature scene and no exit transition: after the confirmation
 * appears, the phone keeps its exact close-up size and position until the last
 * frame. Nothing shrinks, nothing slides, nothing is added on top.
 *
 * The camera never enters the screen and no interface is ever mounted at the
 * composition root: from the first frame to the last, the only container of the
 * UI is `PhoneMockup`. Hide the phone and every Google pixel goes with it.
 * Every timing comes from `constants.ts`.
 *
 * Fond : `COLORS.stage`, soit #FFFFFF — exactement le fond du hook Google. Le
 * `<Backdrop />` (charbon + dégradés + halos + grain + vignette) a été retiré,
 * il n'existe plus aucune couche plein cadre entre ce blanc et les objets.
 *
 * Le `from={4}` qui était posé sur cette `<AbsoluteFill>` racine a lui aussi été
 * retiré : `<AbsoluteFill from>` monte un `<Sequence>`, il décalait donc TOUTE
 * la séquence de 4 frames. Conséquences : 4 frames vides au raccord avec le
 * hook, et les 4 dernières frames du reel tombaient hors de
 * `DURATION_IN_FRAMES`. Sans lui, la plaque démarre sur la première frame de la
 * séquence et tous les timings `T.*` gardent leurs écarts relatifs.
 */
export const DpaTapReelBlue: React.FC<{
  /** Omission = timeline historique de DpaTapFullVsl, strictement inchangée. */
  readonly timing?: DpaTiming;
}> = ({ timing }) => {
  return (
    <DpaTimingProvider timing={timing}>
      <AbsoluteFill style={{ backgroundColor: COLORS.stage }}>
        {/*
          One single physical stage for the whole reel — plaque, iPhone,
          notification, Safari, the Google page and the "+1 avis" confirmation.
        */}
        <WorldStage />
        <Sfx />
      </AbsoluteFill>
    </DpaTimingProvider>
  );
};
