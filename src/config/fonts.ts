/**
 * Roboto — la police de l'interface Google Search.
 * Chargée via @remotion/google-fonts : le rendu est bloqué tant que
 * la police n'est pas prête (pas de FOUT sur la première frame).
 */

import { loadFont } from "@remotion/google-fonts/Roboto";

const { fontFamily } = loadFont("normal", {
  weights: ["400", "500"],
  subsets: ["latin", "latin-ext"],
});

/** Stack avec repli système au cas où Roboto ne serait pas disponible. */
export const FONT_FAMILY = `${fontFamily}, "Segoe UI", Arial, sans-serif`;
