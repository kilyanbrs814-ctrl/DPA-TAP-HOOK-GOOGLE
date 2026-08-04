/**
 * GoogleRankingHook — hook d'ouverture de la VSL DPA TAP.
 *
 * 1080 × 1920, 30 fps, 120 frames (4 s).
 * Une page de résultats locaux Google : "Votre établissement" part 4e sans
 * avis, encaisse des avis 5 étoiles, puis dépasse un à un les trois
 * concurrents jusqu'à la 1re place.
 *
 * Tout est piloté par useCurrentFrame() : aucune animation CSS temporelle,
 * donc un rendu strictement déterministe.
 */

import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { CONTENT_WIDTH, G, LAYOUT, TYPE, WEIGHT } from "../config/google-ui";
import { FONT_FAMILY } from "../config/fonts";
import { BUSINESSES, formatReviewCount } from "../data/businesses";
import { GoogleSearchBar } from "../components/GoogleSearchBar";
import { GoogleLocalMap } from "../components/GoogleLocalMap";
import { BusinessCard } from "../components/BusinessCard";
import { InfoIcon } from "../components/GoogleIcons";

export const SEARCH_QUERY = "barbier à proximité";

/** Paliers du compteur d'avis imposés par le brief. */
const REVIEW_FRAMES = [15, 24, 33, 42, 51, 60, 70];
const REVIEW_VALUES = [0, 12, 58, 146, 327, 684, 1000];

/**
 * Frame de départ des trois dépassements successifs, et durée de chacun.
 * Le dernier se termine à 80 + 18 = 98, comme prévu au storyboard.
 */
const OVERTAKE_STARTS = [40, 60, 80];
const OVERTAKE_DURATION = 18;

/**
 * Le concurrent doublé libère sa place un peu plus vite que la fiche qui monte.
 * Mêmes frames de départ et d'arrivée, mais les deux fiches se croisent moins
 * longtemps : avec des fiches hautes, une descente symétrique masquerait
 * complètement le concurrent et ne laisserait dépasser que ses boutons.
 */
const OVERTAKE_DURATION_PASSED = 12;

/** Ressort de glissement : ferme, sans rebond ni tremblement. */
const SLIDE_SPRING = { damping: 200, mass: 0.7, stiffness: 110 };

export const GoogleRankingHook: React.FC<{
  /**
   * 0 → 1 : mise en avant du bloc « note · étoiles · avis » de la fiche
   * « Votre établissement », pilotée par la séquence qui suit le hook.
   * Non fournie (donc 0) dans la composition `GoogleRankingHook` elle-même :
   * les 120 frames validées restent strictement inchangées.
   */
  readonly ratingFocus?: number;
}> = ({ ratingFocus = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  /**
   * Progression 0 → 1 de chaque dépassement.
   * `spring()` avec un fort amortissement : la fiche accélère puis se pose,
   * sans dépassement de cible qui provoquerait un chevauchement.
   */
  const overtakes = OVERTAKE_STARTS.map((start) =>
    spring({
      frame: frame - start,
      fps,
      config: SLIDE_SPRING,
      durationInFrames: OVERTAKE_DURATION,
    }),
  );

  /** Même progression, mais resserrée, pour la fiche qui cède sa place. */
  const passed = OVERTAKE_STARTS.map((start) =>
    spring({
      frame: frame - start,
      fps,
      config: SLIDE_SPRING,
      durationInFrames: OVERTAKE_DURATION_PASSED,
    }),
  );

  /**
   * Rang courant (valeur continue) de chaque fiche.
   *
   * "Votre établissement" remonte de 3 → 0 en cumulant les trois progressions.
   * Chaque concurrent descend d'exactement un rang, exactement pendant la
   * fenêtre du dépassement qui le concerne : les rangs restent cohérents à
   * chaque frame et aucune fiche ne saute de position.
   */
  const rankOf = (initialRank: number, isOwner: boolean): number => {
    if (isOwner) {
      return 3 - overtakes[0] - overtakes[1] - overtakes[2];
    }

    // Barber District (rang 2) est doublé en premier, puis L'Atelier du
    // Barbier (rang 1), puis Maison Barber (rang 0).
    return initialRank + passed[2 - initialRank];
  };

  // Compteur d'avis : accélération par paliers, puis figé à 1000 → "(1 k)".
  const reviewCount = Math.round(
    interpolate(frame, REVIEW_FRAMES, REVIEW_VALUES, {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.33, 0, 0.2, 1),
    }),
  );

  // La note apparaît avec les premiers avis et monte jusqu'à 5,0.
  const ownerRating = interpolate(frame, [18, 40, 62], [4.4, 4.8, 5], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Remplissage progressif des cinq étoiles.
  const ownerStars = interpolate(frame, [16, 62], [0, 5], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  // Fondu d'apparition du bloc note + étoiles + avis.
  const ownerRatingOpacity = interpolate(frame, [16, 26], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Élévation pendant toute la remontée, retirée dès la stabilisation.
  const lift = interpolate(frame, [36, 44, 94, 102], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });

  /** Tant qu'aucun avis n'est encore arrivé, la fiche affiche "Aucun avis". */
  const ownerHasReviews = reviewCount >= 1;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: G.white,
        fontFamily: FONT_FAMILY,
        paddingLeft: LAYOUT.pagePaddingX,
        paddingRight: LAYOUT.pagePaddingX,
        paddingTop: LAYOUT.pagePaddingTop,
      }}
      from={-14}
    >
      <GoogleSearchBar query={SEARCH_QUERY} />
      {/* Titre du bloc de résultats locaux */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: LAYOUT.sectionTitleHeight,
          marginTop: LAYOUT.sectionTitleMarginTop,
          marginBottom: LAYOUT.sectionTitleMarginBottom,
        }}
      >
        <div
          style={{
            fontSize: TYPE.sectionTitle,
            fontWeight: WEIGHT.medium,
            color: G.textPrimary,
            lineHeight: 1.1,
          }}
        >
          Entreprises
        </div>
        <InfoIcon size={38} />
      </div>
      <GoogleLocalMap />
      {/* Liste classée — positions absolues pour éviter tout reflow */}
      <div
        style={{
          position: "relative",
          width: CONTENT_WIDTH,
          height: LAYOUT.cardHeight * BUSINESSES.length,
          marginTop: LAYOUT.listMarginTop,
        }}
      >
        {BUSINESSES.map((business) => {
          const { isOwner } = business;
          const rank = rankOf(business.initialRank, isOwner);

          const rating = isOwner
            ? ownerHasReviews
              ? ownerRating
              : null
            : business.rating;

          const reviews = isOwner
            ? ownerHasReviews
              ? reviewCount
              : null
            : business.reviews;

          return (
            <BusinessCard
              key={business.id}
              business={business}
              top={rank * LAYOUT.cardHeight}
              rating={rating}
              reviewLabel={reviews === null ? null : formatReviewCount(reviews)}
              starProgress={isOwner ? ownerStars : (business.rating ?? 0)}
              ratingOpacity={isOwner ? ownerRatingOpacity : 1}
              lift={isOwner ? lift : 0}
              // Seule la fiche en tête n'a pas de séparateur au-dessus d'elle :
              // il s'efface au fil du dépassement, sans jamais clignoter.
              separatorOpacity={interpolate(rank, [0, 0.35], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              })}
              zIndex={isOwner ? 10 : 1}
              // Seule la fiche de l'établissement suivi est mise en avant.
              ratingFocus={isOwner ? ratingFocus : 0}
            />
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
