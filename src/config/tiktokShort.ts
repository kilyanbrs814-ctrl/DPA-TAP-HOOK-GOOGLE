/**
 * Timeline du montage court TikTok, mesurée sur le rendu validé.
 *
 * Même modèle que `config/voiceover.ts` : des secondes lisibles, une fonction
 * de conversion, et un objet de frames dérivé automatiquement.
 *
 * ── Deux espaces de temps, jamais mélangés ──────────────────────────────────
 *
 *   • `TIKTOK_SHORT.beats` — secondes DANS LE SHORT (0 → 44,67 s). C'est la
 *     seule échelle que lisent les scènes visuelles.
 *   • `TIKTOK_SHORT_AUDIO` — secondes DANS LA VOIX OFF d'origine (0 → 63,7 s),
 *     uniquement pour dire où couper le MP3.
 *
 * Chaque espace a sa propre fonction de conversion, `shortSecondsToFrame` et
 * `secondsToFrame` : impossible de confondre les deux par accident.
 */

import { VOICEOVER, secondsToFrame } from "./voiceover";

/**
 * Bornes des six scènes — LES SEULES VALEURS À MODIFIER.
 *
 * Déplacer une borne déplace réellement la scène, et tout ce qu'elle contient
 * suit : les repères internes plus bas sont exprimés en décalage depuis ces
 * bornes, jamais en seconde absolue.
 */
const SCENE_BEATS = {
  hookStart: 0,
  hookEnd: 4.0,

  criteriaStart: 4.0,
  criteriaEnd: 13.8,

  frictionStart: 13.8,
  frictionEnd: 17.133333,

  /** Le reel NFC. 636 frames = `DURATION_IN_FRAMES` : garder cet écart. */
  plaqueVisualStart: 17.133333,
  plaqueVisualEnd: 42.333333,

  payoffStart: 33.1,
  payoffEnd: 42.333333,

  ctaStart: 42.333333,
  ctaEnd: 44.666667,
} as const;

/** Entrée de la page Google au début du payoff — 0,4 s = 12 frames. */
const PAYOFF_SWIPE_SECONDS = 0.4;

/**
 * Repères internes, mesurés sur le rendu validé, en DÉCALAGE depuis le début
 * de leur scène.
 *
 * Ils ne pilotent rien : ces animations vivent dans `dpa/constants.ts` et
 * `GoogleRankingHook`. Ils servent à lire et à vérifier une synchro d'un coup
 * d'œil — et comme ils sont relatifs, ils restent justes quand la scène qui
 * les porte est déplacée.
 */
const INTERNAL_OFFSETS = {
  /** Depuis `frictionStart`. */
  frictionSentence1Start: 0.133333, // « Presque aucun client… »
  frictionSentence2Start: 3.566667, // « Ils oublient… »
  frictionSentence3Start: 6.166667, // dernière phrase du bloc

  /** Depuis `plaqueVisualStart`. */
  plaqueStart: 0.766667, // swipe terminé, plaque entièrement centrée
  plaqueMoveStart: 7.066667, // la plaque quitte le centre
  phoneStart: 7.866667, // le téléphone entre par le bas
  phoneContact: 10.666667, // contact NFC : ondes et micro-rebond

  /** Depuis `payoffStart`. */
  rankingClimbStart: 1.733333, // premier dépassement de concurrent
  rankingFirstPlace: 3.666667, // la fiche atteint la 1re place
} as const;

export const TIKTOK_SHORT = {
  /** La fin du CTA EST la fin du film : une seule valeur à tenir à jour. */
  durationSeconds: SCENE_BEATS.ctaEnd,

  beats: {
    ...SCENE_BEATS,

    /** Fin de l'entrée de la page Google. Suit `payoffStart`. */
    rankingPageIn: SCENE_BEATS.payoffStart + PAYOFF_SWIPE_SECONDS,

    frictionSentence1Start:
      SCENE_BEATS.frictionStart + INTERNAL_OFFSETS.frictionSentence1Start,
    frictionSentence2Start:
      SCENE_BEATS.frictionStart + INTERNAL_OFFSETS.frictionSentence2Start,
    frictionSentence3Start:
      SCENE_BEATS.frictionStart + INTERNAL_OFFSETS.frictionSentence3Start,

    plaqueStart: SCENE_BEATS.plaqueVisualStart + INTERNAL_OFFSETS.plaqueStart,
    plaqueMoveStart:
      SCENE_BEATS.plaqueVisualStart + INTERNAL_OFFSETS.plaqueMoveStart,
    phoneStart: SCENE_BEATS.plaqueVisualStart + INTERNAL_OFFSETS.phoneStart,
    phoneContact:
      SCENE_BEATS.plaqueVisualStart + INTERNAL_OFFSETS.phoneContact,

    rankingClimbStart:
      SCENE_BEATS.payoffStart + INTERNAL_OFFSETS.rankingClimbStart,
    rankingFirstPlace:
      SCENE_BEATS.payoffStart + INTERNAL_OFFSETS.rankingFirstPlace,
  },
} as const;

export const TIKTOK_SHORT_FPS = 30;

export const shortSecondsToFrame = (seconds: number) =>
  Math.round(seconds * TIKTOK_SHORT_FPS);

export const TIKTOK_SHORT_FRAMES = {
  total: shortSecondsToFrame(TIKTOK_SHORT.durationSeconds),

  hookStart: shortSecondsToFrame(TIKTOK_SHORT.beats.hookStart),
  hookEnd: shortSecondsToFrame(TIKTOK_SHORT.beats.hookEnd),

  criteriaStart: shortSecondsToFrame(TIKTOK_SHORT.beats.criteriaStart),
  criteriaEnd: shortSecondsToFrame(TIKTOK_SHORT.beats.criteriaEnd),

  frictionStart: shortSecondsToFrame(TIKTOK_SHORT.beats.frictionStart),
  frictionSentence1Start: shortSecondsToFrame(
    TIKTOK_SHORT.beats.frictionSentence1Start,
  ),
  frictionSentence2Start: shortSecondsToFrame(
    TIKTOK_SHORT.beats.frictionSentence2Start,
  ),
  frictionSentence3Start: shortSecondsToFrame(
    TIKTOK_SHORT.beats.frictionSentence3Start,
  ),
  frictionEnd: shortSecondsToFrame(TIKTOK_SHORT.beats.frictionEnd),

  plaqueVisualStart: shortSecondsToFrame(TIKTOK_SHORT.beats.plaqueVisualStart),
  plaqueStart: shortSecondsToFrame(TIKTOK_SHORT.beats.plaqueStart),
  plaqueMoveStart: shortSecondsToFrame(TIKTOK_SHORT.beats.plaqueMoveStart),
  phoneStart: shortSecondsToFrame(TIKTOK_SHORT.beats.phoneStart),
  phoneContact: shortSecondsToFrame(TIKTOK_SHORT.beats.phoneContact),
  plaqueVisualEnd: shortSecondsToFrame(TIKTOK_SHORT.beats.plaqueVisualEnd),

  payoffStart: shortSecondsToFrame(TIKTOK_SHORT.beats.payoffStart),
  rankingPageIn: shortSecondsToFrame(TIKTOK_SHORT.beats.rankingPageIn),
  rankingClimbStart: shortSecondsToFrame(TIKTOK_SHORT.beats.rankingClimbStart),
  rankingFirstPlace: shortSecondsToFrame(TIKTOK_SHORT.beats.rankingFirstPlace),
  payoffEnd: shortSecondsToFrame(TIKTOK_SHORT.beats.payoffEnd),

  ctaStart: shortSecondsToFrame(TIKTOK_SHORT.beats.ctaStart),
  ctaEnd: shortSecondsToFrame(TIKTOK_SHORT.beats.ctaEnd),
} as const;

/* -------------------------------------------------------------------------- */
/*  Voix off — coupes dans le fichier d'origine                               */
/* -------------------------------------------------------------------------- */

/**
 * `sourceStart` / `sourceEnd` sont des secondes de la voix off COMPLÈTE
 * (63,7 s) : elles ne servent qu'à découper le MP3. Chaque extrait est ensuite
 * posé sur la frame de la scène à laquelle il appartient — d'où `shortStart`,
 * qui reprend toujours une borne de `TIKTOK_SHORT.beats`.
 *
 * Les deux coupes (4,00 s et 13,80 s dans le Short) tombent dans un silence
 * mesuré du MP3, jamais en plein mot. Les extraits « friction » et « dpa » se
 * touchent (40,033 s → 40,033 s) : de 13,80 s à la fin, la voix est continue.
 */
export const TIKTOK_SHORT_AUDIO = {
  asset: VOICEOVER.asset,
  segments: [
    {
      name: "hook",
      shortStart: TIKTOK_SHORT.beats.hookStart,
      sourceStart: 0,
      sourceEnd: 3.366667,
    },
    {
      name: "criteria",
      shortStart: TIKTOK_SHORT.beats.criteriaStart,
      sourceStart: 12.033333,
      sourceEnd: 21.833333,
    },
    {
      name: "friction",
      shortStart: TIKTOK_SHORT.beats.frictionStart,
      sourceStart: 32.7,
      sourceEnd: 40.033333,
    },
    {
      name: "dpa",
      shortStart: TIKTOK_SHORT.beats.plaqueVisualStart,
      sourceStart: 40.033333,
      sourceEnd: 61.233333,
    },
  ],
} as const;

/** Les mêmes extraits en frames, prêts à être posés dans une `<Sequence>`. */
export const TIKTOK_SHORT_AUDIO_FRAMES = TIKTOK_SHORT_AUDIO.segments.map(
  (segment) => ({
    name: segment.name,
    /** Frame du Short où l'extrait démarre. */
    start: shortSecondsToFrame(segment.shortStart),
    /** Frames de la voix off d'origine — d'où `secondsToFrame`. */
    trimBefore: secondsToFrame(segment.sourceStart),
    trimAfter: secondsToFrame(segment.sourceEnd),
  }),
);

/* -------------------------------------------------------------------------- */
/*  Frames internes des composants rejoués                                    */
/* -------------------------------------------------------------------------- */

/**
 * Ce ne sont ni des secondes ni des frames du Short, mais des frames DE LEUR
 * PROPRE composant : la position à laquelle on le reprend en cours de route.
 * Elles n'ont donc rien à faire dans `beats`.
 */
export const TIKTOK_SHORT_SOURCE_FRAMES = {
  /** Frame de `GoogleRankingVsl` affichée à `criteriaStart`. */
  criteriaSeek: 361,
  /** Frame LOCALE de `ReviewCollectionProblem` affichée à `frictionStart`. */
  frictionSeek: 400,
  /** Frame de `GoogleRankingHook` où la fiche est stabilisée en 1re place. */
  hookSettled: 119,
} as const;
