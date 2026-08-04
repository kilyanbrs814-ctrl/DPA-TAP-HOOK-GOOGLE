/**
 * Une fiche du bloc "Entreprises", calquée sur les résultats locaux Google
 * mobile : informations à gauche, miniatures photo à droite, boutons d'action
 * en pilule en dessous, séparateur fin au-dessus.
 *
 * Le composant est purement présentationnel : il ne lit pas la frame courante.
 * Toutes les valeurs animées (position, note, avis, remplissage des étoiles,
 * élévation, opacité du séparateur) sont calculées par GoogleRankingHook et
 * passées en props — l'animation reste déterministe et centralisée.
 *
 * Tout ce qui compose la fiche (texte, miniatures, boutons, séparateur) vit
 * dans CE conteneur : le déplacement de classement les emporte ensemble.
 */

import React from "react";
import { interpolateColors } from "remotion";
import { G, LAYOUT, TYPE, WEIGHT } from "../config/google-ui";
import { FONT_FAMILY } from "../config/fonts";
import type { Business } from "../data/businesses";
import { formatRating } from "../data/businesses";
import { StarsRating } from "./StarsRating";
import { BusinessPhotos } from "./BusinessPhotos";
import { CalendarIcon, DirectionsIcon, PhoneIcon } from "./GoogleIcons";

/* -------------------------------------------------------------------------- */
/*  Géométrie du bloc « 5,0 · ★★★★★ · (1 k) »                                  */
/* -------------------------------------------------------------------------- */

/**
 * Décalage du haut de la ligne notée par rapport au bord haut de la fiche :
 * séparateur (1) + padding haut (16) + hauteur du titre (48) + marge (8).
 */
export const RATING_ROW_TOP = 1 + LAYOUT.cardPaddingTop + 48 + 8;

/** Hauteur de cette ligne. */
export const RATING_ROW_HEIGHT = 38;

/**
 * Largeur de « 5,0 · ★★★★★ · (1 k) », catégorie exclue :
 * 45 (note) + 10 + 144 (5 × 28 + 4 gouttières) + 10 + 66 = 275 px.
 */
export const RATING_BLOCK_WIDTH = 275;

/** Centre de la rangée d'étoiles, en abscisse absolue dans la page. */
export const RATING_STARS_CENTER_X = LAYOUT.pagePaddingX + 55 + 72;

/** Agrandissement maximal du bloc noté quand il est mis en avant. */
const RATING_FOCUS_SCALE = 0.14;

/** Vert Google du renforcement, identique à celui de « Réputation ». */
const FOCUS_GREEN = G.openGreen;

/** Bouton pilule Google : bordure grise, icône bleue, libellé sombre. */
const ActionButton: React.FC<{
  label: string;
  icon: React.ReactNode;
}> = ({ label, icon }) => (
  <div
    style={{
      height: LAYOUT.actionButtonHeight,
      paddingLeft: LAYOUT.actionButtonPaddingX,
      paddingRight: LAYOUT.actionButtonPaddingX,
      borderRadius: LAYOUT.actionButtonHeight / 2,
      border: `1px solid ${G.border}`,
      backgroundColor: G.actionBlueSoft,
      display: "flex",
      alignItems: "center",
      gap: 14,
      boxSizing: "border-box",
      flexShrink: 0,
    }}
  >
    {icon}
    <div
      style={{
        fontFamily: FONT_FAMILY,
        fontSize: TYPE.buttonLabel,
        fontWeight: WEIGHT.regular,
        color: G.textPrimary,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </div>
  </div>
);

/** Ligne de texte secondaire tronquée proprement, comme sur Google. */
const MetaLine: React.FC<{ children: React.ReactNode; height: number }> = ({
  children,
  height,
}) => (
  <div
    style={{
      height,
      display: "flex",
      alignItems: "center",
      fontFamily: FONT_FAMILY,
      fontSize: TYPE.cardMeta,
      fontWeight: WEIGHT.regular,
      color: G.textSecondary,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    }}
  >
    <span
      style={{
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  </div>
);

export type BusinessCardProps = {
  business: Business;
  /** Position verticale absolue, en pixels, dans la liste. */
  top: number;
  /** Note à afficher. Null → la fiche n'a pas encore d'avis. */
  rating: number | null;
  /** Libellé du nombre d'avis déjà formaté ("436", "1 k") ou null. */
  reviewLabel: string | null;
  /** Remplissage des étoiles, 0 → 5. */
  starProgress: number;
  /** Opacité du bloc note+étoiles+avis (apparition progressive). */
  ratingOpacity: number;
  /** 0 → 1 : élévation pendant le dépassement (ombre + léger agrandissement). */
  lift: number;
  /** 0 → 1 : le séparateur haut disparaît quand la fiche devient première. */
  separatorOpacity: number;
  zIndex: number;
  /**
   * 0 → 1 : mise en avant du seul bloc « note · étoiles · avis ».
   * À 0 la fiche est strictement identique à sa version d'origine — le hook
   * n'est donc modifié d'aucun pixel avant la séquence qui l'utilise.
   */
  ratingFocus?: number;
};

export const BusinessCard: React.FC<BusinessCardProps> = ({
  business,
  top,
  rating,
  reviewLabel,
  starProgress,
  ratingOpacity,
  lift,
  separatorOpacity,
  zIndex,
  ratingFocus = 0,
}) => {
  const hasReviews = rating !== null && reviewLabel !== null;

  /** Le reste de la fiche s'atténue légèrement pendant la mise en avant. */
  const restOpacity = 1 - ratingFocus * 0.62;

  /** Facteur d'agrandissement du bloc noté. */
  const focusScale = 1 + ratingFocus * RATING_FOCUS_SCALE;

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: "100%",
        height: LAYOUT.cardHeight,
        zIndex,
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
        backgroundColor: G.white,
        borderRadius: 18,
        translate: `0px ${top}px`,
        scale: 1 + lift * 0.018,
        boxShadow:
          lift > 0
            ? `0 ${8 + lift * 14}px ${18 + lift * 26}px rgba(32,33,36,${lift * 0.18})`
            : "none",
      }}
    >
      {/* Séparateur : appartient à la fiche, il la suit pendant le classement */}
      <div
        style={{
          width: "100%",
          height: 1,
          flexShrink: 0,
          backgroundColor: G.separator,
          opacity: separatorOpacity,
        }}
      />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          paddingTop: LAYOUT.cardPaddingTop,
          paddingBottom: LAYOUT.cardPaddingBottom,
          boxSizing: "border-box",
          minHeight: 0,
        }}
      >
        {/* Informations à gauche · miniatures à droite */}
        <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                height: 48,
                display: "flex",
                alignItems: "center",
                fontFamily: FONT_FAMILY,
                fontSize: TYPE.cardTitle,
                fontWeight: WEIGHT.regular,
                color: G.textPrimary,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                lineHeight: 1.15,
                opacity: restOpacity,
              }}
            >
              <span
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {business.name}
              </span>
            </div>

            {/* Note · étoiles jaunes · avis · catégorie */}
            <div
              style={{
                marginTop: 8,
                height: RATING_ROW_HEIGHT,
                position: "relative",
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontFamily: FONT_FAMILY,
                fontSize: TYPE.cardRating,
                fontWeight: WEIGHT.regular,
                color: G.textSecondary,
                whiteSpace: "nowrap",
                // Le fondu ne concerne que le bloc noté : "Aucun avis" reste
                // pleinement lisible tant que le premier avis n'est pas arrivé.
                opacity: hasReviews ? ratingOpacity : 1,
              }}
            >
              {/*
                Surbrillance du seul bloc « note · étoiles · avis » : fond vert
                très pâle, bordure verte épaisse et halo extérieur. Posée SOUS
                le texte (zIndex 0 contre 1), elle ne voile jamais la note, les
                étoiles ni le nombre d'avis. Elle grandit avec le bloc.
              */}
              {ratingFocus > 0 ? (
                <div
                  style={{
                    position: "absolute",
                    left: -18,
                    top: -14,
                    width: RATING_BLOCK_WIDTH * focusScale + 36,
                    height: RATING_ROW_HEIGHT * focusScale + 28,
                    boxSizing: "border-box",
                    borderRadius: 18,
                    zIndex: 0,
                    backgroundColor: `rgba(24,128,56,${0.1 * ratingFocus})`,
                    border: `${3.5 * ratingFocus}px solid rgba(24,128,56,${
                      0.85 * ratingFocus
                    })`,
                    boxShadow: `0 0 0 ${
                      12 * ratingFocus
                    }px rgba(24,128,56,0.12), 0 0 ${
                      44 * ratingFocus
                    }px ${10 * ratingFocus}px rgba(24,128,56,0.3)`,
                    opacity: ratingFocus,
                  }}
                />
              ) : null}

              {hasReviews ? (
                <>
                  {/*
                    Le bloc noté est isolé dans son propre conteneur : c'est
                    LUI seul qui grossit, ancré à gauche, sans déplacer d'un
                    pixel le reste de la fiche.
                  */}
                  <div
                    style={{
                      position: "relative",
                      zIndex: 1,
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      transformOrigin: "left center",
                      scale: focusScale.toString(),
                      color: interpolateColors(
                        ratingFocus,
                        [0, 1],
                        [G.textSecondary, FOCUS_GREEN],
                      ),
                    }}
                  >
                    <span>{formatRating(rating)}</span>
                    <StarsRating
                      progress={starProgress}
                      size={28}
                      idPrefix={business.id}
                    />
                    <span>{`(${reviewLabel})`}</span>
                  </div>
                  {/*
                    La catégorie s'efface pendant la mise en avant : la ligne se
                    réduit alors exactement à « 5,0 ★★★★★ (1 k) », sans le
                    moindre chevauchement avec le halo.
                  */}
                  <span
                    style={{
                      position: "relative",
                      zIndex: 1,
                      opacity: 1 - ratingFocus,
                      translate: `${
                        RATING_BLOCK_WIDTH * (focusScale - 1)
                      }px 0px`,
                    }}
                  >
                    {`· ${business.category}`}
                  </span>
                </>
              ) : (
                <span>{`Aucun avis · ${business.category}`}</span>
              )}
            </div>

            <div style={{ marginTop: 6, opacity: restOpacity }}>
              <MetaLine height={34}>
                {`${business.seniority} · ${business.zone}`}
              </MetaLine>
            </div>

            <div style={{ marginTop: 6, opacity: restOpacity }}>
              <MetaLine height={34}>
                <span
                  style={{ color: G.openGreen, fontWeight: WEIGHT.medium }}
                >
                  {business.isOpen ? "Ouvert" : "Fermé"}
                </span>
                {` · ${business.hours}`}
              </MetaLine>
            </div>
          </div>

          <div style={{ opacity: restOpacity, display: "flex" }}>
            <BusinessPhotos src={business.photo} isOwner={business.isOwner} />
          </div>
        </div>

        {/* Boutons d'action, ancrés au bas de la fiche */}
        <div
          style={{
            marginTop: "auto",
            display: "flex",
            gap: LAYOUT.actionButtonGap,
            opacity: restOpacity,
          }}
        >
          <ActionButton label="Appeler" icon={<PhoneIcon size={30} />} />
          <ActionButton label="Itinéraire" icon={<DirectionsIcon size={30} />} />
          <ActionButton label="Rendez-vous" icon={<CalendarIcon size={30} />} />
        </div>
      </div>
    </div>
  );
};
