import { ThreeCanvas } from "@remotion/three";
import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { Group } from "three";
import { COLORS, HEIGHT, PLAQUE, SPRINGS, WIDTH } from "./constants";
import { usePlaqueModel } from "./usePlaqueModel";
import { type DpaTiming, useDpaTiming } from "./timing";

/**
 * World units: the GLB is modelled in meters, so the plaque is 0.1 × 0.1 m and
 * 2 mm thick. With fov 30 at z = 0.6 the visible frame is ~0.18 × 0.32 m, which
 * puts the 10 cm plaque at ~598 px wide. The CSS iPhone is 464 px wide, i.e.
 * 77.6 mm — so plaque and phone are at the same real-world scale.
 */
const CAMERA_Z = 0.6;
const CAMERA_FOV = 30;
const VISIBLE_HEIGHT =
  2 * CAMERA_Z * Math.tan((CAMERA_FOV / 2) * (Math.PI / 180));
const PX_TO_WORLD = VISIBLE_HEIGHT / HEIGHT;

const toWorldX = (px: number) => (px - WIDTH / 2) * PX_TO_WORLD;
const toWorldY = (px: number) => (HEIGHT / 2 - px) * PX_TO_WORLD;

/**
 * Screen position of the plaque center at a given frame.
 *
 * Le premier palier va de `T.hookStart` à `T.plaqueMove` et vaut deux fois
 * `hookAnchor` : la plaque reste donc STRICTEMENT immobile au centre du cadre
 * pendant toute son apparition. Auparavant le déplacement démarrait dès la
 * frame 0 avec une courbe très « out » : la plaque avait déjà parcouru la
 * moitié du chemin au moment où le fondu d'entrée la rendait visible, et on ne
 * la voyait jamais centrée.
 */
export const plaqueAnchorAt = (frame: number, T: DpaTiming) => ({
  x: interpolate(
    frame,
    [T.hookStart, T.plaqueMove, T.contactStart, T.contact],
    [
      PLAQUE.hookAnchor.x,
      PLAQUE.hookAnchor.x,
      PLAQUE.restAnchor.x + 14,
      PLAQUE.restAnchor.x,
    ],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    },
  ),
  y: interpolate(
    frame,
    [T.hookStart, T.plaqueMove, T.contactStart, T.contact],
    [
      PLAQUE.hookAnchor.y,
      PLAQUE.hookAnchor.y,
      PLAQUE.restAnchor.y + 18,
      PLAQUE.restAnchor.y,
    ],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    },
  ),
});

const Plaque: React.FC<{ readonly model: Group }> = ({ model }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const T = useDpaTiming();

  const enter = spring({
    frame: frame - T.hookStart,
    fps,
    config: SPRINGS.reveal,
    durationInFrames: 26,
  });

  // Micro reaction when the phone lands on the plaque.
  const contactPush = spring({
    frame: frame - T.contact,
    fps,
    config: SPRINGS.contact,
    durationInFrames: 18,
  });
  const contactDip = interpolate(contactPush, [0, 0.5, 1], [0, -0.0035, 0]);

  const anchor = plaqueAnchorAt(frame, T);

  return (
    <group
      position={[
        toWorldX(anchor.x),
        toWorldY(anchor.y) + contactDip,
        contactDip * 0.6,
      ]}
      /*
        Orientation strictement frontale, sur les trois axes.
        L'ancienne valeur `[-0.05, rotationY, -0.13]` était la seule cause de la
        plaque penchée : un basculement X, une rotation Y animée et une
        inclinaison Z permanente. Le GLB, lui, est déjà d'équerre — ses sommets
        vont de -0.05 à +0.05 en X et en Y, le nœud racine n'a ni rotation ni
        translation — il n'y a donc rien à compenser côté modèle.
        Aucune rotation n'est réintroduite pendant le déplacement vers la
        position de contact : seule la position change.
      */
      rotation={[0, 0, 0]}
      scale={interpolate(enter, [0, 1], [0.86, 1])}
    >
      <primitive object={model} />
    </group>
  );
};

export const PlaqueScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const T = useDpaTiming();
  // Loaded here, above <ThreeCanvas>: while rendering, R3F only draws when the
  // Remotion frame changes, so the model has to exist before the canvas mounts.
  const model = usePlaqueModel();

  const opacity = interpolate(frame, [T.hookStart, T.hookStart + 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity }}>
      {/*
        L'ombre de contact au sol (un radial-gradient noir plein cadre) a été
        supprimée : sur le plateau blanc elle grisait le fond, alors que le
        cahier des charges impose du #FFFFFF pur sur tous les pixels libres.
      */}
      {model ? (
        <ThreeCanvas
          flat
          width={width}
          height={height}
          camera={{ fov: CAMERA_FOV, position: [0, 0, CAMERA_Z] }}
          style={{ background: "transparent" }}
        >
          <ambientLight intensity={1.1} color={COLORS.white} />
          <directionalLight position={[0.4, 0.7, 0.9]} intensity={1.4} />
          <directionalLight
            position={[-0.6, -0.2, 0.5]}
            intensity={0.5}
            color={COLORS.googleBlueSoft}
          />
          <Plaque model={model} />
        </ThreeCanvas>
      ) : null}
    </AbsoluteFill>
  );
};
