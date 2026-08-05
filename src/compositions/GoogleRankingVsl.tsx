/**
 * GoogleRankingVsl — le hook validé, prolongé sans coupure.
 *
 * Frames 0 → 119 : <GoogleRankingHook /> est rendu tel quel, à la même frame
 * que dans sa propre composition. Rien n'est enveloppé dans une <Sequence>,
 * aucune prop n'est passée : ces 120 frames sont strictement identiques à la
 * version validée. Toutes les animations du hook étant bornées (springs
 * amortis, interpolations en "clamp"), continuer à le rendre au-delà de la
 * frame 119 le laisse figé sur son état final — la première place, 5,0, (1 k).
 *
 * À partir de la frame 120 :
 *   1. la page Google descend (l'utilisateur remonte la page) ;
 *   2. un voile blanc se fond par-dessus la partie haute, libérant l'espace ;
 *   3. un trait part du bord haut de la fiche première et se divise en trois
 *      critères (voir CriteriaDiagram).
 */

import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { G, LAYOUT } from "../config/google-ui";
import { GoogleRankingHook } from "./GoogleRankingHook";
import { CriteriaDiagram, reviewFocus } from "../components/CriteriaDiagram";
import { ReviewFlow } from "../components/ReviewFlow";
import {
  PROBLEM_DURATION,
  PROBLEM_START,
  ReviewCollectionProblem,
  SCENE_OUT,
} from "../components/ReviewCollectionProblem";

/**
 * Durée totale de la composition — UNIQUE source de vérité, calculée depuis la
 * fin réelle de la scène « difficulté + question ». Root.tsx et DpaTapFullVsl
 * importent cette constante, personne ne la recopie ni ne la code en dur.
 *
 *   0 → 119    le hook validé ;
 *   120 → 580   arbre des trois critères, limites puis réputation renforcée ;
 *   581 → 1223 question, parcours classique et constat d'abandon.
 */
export const GOOGLE_VSL_DURATION = PROBLEM_START + PROBLEM_DURATION;

/** Dernière frame du hook validé. La suite commence juste après. */
export const HOOK_END_FRAME = 120;

/** Amplitude du défilement, en pixels. */
const SCROLL_DISTANCE = 560;

/** Défilement : départ immédiat après le hook, ressort très amorti. */
const SCROLL_SPRING = { damping: 200, mass: 1.1, stiffness: 62 };
const SCROLL_DURATION = 42;

/** Fondu du voile blanc sur la partie haute de la page. */
const VEIL_FADE = [HOOK_END_FRAME + 8, HOOK_END_FRAME + 44] as const;

/**
 * Fondu des trois fiches concurrentes, sous la fiche première.
 * Terminé à la frame 168, bien avant que les branches ne se tracent (184).
 */
const COMPETITORS_FADE = [HOOK_END_FRAME + 8, HOOK_END_FRAME + 48] as const;

/**
 * Ordonnée du haut de la liste dans la page, additionnée depuis LAYOUT :
 * la fiche première commence exactement là.
 */
const LIST_TOP =
  LAYOUT.pagePaddingTop +
  LAYOUT.logoHeight +
  LAYOUT.headerGap +
  LAYOUT.searchBarHeight +
  LAYOUT.sectionTitleMarginTop +
  LAYOUT.sectionTitleHeight +
  LAYOUT.sectionTitleMarginBottom +
  LAYOUT.mapHeight +
  LAYOUT.listMarginTop;

export const GoogleRankingVsl: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  /**
   * 0 avant la fin du hook : les 120 premières frames ne sont pas décalées
   * d'un seul pixel.
   */
  const scrollY =
    spring({
      frame: frame - HOOK_END_FRAME,
      fps,
      config: SCROLL_SPRING,
      durationInFrames: SCROLL_DURATION,
    }) * SCROLL_DISTANCE;

  /** Bords haut et bas de la fiche première, une fois la page descendue. */
  const cardTop = LIST_TOP + scrollY;
  const cardBottom = cardTop + LAYOUT.cardHeight;

  const veil = interpolate(frame, [VEIL_FADE[0], VEIL_FADE[1]], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const competitorsVeil = interpolate(
    frame,
    [COMPETITORS_FADE[0], COMPETITORS_FADE[1]],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  /**
   * Sortie de tout le premier acte — page Google, arbre, avis. Elle démarre
   * APRÈS le temps de pose sur la pastille « Réputation » renforcée et
   * chevauche l'entrée des clients satisfaits : l'histoire se prolonge, elle
   * ne recommence pas. Un très léger retrait d'échelle accompagne le fondu.
   */
  const sceneOut = interpolate(frame, [SCENE_OUT[0], SCENE_OUT[1]], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });

  return (
    <AbsoluteFill style={{ backgroundColor: G.white }}>
      {/*
        Premier acte. Il est entièrement démonté une fois invisible : inutile
        de rejouer le hook et l'arbre pendant les 230 frames de la scène
        suivante.
      */}
      {frame <= SCENE_OUT[1] ? (
        <AbsoluteFill>
          {/*
            Aucune mise à l'échelle sur ce groupe : la page Google se prolonge
            sous la frame 1920 (les fiches concurrentes suivantes), et le
            moindre retrait ferait remonter ce contenu dans le cadre, sous le
            bord bas du voile blanc interne. Le fondu suffit.
          */}
          {/*
            La page Google, inchangée, simplement déplacée en bloc.
            `ratingFocus` vaut 0 jusqu'à la frame 352 : le hook et toute la
            montée en première place restent rigoureusement identiques.
          */}
          <AbsoluteFill style={{ translate: `0px ${scrollY}px` }}>
            <GoogleRankingHook ratingFocus={reviewFocus(frame)} />
          </AbsoluteFill>

          {/*
            Voile blanc au-dessus de la fiche première : il fait disparaître en
            fondu le logo, la recherche et la carte, sans rien modifier de la
            page elle-même. Son bord bas suit la fiche, il ne la recouvre donc
            jamais.
          */}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: "100%",
              height: cardTop,
              backgroundColor: G.white,
              opacity: veil,
            }}
          />

          {/*
            Voile symétrique sous la fiche première : les trois concurrents se
            dissolvent pendant le déplacement de la page. Son bord haut est
            exactement le bord bas de la fiche conservée, qui reste intacte et
            devient le seul point d'ancrage de la composition.
          */}
          <div
            style={{
              position: "absolute",
              left: 0,
              // 1 px de recouvrement : le ressort du défilement donne une position
              // sous-pixel, et le séparateur de la fiche suivante laisserait sinon
              // un filet gris visible. Cette bande n'empiète que sur la marge
              // basse, vide, de la fiche conservée.
              top: cardBottom - 1,
              width: "100%",
              height: 1920 - cardBottom + 1,
              backgroundColor: G.white,
              opacity: competitorsVeil,
            }}
          />

          {/*
            Flux d'avis : trois vrais avis Google partent du bloc noté de la
            fiche et remontent vers la branche verte. Rendu AVANT le diagramme :
            chaque avis glisse donc sous la pastille « Réputation » et s'y
            absorbe, sans jamais masquer ni la branche, ni le libellé.
          */}
          <ReviewFlow originY={cardTop} />

          {/* Trait, branches et critères */}
          <CriteriaDiagram originY={cardTop} />
        </AbsoluteFill>
      ) : null}

      {/*
        Sortie du premier acte : un voile blanc qui monte PAR-DESSUS lui, et non
        une opacité posée sur le groupe. C'est indispensable — baisser l'opacité
        de l'ensemble rendrait aussi translucides les deux voiles internes, et
        les fiches concurrentes qu'ils masquent réapparaîtraient en transparence.
        Sur fond blanc, le résultat visuel est le même : un fondu propre.
      */}
      {frame <= SCENE_OUT[1] ? (
        <AbsoluteFill
          style={{ backgroundColor: G.white, opacity: 1 - sceneOut }}
        />
      ) : null}

      {/*
        Second acte : les clients satisfaits, le parcours classique trop long,
        les abandons, puis la question tenue pour la voix off. Monté dans sa
        propre <Sequence> : sa frame locale part de 0, ses repères ne dépendent
        jamais d'un nombre absolu recopié.
      */}
      <Sequence
        from={PROBLEM_START}
        durationInFrames={PROBLEM_DURATION}
        name="Difficulté à récolter les avis + question"
      >
        <ReviewCollectionProblem />
      </Sequence>
    </AbsoluteFill>
  );
};
