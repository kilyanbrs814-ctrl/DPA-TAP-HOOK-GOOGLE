import React from "react";
import { COLORS, FONT_STACK, PHONE } from "./constants";

/**
 * The iOS system chrome: status bar and home indicator.
 *
 * These are the ONLY implementations in the project. They are rendered once, by
 * `PhoneMockup`, above every screen content — wallpaper, notification, Safari,
 * the Google page and the "+1 avis" confirmation all share the exact same
 * pixels, so nothing shifts, fades or pops when the screen changes page.
 *
 * Every coordinate is in local screen pixels (`PHONE.screenWidth` ×
 * `PHONE.screenHeight`), never in composition pixels.
 */

/** Battery charge shown in the status bar. */
const BATTERY_LEVEL = 0.72;

/** Cellular signal: four bottom-aligned bars, iOS proportions. */
const CellularIcon: React.FC = () => (
  <svg width={18} height={12} viewBox="0 0 18 12" fill="none">
    {[
      { x: 0, height: 4 },
      { x: 4.9, height: 6.6 },
      { x: 9.8, height: 9.3 },
      { x: 14.7, height: 12 },
    ].map((bar) => (
      <rect
        key={bar.x}
        x={bar.x}
        y={12 - bar.height}
        width={3.3}
        height={bar.height}
        rx={1.15}
        fill={COLORS.white}
      />
    ))}
  </svg>
);

/**
 * Wi-Fi: three concentric arcs plus the lower dot, all struck from the same
 * center so the spacing stays regular — the Apple glyph, not a generic icon.
 */
const WifiIcon: React.FC = () => (
  <svg width={19} height={14} viewBox="0 0 19 14" fill="none">
    <path
      d="M2.72 7.30 A 8.6 8.6 0 0 1 16.28 7.30"
      stroke={COLORS.white}
      strokeWidth={1.7}
      strokeLinecap="round"
    />
    <path
      d="M4.85 9.02 A 6 6 0 0 1 14.15 9.02"
      stroke={COLORS.white}
      strokeWidth={1.7}
      strokeLinecap="round"
    />
    <path
      d="M6.82 10.72 A 3.4 3.4 0 0 1 12.18 10.72"
      stroke={COLORS.white}
      strokeWidth={1.7}
      strokeLinecap="round"
    />
    <circle cx={9.5} cy={12.3} r={1.2} fill={COLORS.white} />
  </svg>
);

/** Battery: rounded capsule, thin outline, terminal on the right, white fill. */
const BatteryIcon: React.FC = () => (
  <svg width={30} height={14} viewBox="0 0 30 14" fill="none">
    <rect
      x={0.65}
      y={0.65}
      width={25.7}
      height={12.7}
      rx={4.3}
      stroke={COLORS.white}
      strokeOpacity={0.42}
      strokeWidth={1.3}
    />
    <path
      d="M27.5 5.1 C 28.4 5.5, 28.9 6.2, 28.9 7 C 28.9 7.8, 28.4 8.5, 27.5 8.9 Z"
      fill={COLORS.white}
      fillOpacity={0.42}
    />
    <rect
      x={2.2}
      y={2.2}
      width={22.6 * BATTERY_LEVEL}
      height={9.6}
      rx={2.6}
      fill={COLORS.white}
    />
  </svg>
);

/**
 * iOS status bar. The clock sits left of the Dynamic Island, the indicator
 * cluster right of it, both optically centered on the island (y ≈ 35).
 */
export const IOSStatusBar: React.FC = () => (
  <>
    <div
      style={{
        position: "absolute",
        top: 24,
        left: 34,
        fontFamily: FONT_STACK,
        fontSize: 21,
        fontWeight: 600,
        color: COLORS.white,
        letterSpacing: 0.2,
      }}
    >
      9:41
    </div>
    <div
      style={{
        position: "absolute",
        top: 24,
        right: 34,
        height: 22,
        display: "flex",
        alignItems: "center",
        gap: 5,
      }}
    >
      <CellularIcon />
      <WifiIcon />
      <BatteryIcon />
    </div>
  </>
);

/**
 * iOS home indicator: the capsule pinned to the bottom of the SCREEN — never to
 * the bottom of the composition. Rendered permanently, so it is present on the
 * wallpaper, during the Safari opening, on the Google page and on "+1 avis".
 *
 * 150 px on a 438 px screen ≈ 139 pt on a 393 pt iPhone.
 */
export const IOSHomeIndicator: React.FC = () => (
  <div
    style={{
      position: "absolute",
      bottom: 9,
      left: (PHONE.screenWidth - 150) / 2,
      width: 150,
      height: 5,
      borderRadius: 2.5,
      backgroundColor: "rgba(255,255,255,0.62)",
    }}
  />
);
