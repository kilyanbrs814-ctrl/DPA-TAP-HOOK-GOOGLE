/**
 * Miniature d'une fiche, à droite des informations, comme sur les résultats
 * locaux Google mobile.
 *
 * Les quatre miniatures partagent exactement la même géométrie : largeur,
 * hauteur, rayon et emplacement viennent tous de LAYOUT, aucune fiche n'a de
 * cadre, de fond ni de bordure supplémentaire. Seuls la source de l'image et
 * son cadrage diffèrent :
 *   — devantures des concurrents : `cover` (le cadre est rempli, sans
 *     déformation, l'image étant simplement recadrée) ;
 *   — logo Google Business Profile : `contain` (rien n'est coupé).
 */

import React from "react";
import { Img, staticFile } from "remotion";
import { LAYOUT } from "../config/google-ui";

export const BusinessPhotos: React.FC<{
  /** Chemin de l'image dans public/. */
  src: string;
  /** Vrai pour "Votre établissement" : le logo est cadré en entier. */
  isOwner: boolean;
}> = ({ src, isOwner }) => (
  <Img
    src={staticFile(src)}
    style={{
      width: LAYOUT.photoWidth,
      height: LAYOUT.photoHeight,
      flexShrink: 0,
      borderRadius: LAYOUT.photoRadius,
      objectFit: isOwner ? "contain" : "cover",
      display: "block",
    }}
  />
);
