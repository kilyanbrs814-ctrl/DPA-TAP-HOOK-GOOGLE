/**
 * En-tête Google : logo multicolore + barre de recherche.
 * Entièrement recréé en HTML/CSS/SVG pour rester parfaitement net.
 */

import React from "react";
import { G, LAYOUT, TYPE, WEIGHT } from "../config/google-ui";
import { FONT_FAMILY } from "../config/fonts";
import { CloseIcon, LensIcon, MicIcon, SearchIcon } from "./GoogleIcons";

/** Logo "Google" lettre par lettre, aux couleurs officielles. */
export const GoogleLogo: React.FC<{ height: number }> = ({ height }) => (
  <div
    style={{
      display: "flex",
      alignItems: "baseline",
      fontFamily: FONT_FAMILY,
      fontSize: height,
      fontWeight: WEIGHT.medium,
      letterSpacing: -height * 0.045,
      lineHeight: 1,
    }}
  >
    {"Google".split("").map((letter, i) => (
      <span key={i} style={{ color: G.logo[i] }}>
        {letter}
      </span>
    ))}
  </div>
);

export const GoogleSearchBar: React.FC<{ query: string }> = ({ query }) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: LAYOUT.headerGap,
        alignItems: "flex-start",
      }}
    >
      <GoogleLogo height={LAYOUT.logoHeight} />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 24,
          width: "100%",
          height: LAYOUT.searchBarHeight,
          paddingLeft: 36,
          paddingRight: 32,
          borderRadius: LAYOUT.searchBarHeight / 2,
          border: `1px solid ${G.border}`,
          backgroundColor: G.white,
          boxShadow: "0 1px 6px rgba(32,33,36,0.10)",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            flex: 1,
            fontFamily: FONT_FAMILY,
            fontSize: TYPE.searchQuery,
            fontWeight: WEIGHT.regular,
            color: G.textPrimary,
            whiteSpace: "nowrap",
            overflow: "hidden",
          }}
        >
          {query}
        </div>

        <CloseIcon size={32} />
        <div style={{ width: 1, height: 40, backgroundColor: G.border }} />
        <MicIcon size={32} />
        <LensIcon size={32} />
        <SearchIcon size={32} />
      </div>
    </div>
  );
};
