import type { DpaTiming } from "../dpa/timing";

export const COMMERCE_VSL_FPS = 30;

const frame = (seconds: number) => Math.round(seconds * COMMERCE_VSL_FPS);

/**
 * Montage de la nouvelle VSL commerces.
 *
 * La nouvelle voix contient volontairement un silence entre 20,216 s et
 * 20,881 s. Il est remplacé par le parcours NFC existant, qui dure 15 s.
 */
export const COMMERCE_VSL = {
  audio: {
    newVoice: "assets/voiceover/dpa-tap-commerce-vsl-fr.mp3",
    existingVoice: "assets/voiceover/dpa-tap-vsl-fr.mp3",
    newVoiceFirstEnd: frame(20.2166),
    newVoiceSecondStart: frame(20.8809),
    newVoiceEnd: Math.ceil(25.626063 * COMMERCE_VSL_FPS),
    /**
     * L'attaque réelle de « le client approche son téléphone… » commence à
     * 45,75 s. Le silence 47,411 → 47,900 est retiré au montage : toute la
     * phrase est conservée sans rallonger la démonstration de 15 secondes.
     */
    existingLeadStart: frame(45.75),
    existingLeadEnd: frame(47.4109),
    existingActionStart: frame(47.8998),
    existingDemoEnd: frame(61.242),
  },
  beats: {
    questionStart: frame(5.65683),
    questionEnd: frame(10.4612),
    rankingStart: frame(10.4612),
    productStart: frame(15.9954),
    demoStart: frame(20.2166),
    demoEnd: frame(20.2166) + frame(15),
  },
} as const;

export const COMMERCE_VSL_DURATION =
  COMMERCE_VSL.beats.demoEnd +
  (COMMERCE_VSL.audio.newVoiceEnd - COMMERCE_VSL.audio.newVoiceSecondStart);

/** Timeline locale du reel DPA : le produit apparaît à 15,99 s. */
export const COMMERCE_DPA_TIMING: DpaTiming = {
  hookStart: 0,
  plaqueMove: 94,
  /** Téléphone et interface recalés après retrait du silence de 0,489 s. */
  contactStart: 176,
  contact: 260,
  notifStart: 304,
  notifTap: 328,
  notifExitStart: 332,
  safariStart: 333,
  pageStart: 390,
  closeUpStart: 339,
  closeUpEnd: 367,
  reviewStart: 463,
  starFirst: 481,
  starStep: 2,
  starReact: 4,
  publishTap: 554,
  publishFlash: 558,
  successStart: 572,
  end: COMMERCE_VSL.beats.demoEnd - COMMERCE_VSL.beats.productStart,
};
