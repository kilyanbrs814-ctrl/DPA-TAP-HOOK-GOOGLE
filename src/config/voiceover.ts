/**
 * Timeline de référence de la VSL, mesurée sur le fichier ElevenLabs final.
 *
 * Toutes les grandes scènes se calent sur ces repères. Les animations internes
 * peuvent évoluer, mais leurs jonctions ne doivent plus être réglées à l'œil :
 * la voix off reste l'unique horloge du film.
 */

export const VOICEOVER = {
  asset: "assets/voiceover/dpa-tap-vsl-fr.mp3",
  durationSeconds: 63.712625,
  /** Coupe avant « Découvrez DPA TAP », mal prononcé dans cette génération. */
  spokenEndSeconds: 61.3,
  beats: {
    hookEnd: 3.38,
    criteriaStart: 4.438,
    criteriaEnd: 10.905,
    controlStart: 12.045,
    controlEnd: 18.596,
    questionStart: 19.629,
    questionEnd: 21.818,
    classicJourneyStart: 22.945,
    classicJourneyEnd: 35.221,
    frictionStart: 36.274,
    frictionEnd: 40.025,
    plaqueStart: 40.811,
    plaquePromiseEnd: 47.396,
    phoneStart: 47.9,
    phoneContactEnd: 51.309,
    reviewActionStart: 52.182,
    reviewActionEnd: 57.098,
    salesEndStart: 58.081,
    brandLineStart: 62.007,
  },
} as const;

export const FPS = 30;
export const secondsToFrame = (seconds: number) => Math.round(seconds * FPS);

export const VOICEOVER_FRAMES = {
  total: Math.ceil(VOICEOVER.durationSeconds * FPS),
  spokenEnd: secondsToFrame(VOICEOVER.spokenEndSeconds),
  criteriaStart: secondsToFrame(VOICEOVER.beats.criteriaStart),
  criteriaEnd: secondsToFrame(VOICEOVER.beats.criteriaEnd),
  controlStart: secondsToFrame(VOICEOVER.beats.controlStart),
  controlEnd: secondsToFrame(VOICEOVER.beats.controlEnd),
  questionStart: secondsToFrame(VOICEOVER.beats.questionStart),
  questionEnd: secondsToFrame(VOICEOVER.beats.questionEnd),
  classicJourneyStart: secondsToFrame(VOICEOVER.beats.classicJourneyStart),
  classicJourneyEnd: secondsToFrame(VOICEOVER.beats.classicJourneyEnd),
  frictionStart: secondsToFrame(VOICEOVER.beats.frictionStart),
  frictionEnd: secondsToFrame(VOICEOVER.beats.frictionEnd),
  plaqueStart: secondsToFrame(VOICEOVER.beats.plaqueStart),
  phoneStart: secondsToFrame(VOICEOVER.beats.phoneStart),
  phoneContactEnd: secondsToFrame(VOICEOVER.beats.phoneContactEnd),
  reviewActionStart: secondsToFrame(VOICEOVER.beats.reviewActionStart),
  reviewActionEnd: secondsToFrame(VOICEOVER.beats.reviewActionEnd),
  salesEndStart: secondsToFrame(VOICEOVER.beats.salesEndStart),
} as const;
