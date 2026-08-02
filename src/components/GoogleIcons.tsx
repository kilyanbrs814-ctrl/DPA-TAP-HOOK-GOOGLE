/**
 * Icônes de l'interface Google, redessinées en SVG pour rester nettes
 * à n'importe quelle échelle (aucun bitmap).
 */

import React from "react";
import { G } from "../config/google-ui";

type IconProps = {
  size?: number;
  color?: string;
};

/** Croix "effacer la recherche". */
export const CloseIcon: React.FC<IconProps> = ({
  size = 34,
  color = G.textSecondary,
}) => (
  <svg viewBox="0 0 24 24" width={size} height={size}>
    <path
      d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
      fill={color}
    />
  </svg>
);

/** Micro de la recherche vocale (multicolore comme chez Google). */
export const MicIcon: React.FC<{ size?: number }> = ({ size = 34 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size}>
    <path d="M12 15a3 3 0 003-3V6a3 3 0 00-6 0v6a3 3 0 003 3z" fill="#4285F4" />
    <path
      d="M11 18.92V22h2v-3.08A7 7 0 0019 12h-2a5 5 0 01-10 0H5a7 7 0 006 6.92z"
      fill="#34A853"
    />
    <path d="M9 6a3 3 0 013-3v3H9z" fill="#EA4335" />
    <path d="M15 9v3a3 3 0 01-3 3V9h3z" fill="#FBBC05" />
  </svg>
);

/** Google Lens. */
export const LensIcon: React.FC<{ size?: number }> = ({ size = 34 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size}>
    <path
      d="M3 8V5a2 2 0 012-2h3v2H5v3H3zm18 0V5a2 2 0 00-2-2h-3v2h3v3h2zM3 16v3a2 2 0 002 2h3v-2H5v-3H3zm18 0v3a2 2 0 01-2 2h-3v-2h3v-3h2z"
      fill="#4285F4"
    />
    <circle cx="12" cy="12" r="3.4" fill="#EA4335" />
  </svg>
);

/** Loupe de validation de la recherche. */
export const SearchIcon: React.FC<IconProps> = ({
  size = 34,
  color = G.actionBlue,
}) => (
  <svg viewBox="0 0 24 24" width={size} height={size}>
    <path
      d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
      fill={color}
    />
  </svg>
);

/** "i" d'information à droite du titre "Entreprises". */
export const InfoIcon: React.FC<IconProps> = ({
  size = 36,
  color = G.textSecondary,
}) => (
  <svg viewBox="0 0 24 24" width={size} height={size}>
    <path
      d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 110-16 8 8 0 010 16zm-1-13h2v2h-2V7zm0 4h2v6h-2v-6z"
      fill={color}
    />
  </svg>
);

/** Bouton "agrandir" en haut à droite de la carte. */
export const ExpandIcon: React.FC<IconProps> = ({
  size = 30,
  color = "#FFFFFF",
}) => (
  <svg viewBox="0 0 24 24" width={size} height={size}>
    <path
      d="M4 4h7v2H6v5H4V4zm16 0v7h-2V6h-5V4h7zM4 20v-7h2v5h5v2H4zm16 0h-7v-2h5v-5h2v7z"
      fill={color}
    />
  </svg>
);

/** Globe du bouton "Site Web". */
export const GlobeIcon: React.FC<IconProps> = ({
  size = 40,
  color = G.actionBlue,
}) => (
  <svg viewBox="0 0 24 24" width={size} height={size}>
    <path
      d="M12 2a10 10 0 100 20 10 10 0 000-20zm6.92 6h-2.95a15.6 15.6 0 00-1.38-3.56A8.03 8.03 0 0118.92 8zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14A7.9 7.9 0 014 12c0-.69.1-1.36.26-2h3.38a16.5 16.5 0 000 4H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56A8 8 0 015.08 16zm2.95-8H5.08a8 8 0 014.33-3.56A15.6 15.6 0 008.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66a14.7 14.7 0 010-4h4.68a14.7 14.7 0 010 4zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95a8 8 0 01-4.33 3.56zM16.36 14a16.5 16.5 0 000-4h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z"
      fill={color}
    />
  </svg>
);

/** Combiné du bouton "Appeler". */
export const PhoneIcon: React.FC<IconProps> = ({
  size = 30,
  color = G.actionBlue,
}) => (
  <svg viewBox="0 0 24 24" width={size} height={size}>
    <path
      d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.24.2 2.45.57 3.57a1 1 0 01-.25 1.02l-2.2 2.2z"
      fill={color}
    />
  </svg>
);

/** Calendrier du bouton "Rendez-vous". */
export const CalendarIcon: React.FC<IconProps> = ({
  size = 30,
  color = G.actionBlue,
}) => (
  <svg viewBox="0 0 24 24" width={size} height={size}>
    <path
      d="M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2zM7 12h5v5H7v-5z"
      fill={color}
    />
  </svg>
);

/** Flèche du bouton "Itinéraire". */
export const DirectionsIcon: React.FC<IconProps> = ({
  size = 40,
  color = G.actionBlue,
}) => (
  <svg viewBox="0 0 24 24" width={size} height={size}>
    <path
      d="M21.41 10.59l-8-8a2 2 0 00-2.83 0l-8 8a2 2 0 000 2.83l8 8a2 2 0 002.83 0l8-8a2 2 0 000-2.83zM13.5 15v-2.5h-4V16h-2v-4.5a1 1 0 011-1h5V8l3.5 3.5-3.5 3.5z"
      fill={color}
    />
  </svg>
);

/** Ciseaux — visuel neutre des vignettes concurrentes (aucune photo réelle). */
export const ScissorsIcon: React.FC<IconProps> = ({
  size = 44,
  color = "#9aa0a6",
}) => (
  <svg viewBox="0 0 24 24" width={size} height={size}>
    <path
      d="M9.64 7.64a3 3 0 10-2.12 2.12L9.5 11.7l-1.98 1.94a3 3 0 102.12 2.12L19 6.4V5h-1.4l-5.1 5.1-2.86-2.46zM6.5 8a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm0 9a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z"
      fill={color}
    />
    <path d="M13.9 13.3l1.4-1.4L19 15.6V17h-1.4l-3.7-3.7z" fill={color} />
  </svg>
);
