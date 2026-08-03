import React from "react";
import { PHONE } from "./constants";
import { IOSHomeIndicator, IOSStatusBar } from "./IOSChrome";

/**
 * iPhone built from plain Remotion/CSS shapes: dark titanium frame, screen,
 * Dynamic Island and a very light reflection. No image mockup is used, so the
 * frame can be scaled up without any resolution artefact.
 *
 * `children` are the screen content and nothing else: they are clipped by the
 * inner div (`overflow: hidden` + rounded corners), and the Dynamic Island and
 * the reflection are painted after them, so no interface can ever cover the
 * island or spill onto the chassis.
 *
 * Paint order inside the screen:
 *   children → iOS chrome → `screenOverlay` → Dynamic Island → reflection.
 * The chrome therefore sits above every page, and `screenOverlay` (the publish
 * whiteout) washes page and chrome together — so no iOS element ever appears to
 * blink on its own. The island stays on top of the wash: it is a physical hole,
 * it never lights up.
 */
export const PhoneMockup: React.FC<{
  readonly children?: React.ReactNode;
  /** Full-screen wash painted above the iOS chrome, below the Dynamic Island. */
  readonly screenOverlay?: React.ReactNode;
}> = ({ children, screenOverlay }) => {
  return (
    <div
      style={{
        width: PHONE.width,
        height: PHONE.height,
        borderRadius: PHONE.radius,
        backgroundColor: "#1b1d21",
        padding: PHONE.bezel,
        boxSizing: "border-box",
        /*
          AUCUNE ombre extérieure, et aucun halo bleu de contact NFC : sur le
          plateau blanc, toute ombre portée grisait le fond (253/254 au lieu de
          255 en haut et en bas du cadre pendant le close-up, l'iPhone mesurant
          1754 px de haut dans un cadre de 1920). Il ne reste que le liseré
          interne du châssis, qui appartient physiquement à l'appareil. Le
          contact NFC reste raconté par les ondes de `NfcWaves`.
        */
        boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.035)",
        position: "relative",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: PHONE.radius - PHONE.bezel,
          overflow: "hidden",
          position: "relative",
          backgroundColor: "#000000",
        }}
      >
        {children ?? <PhoneWallpaper />}

        {/*
          iOS chrome, mounted once for the whole reel and above every page, so
          the status bar and the home indicator are strictly identical on the
          wallpaper, during the Safari opening, on the Google page and on the
          "+1 avis" screen.
        */}
        <IOSStatusBar />
        <IOSHomeIndicator />

        {screenOverlay}

        {/* Dynamic Island */}
        <div
          style={{
            position: "absolute",
            top: 18,
            left: "50%",
            translate: "-50% 0",
            width: 122,
            height: 34,
            borderRadius: 17,
            backgroundColor: "#000000",
            boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.05)",
          }}
        />

        {/* Screen reflection, very restrained */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(118deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.03) 18%, rgba(255,255,255,0) 34%, rgba(255,255,255,0) 100%)",
          }}
        />
      </div>

      {/* Side buttons */}
      <div
        style={{
          position: "absolute",
          left: -3,
          top: 214,
          width: 4,
          height: 92,
          borderRadius: 3,
          background: "linear-gradient(90deg, #1d2025, #0d0f12)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: -3,
          top: 326,
          width: 4,
          height: 92,
          borderRadius: 3,
          background: "linear-gradient(90deg, #1d2025, #0d0f12)",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: -3,
          top: 258,
          width: 4,
          height: 140,
          borderRadius: 3,
          background: "linear-gradient(270deg, #1d2025, #0d0f12)",
        }}
      />
    </div>
  );
};

/**
 * Neutral dark wallpaper. The status bar and the home indicator are NOT drawn
 * here — `PhoneMockup` paints them once, above every page.
 */
export const PhoneWallpaper: React.FC = () => {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "radial-gradient(120% 74% at 22% 6%, #4b3a6e 0%, #26293a 42%, #10121a 100%)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(64% 42% at 78% 80%, rgba(66,133,244,0.40) 0%, rgba(66,133,244,0) 70%)",
        }}
      />
    </div>
  );
};
