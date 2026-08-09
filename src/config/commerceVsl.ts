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
    /** Démarre directement sur « Le client approche son téléphone… ». */
    existingActionStart: frame(40.8998),
    existingDemoEnd: frame(51.8),
  },
  beats: {
    questionStart: frame(5.65683),
    questionEnd: frame(10.4612),
    rankingStart: frame(10.4612),
    productStart: frame(15.9954),
    demoStart: frame(19.2166),
    demoEnd: frame(31.5),
  },
} as const;

/** La deuxième voix démarre exactement à la fin de la première. */
export const COMMERCE_VSL_EXISTING_VOICE_START =
  COMMERCE_VSL.audio.newVoiceFirstEnd;

/** La voix finale démarre exactement à la fin de la démonstration vocale. */
export const COMMERCE_VSL_SECOND_VOICE_START =
  COMMERCE_VSL_EXISTING_VOICE_START +
  (COMMERCE_VSL.audio.existingDemoEnd -
    COMMERCE_VSL.audio.existingActionStart);

export const COMMERCE_VSL_DURATION =
  COMMERCE_VSL_SECOND_VOICE_START +
  (COMMERCE_VSL.audio.newVoiceEnd - COMMERCE_VSL.audio.newVoiceSecondStart);

/** Timeline locale du reel DPA : le produit apparaît à 15,99 s. */
export const COMMERCE_DPA_TIMING: DpaTiming = {
  hookStart: 0,
  plaqueMove: 94,
  /** Le téléphone démarre sur le premier mot de la démonstration. */
  contactStart: 127,
  contact: 205,
  notifStart: 205,
  notifTap: 230,
  notifExitStart: 230,
  safariStart: 235,
  pageStart: 300,
  closeUpStart: 250,
  closeUpEnd: 318,
  reviewStart: 314,
  starFirst: 350,
  starStep: 2,
  starReact: 4,
  publishTap: 380,
  publishFlash: 380,
  successStart: 395,
  end: COMMERCE_VSL.beats.demoEnd - COMMERCE_VSL.beats.productStart,
};
