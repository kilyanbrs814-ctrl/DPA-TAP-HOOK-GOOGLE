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
import { G, LAYOUT, TYPE, WEIGHT } from "../config/google-ui";
import { FONT_FAMILY } from "../config/fonts";
import type { Business } from "../data/businesses";
import { formatRating } from "../data/businesses";
import { StarsRating } from "./StarsRating";
import { BusinessPhotos } from "./BusinessPhotos";
import { CalendarIcon, DirectionsIcon, PhoneIcon } from "./GoogleIcons";

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
}) => {
  const hasReviews = rating !== null && reviewLabel !== null;

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
                height: 38,
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
              {hasReviews ? (
                <>
                  <span>{formatRating(rating)}</span>
                  <StarsRating
                    progress={starProgress}
                    size={28}
                    idPrefix={business.id}
                  />
                  <span>{`(${reviewLabel})`}</span>
                  <span>{`· ${business.category}`}</span>
                </>
              ) : (
                <span>{`Aucun avis · ${business.category}`}</span>
              )}
            </div>

            <div style={{ marginTop: 6 }}>
              <MetaLine height={34}>
                {`${business.seniority} · ${business.zone}`}
              </MetaLine>
            </div>

            <div style={{ marginTop: 6 }}>
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

          <BusinessPhotos src={business.photo} isOwner={business.isOwner} />
        </div>

        {/* Boutons d'action, ancrés au bas de la fiche */}
        <div
          style={{
            marginTop: "auto",
            display: "flex",
            gap: LAYOUT.actionButtonGap,
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
