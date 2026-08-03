/**
 * Single source of truth for the DPA TAP reel: colors, layout, timings, springs.
 *
 * ── Duration knob ────────────────────────────────────────────────────────────
 * `DURATION_SCALE` is the one place to make every scene longer or shorter.
 * 1 = the reference cut. 1.2 = 20 % slower, 0.85 = tighter.
 * The composition duration in `Root.tsx` is derived from it, so nothing else
 * needs to be touched.
 */

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

export const DURATION_SCALE = 1;

/** Scene lengths in seconds, before `DURATION_SCALE` is applied. */
export const SCENE_SECONDS = {
  hook: 1.2, // 3D plaque reveal, no text
  contact: 1.4, // phone approaches the plaque, NFC waves, then it settles
  review: 2.8, // stars + "Publier", inside the phone screen
  success: 2.6, // "+1 avis", then a short static hold — the reel ends here
} as const;

const s = (seconds: number) => Math.round(seconds * DURATION_SCALE * FPS);

/**
 * Notification → Safari → close-up, expressed directly in frames because every
 * beat here is a UI micro-animation: it must not stretch with `DURATION_SCALE`,
 * a real iPhone always opens Safari at the same speed.
 */
export const TRANSITION_FRAMES = {
  /** Banner springs in from the top of the screen. */
  notifEnter: 18,
  /** It stays readable before the finger comes down. */
  notifDwell: 6,
  /** Touch-down compression of the banner — a nudge, not a bounce. */
  notifPress: 5,
  /** Banner lifts, shrinks a hair and fades out. */
  notifExit: 7,
  /** Safari surface fades / scales / un-blurs into the screen (0.6 s). */
  safariOpen: 18,
  /** Chrome-only Safari before the Google page paints. */
  safariLoad: 7,
  /** The page itself painting in. */
  pageFade: 8,
  /** Gap between Safari starting to open and the phone starting to come closer. */
  closeUpDelay: 6,
  /** The phone travels to the center of the frame and grows (0.93 s). */
  closeUp: 28,
} as const;

const hookStart = 0;
const contactStart = hookStart + s(SCENE_SECONDS.hook);
/** Phone reaches the plaque and the NFC read happens. */
const contact = contactStart + 26;

/** The phone is fully settled and holds still before the banner arrives. */
const notifStart = contactStart + s(SCENE_SECONDS.contact);
/** Finger presses the notification. */
const notifTap =
  notifStart + TRANSITION_FRAMES.notifEnter + TRANSITION_FRAMES.notifDwell;
/** The banner starts leaving, one frame before Safari takes the screen. */
const notifExitStart = notifTap + TRANSITION_FRAMES.notifPress - 1;
/** Safari begins to occupy the screen — still strictly inside the phone. */
const safariStart = notifTap + TRANSITION_FRAMES.notifPress;
/** The Google page paints inside Safari. */
const pageStart = safariStart + TRANSITION_FRAMES.safariLoad;

/**
 * The whole iPhone — chassis included — comes towards the camera and recenters.
 * It only starts once Safari is visibly opening, so the two moves read as cause
 * and effect rather than as one big camera push.
 */
const closeUpStart = safariStart + TRANSITION_FRAMES.closeUpDelay;
const closeUpEnd = closeUpStart + TRANSITION_FRAMES.closeUp;

/** The phone is parked at its close-up: the review interaction can start. */
const reviewStart = closeUpEnd;
const successStart = reviewStart + s(SCENE_SECONDS.review);

/**
 * The reel ends on the "+1 avis" screen, phone at full close-up size, held
 * still. There is no signature scene and no exit transition: nothing shrinks,
 * nothing slides, the last frame is the same shot as the first success frame.
 */
const end = successStart + s(SCENE_SECONDS.success);

/**
 * Absolute frame numbers. Everything in the reel reads its timing from here.
 */
export const T = {
  hookStart,

  /**
   * Frame à laquelle la plaque quitte le centre du cadre pour rejoindre sa
   * position de contact. Avant elle est immobile, pile au centre (540 × 960) :
   * elle apparaît, on la lit, puis elle se déplace — et seulement parce que le
   * téléphone arrive (il devient visible à `contactStart - 6`).
   */
  plaqueMove: contactStart - 8,

  contactStart,
  contact,

  notifStart,
  notifTap,
  notifExitStart,
  safariStart,
  pageStart,
  closeUpStart,
  closeUpEnd,

  reviewStart,
  /**
   * Five quick taps: the stars are triggered 2 frames apart, so the whole row
   * is selected in 8 frames (0.27 s) and settled 4 frames later.
   */
  starFirst: reviewStart + 30,
  starStep: 2,
  starReact: 4,
  /** Finger presses "Publier", ~1 s after the last star. */
  publishTap: successStart - 16,
  /**
   * The confirmation whiteout starts to build here and peaks exactly on
   * `successStart`, so the swap from the phone to the full-screen "+1 avis"
   * card happens under an opaque frame — no pop, no black frame.
   */
  publishFlash: successStart - 14,

  successStart,
  end,
} as const;

export const DURATION_IN_FRAMES = T.end;

/** Reels safe area — nothing essential may live outside of it. */
export const SAFE = {
  top: 220,
  bottom: 320,
  right: 110,
  left: 110,
} as const;

export const COLORS = {
  /**
   * Fond du plateau. Blanc pur, strictement identique au fond du hook Google
   * (`G.white`) : la seconde partie du film est jouée sur la même page blanche,
   * il n'y a donc plus ni charbon, ni dégradé, ni vignette (voir `WorldStage`).
   */
  stage: "#FFFFFF",
  white: "#ffffff",
  textDim: "rgba(255,255,255,0.62)",
  googleBlue: "#4285f4",
  googleBlueSoft: "#8ab4f8",
  googleYellow: "#fabb05",
  googleGreen: "#34a853",
  googleRed: "#ea4335",
  dpaPurple: "#7b2fbe",
  /** Background of the Google screenshots — also the Safari page background. */
  screenBg: "#121212",
  /** Safari chrome (bottom toolbar). */
  safariChrome: "#1b1b1d",
  safariField: "#2c2c2e",
  successBg: "#202020",
} as const;

export const FONT_STACK =
  '-apple-system, BlinkMacSystemFont, "Segoe UI Variable Display", "Segoe UI", Inter, Roboto, "Helvetica Neue", Arial, sans-serif';

/** Shared spring configs. */
export const SPRINGS = {
  /** Smooth, no visible overshoot — used for camera and layout moves. */
  glide: { damping: 200, mass: 0.8, stiffness: 120 },
  /** Product reveal: a hint of life, still premium. */
  reveal: { damping: 24, mass: 0.9, stiffness: 90 },
  /** UI feedback: stars, notification, buttons. */
  snap: { damping: 14, mass: 0.42, stiffness: 220 },
  /** Micro bounce on NFC contact. */
  contact: { damping: 11, mass: 0.35, stiffness: 260 },
  /** iOS app opening: fast, fully damped, never overshoots. */
  ios: { damping: 26, mass: 0.55, stiffness: 170 },
} as const;

/**
 * Phone mockup geometry (composition pixels at scale 1).
 * The screen is the only container of the UI for the whole reel, so every
 * on-screen coordinate downstream is expressed in `screenWidth` × `screenHeight`.
 */
export const PHONE = {
  width: 464,
  height: 948,
  radius: 62,
  bezel: 13,
  get screenWidth() {
    return this.width - this.bezel * 2;
  },
  get screenHeight() {
    return this.height - this.bezel * 2;
  },
  /** Resting position of the phone center, once it sits on the plaque. */
  restX: 620,
  restY: 1010,
} as const;

/**
 * Where the phone parks at the end of the close-up.
 *
 * 464 × 1.85 = 858 px wide → 79.5 % of the 1080 px frame, i.e. inside the
 * 75–82 % target: the Google page is comfortably readable while the titanium
 * frame, the rounded corners and the Dynamic Island all stay in shot with a
 * ~111 px horizontal and ~83 px vertical margin.
 */
export const PHONE_CLOSEUP = {
  centerX: WIDTH / 2,
  centerY: HEIGHT / 2,
  scale: 1.85,
} as const;


/**
 * iOS chrome drawn inside the phone screen, in local screen pixels.
 * Proportions match an iPhone 15: status bar ≈ 6.3 % of the screen height,
 * Safari bottom toolbar + home indicator ≈ 10.4 %.
 */
export const SCREEN = {
  statusBarHeight: 58,
  safariBarHeight: 96,
  get contentTop() {
    return this.statusBarHeight;
  },
  get contentHeight() {
    return PHONE.screenHeight - this.statusBarHeight - this.safariBarHeight;
  },
} as const;

/** Plaque: 10 × 10 cm, 2 mm thick — the GLB is modelled in meters. */
export const PLAQUE = {
  glbSize: 0.1,
  /**
   * Ancre écran du centre de la plaque pendant le hook : le centre EXACT du
   * cadre 1080 × 1920. La caméra 3D est sur l'axe, donc à cet endroit la
   * plaque n'a aucune déformation de perspective — elle est vue strictement de
   * face, bords horizontaux et verticaux parfaitement d'équerre.
   */
  hookAnchor: { x: 540, y: 960 },
  /** … and once the phone comes in, it sits slightly up and to the left. */
  restAnchor: { x: 445, y: 672 },
  /** How far it is pushed back once the phone owns the frame. */
  closeUpOpacity: 0.22,
} as const;

/**
 * Geometry of `page-avis-google.png` (1024 × 1536), expressed in source pixels.
 * The overlays (filled stars, pressed button, taps) are placed with these
 * numbers, rescaled to the phone screen, so they land exactly on the screenshot.
 */
export const REVIEW_PAGE = {
  srcWidth: 1024,
  srcHeight: 1536,
  starCentersX: [258, 377, 496, 615, 734],
  starCenterY: 367,
  starSize: 68,
  publishButton: { x: 40, y: 1405, width: 910, height: 85, radius: 43 },
  /**
   * The user's profile picture, baked into the screenshot. This is the single
   * source of truth for the avatar: the "+1 avis" screen re-crops this very
   * image rather than showing its own, so the user is visibly the same before
   * and after publishing.
   */
  /**
   * Disque de l'avatar, mesuré sur le fichier : centre (130 ; 224), diamètre
   * 113 px. C'est la source unique de la photo de profil — l'écran « +1 avis »
   * recadre exactement ces pixels-là.
   */
  avatar: { x: 130, y: 224, size: 113 },
} as const;

export const FINAL_SCREEN = {
  srcWidth: 968,
  srcHeight: 1624,
  /**
   * The placeholder avatar baked into `ecran-final-plus-1-avis.png`. It is
   * covered with a card-coloured disc and replaced by `REVIEW_PAGE.avatar`.
   * Disque mesuré sur le fichier : centre (479 ; 579,5), diamètre 134 px — la
   * valeur 129 laissait un anneau de fond de carte autour de la photo.
   */
  avatar: { x: 479, y: 579.5, size: 134 },
} as const;

/**
 * Seuls les fichiers réellement chargés par la séquence sont listés ici — et
 * ce sont exactement ceux qui ont été copiés dans `public/assets/`. Les entrées
 * mortes du projet d'origine (plaque-bleue.png, plaque-noire.png, logo-dpa.png,
 * capture-telephone.mp4) n'étaient référencées par aucun `staticFile()`.
 */
export const ASSETS = {
  plaqueGlb: "assets/plaque-bleue-3d.glb",
  notification: "assets/notification-nfc.png",
  reviewPage: "assets/page-avis-google.png",
  finalScreen: "assets/ecran-final-plus-1-avis.png",
  sfx: {
    nfc: "assets/sfx/nfc.wav",
    notification: "assets/sfx/notification.wav",
    star: "assets/sfx/star.wav",
    publish: "assets/sfx/publish.wav",
    success: "assets/sfx/success.wav",
  },
} as const;

/** Frame at which star index `i` starts reacting. */
export const starFrame = (index: number) => T.starFirst + index * T.starStep;
