/**
 * Rangée de 5 étoiles Google.
 *
 * `progress` (0 → 5) pilote le remplissage : les étoiles pleines sont jaunes,
 * l'étoile en cours est remplie partiellement (clip horizontal), les suivantes
 * restent grises. Aucune animation CSS : la valeur vient de la timeline.
 */

import React from "react";
import { G } from "../config/google-ui";

const STAR_PATH =
  "M12 17.27l5.18 3.13-1.37-5.89L20.4 9.6l-6.03-.52L12 3.5 9.63 9.08 3.6 9.6l4.59 3.91-1.37 5.89L12 17.27z";

/** Une étoile, remplie de 0 à 1 de la gauche vers la droite. */
const Star: React.FC<{ size: number; fill: number; clipId: string }> = ({
  size,
  fill,
  clipId,
}) => {
  const clamped = Math.max(0, Math.min(1, fill));

  return (
    <svg viewBox="0 0 24 24" width={size} height={size} style={{ flexShrink: 0 }}>
      <defs>
        <clipPath id={clipId}>
          <rect x={0} y={0} width={24 * clamped} height={24} />
        </clipPath>
      </defs>
      <path d={STAR_PATH} fill={G.starEmpty} />
      <g clipPath={`url(#${clipId})`}>
        <path d={STAR_PATH} fill={G.starYellow} />
      </g>
    </svg>
  );
};

export const StarsRating: React.FC<{
  /** Nombre d'étoiles remplies, décimales acceptées (0 → 5). */
  progress: number;
  size?: number;
  gap?: number;
  /** Identifiant unique : évite toute collision de clipPath entre fiches. */
  idPrefix: string;
}> = ({ progress, size = 30, gap = 1, idPrefix }) => {
  return (
    <div style={{ display: "flex", gap, alignItems: "center" }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Star
          key={i}
          size={size}
          fill={progress - i}
          clipId={`${idPrefix}-star-${i}`}
        />
      ))}
    </div>
  );
};
