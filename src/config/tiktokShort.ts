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
import type { DpaTiming } from "../dpa/timing";

/**
 * Repères visuels du Short — CE SONT LES VALEURS À MODIFIER.
 *
 * Dans le reel NFC, chaque ligne pilote réellement sa propre animation. Par
 * exemple, modifier `phoneStart` déplace le téléphone sans déplacer la plaque,
 * la notification ou la page Google.
 */
const SCENE_BEATS = {
  // ── Ouverture : aucune scène avant cette question ──
  questionStart: 0,
  questionEnd: 2.533333, // fin de son fondu de sortie (frame 76)

  // ── Parcours classique repris de DpaTapFullVsl ──
  classicJourneyStart: 2.533333,
  classicJourneyEnd: 12.733333,

  frictionStart: 12.733333,
  frictionEnd: 19.963333,

  // ── Reel NFC : chaque ligne contrôle vraiment sa sous-scène ──
  plaqueVisualStart: 19.963333, // transition vers la plaque
  plaqueMoveStart: 23.133333, // la plaque quitte le centre
  phoneStart: 23.933333, // entrée du téléphone
  phoneContact: 26.733333, // contact NFC et ondes
  notificationStart: 28.2, // apparition de la notification
  notificationTap: 29.0, // pression sur la notification
  safariStart: 29.166667, // ouverture de Safari dans l'iPhone
  phoneCloseUpStart: 29.366667, // début du rapprochement de l'iPhone
  phoneCloseUpEnd: 30.3, // iPhone arrivé en gros plan
  pageOpenStart: 31.066667, // apparition de la page d'avis Google
  reviewStart: 33.5, // page prête pour l'interaction
  starsStart: 34.1, // première étoile sélectionnée
  publishStart: 36.533333, // pression sur « Publier »
  publishFlash: 36.666667, // flash de confirmation
  successStart: 37.133333, // écran « +1 avis »
  plaqueVisualEnd: 41.266667, // fin du reel sous le payoff

  payoffStart: 32.033333,
  payoffEnd: 41.266667,

  ctaStart: 41.266667,
  ctaEnd: 43.6,
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

  questionStart: shortSecondsToFrame(TIKTOK_SHORT.beats.questionStart),
  questionEnd: shortSecondsToFrame(TIKTOK_SHORT.beats.questionEnd),

  classicJourneyStart: shortSecondsToFrame(
    TIKTOK_SHORT.beats.classicJourneyStart,
  ),
  classicJourneyEnd: shortSecondsToFrame(
    TIKTOK_SHORT.beats.classicJourneyEnd,
  ),

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
  plaqueMoveStart: shortSecondsToFrame(TIKTOK_SHORT.beats.plaqueMoveStart),
  phoneStart: shortSecondsToFrame(TIKTOK_SHORT.beats.phoneStart),
  phoneContact: shortSecondsToFrame(TIKTOK_SHORT.beats.phoneContact),
  notificationStart: shortSecondsToFrame(TIKTOK_SHORT.beats.notificationStart),
  notificationTap: shortSecondsToFrame(TIKTOK_SHORT.beats.notificationTap),
  safariStart: shortSecondsToFrame(TIKTOK_SHORT.beats.safariStart),
  phoneCloseUpStart: shortSecondsToFrame(
    TIKTOK_SHORT.beats.phoneCloseUpStart,
  ),
  phoneCloseUpEnd: shortSecondsToFrame(TIKTOK_SHORT.beats.phoneCloseUpEnd),
  pageOpenStart: shortSecondsToFrame(TIKTOK_SHORT.beats.pageOpenStart),
  reviewStart: shortSecondsToFrame(TIKTOK_SHORT.beats.reviewStart),
  starsStart: shortSecondsToFrame(TIKTOK_SHORT.beats.starsStart),
  publishStart: shortSecondsToFrame(TIKTOK_SHORT.beats.publishStart),
  publishFlash: shortSecondsToFrame(TIKTOK_SHORT.beats.publishFlash),
  successStart: shortSecondsToFrame(TIKTOK_SHORT.beats.successStart),
  plaqueVisualEnd: shortSecondsToFrame(TIKTOK_SHORT.beats.plaqueVisualEnd),

  payoffStart: shortSecondsToFrame(TIKTOK_SHORT.beats.payoffStart),
  rankingPageIn: shortSecondsToFrame(TIKTOK_SHORT.beats.rankingPageIn),
  rankingClimbStart: shortSecondsToFrame(TIKTOK_SHORT.beats.rankingClimbStart),
  rankingFirstPlace: shortSecondsToFrame(TIKTOK_SHORT.beats.rankingFirstPlace),
  payoffEnd: shortSecondsToFrame(TIKTOK_SHORT.beats.payoffEnd),

  ctaStart: shortSecondsToFrame(TIKTOK_SHORT.beats.ctaStart),
  ctaEnd: shortSecondsToFrame(TIKTOK_SHORT.beats.ctaEnd),
} as const;

/**
 * Timeline LOCALE réellement consommée par `DpaTapReelBlue` dans le Short.
 * Chaque repère éditable ci-dessus est traduit depuis la timeline globale du
 * Short vers la frame locale du reel. `DpaTapFullVsl` n'utilise pas cet objet.
 */
const dpaLocal = (shortFrame: number) =>
  shortFrame - TIKTOK_SHORT_FRAMES.plaqueVisualStart;

export const TIKTOK_SHORT_DPA_TIMING: DpaTiming = {
  hookStart: 0,
  plaqueMove: dpaLocal(TIKTOK_SHORT_FRAMES.plaqueMoveStart),
  contactStart: dpaLocal(TIKTOK_SHORT_FRAMES.phoneStart),
  contact: dpaLocal(TIKTOK_SHORT_FRAMES.phoneContact),
  notifStart: dpaLocal(TIKTOK_SHORT_FRAMES.notificationStart),
  notifTap: dpaLocal(TIKTOK_SHORT_FRAMES.notificationTap),
  /** Le retrait de la bannière commence une frame avant Safari. */
  notifExitStart: dpaLocal(TIKTOK_SHORT_FRAMES.safariStart) - 1,
  safariStart: dpaLocal(TIKTOK_SHORT_FRAMES.safariStart),
  pageStart: dpaLocal(TIKTOK_SHORT_FRAMES.pageOpenStart),
  closeUpStart: dpaLocal(TIKTOK_SHORT_FRAMES.phoneCloseUpStart),
  closeUpEnd: dpaLocal(TIKTOK_SHORT_FRAMES.phoneCloseUpEnd),
  reviewStart: dpaLocal(TIKTOK_SHORT_FRAMES.reviewStart),
  starFirst: dpaLocal(TIKTOK_SHORT_FRAMES.starsStart),
  starStep: 2,
  starReact: 4,
  publishTap: dpaLocal(TIKTOK_SHORT_FRAMES.publishStart),
  publishFlash: dpaLocal(TIKTOK_SHORT_FRAMES.publishFlash),
  successStart: dpaLocal(TIKTOK_SHORT_FRAMES.successStart),
  end: dpaLocal(TIKTOK_SHORT_FRAMES.plaqueVisualEnd),
};

/* -------------------------------------------------------------------------- */
/*  Voix off — coupes dans le fichier d'origine                               */
/* -------------------------------------------------------------------------- */

/**
 * `sourceStart` / `sourceEnd` sont des secondes de la voix off COMPLÈTE
 * (63,7 s) : elles ne servent qu'à découper le MP3. Chaque extrait est ensuite
 * posé sur la frame de la scène à laquelle il appartient — d'où `shortStart`,
 * qui reprend toujours une borne de `TIKTOK_SHORT.beats`.
 *
 * Le Short démarre directement sur « Comment obtenir plus d'avis Google ? ».
 * Le mot « Mais » de la source (19,629 → 19,855 s) est retiré : la coupe part
 * à 19,966667 s, juste avant l'attaque mesurée de « Comment » à 19,9703 s.
 *
 * La question, le parcours classique et la conclusion utilisent un unique
 * extrait continu. Il est donc impossible que leurs voix se superposent.
 */
export const TIKTOK_SHORT_AUDIO = {
  asset: VOICEOVER.asset,
  segments: [
    {
      name: "problème complet",
      shortStart: TIKTOK_SHORT.beats.questionStart,
      sourceStart: 19.966667,
      sourceEnd: 40.033333,
    },
    {
      name: "dpa",
      /**
       * La voix DPA commence exactement après la fin de l'extrait « friction ».
       * Elle ne suit pas `plaqueVisualStart` : cette scène visuelle peut être
       * avancée sans faire démarrer deux voix off en même temps.
       */
      shortStart:
        TIKTOK_SHORT.beats.questionStart + (40.033333 - 19.966667),
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
  /** Frame LOCALE où le parcours reprend après la question. */
  classicJourneySeek: 94,
  /**
   * Arrivées du client vert aux trois étapes. Les deux trajets entre les
   * tuiles durent chacun 71 frames ; la dernière arrivée reste à la frame 227,
   * donc la scène conserve strictement sa durée.
   */
  classicJourneyArrivals: [85, 156, 227] as const,
  /**
   * La carte d'avis commence 8 frames après l'arrivée à la dernière étape et
   * termine son entrée à la frame 260. La scène elle-même ne bouge pas.
   */
  classicJourneyReview: [235, 260] as const,
  /** Frame LOCALE de `ReviewCollectionProblem` affichée à `frictionStart`. */
  frictionSeek: 400,
  /** Frame de `GoogleRankingHook` où la fiche est stabilisée en 1re place. */
  hookSettled: 119,
} as const;
