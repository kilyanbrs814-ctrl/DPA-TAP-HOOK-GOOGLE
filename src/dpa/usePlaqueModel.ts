import { useEffect, useState } from "react";
import { continueRender, delayRender, staticFile } from "remotion";
import type { Group } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { ASSETS } from "./constants";

/**
 * The plaque exported from `10-plaque-bleue-3D.blend` (10 × 10 cm, 2 mm thick).
 *
 * The Blender materials are Emission shaders, which glTF exports as
 * `emissiveFactor: [1,1,1]` + `emissiveTexture`. To keep the printed artwork
 * exactly as authored we therefore:
 *  - keep the emissive maps at full intensity,
 *  - disable tone mapping on those materials,
 * so the result does not depend on any scene light.
 */
let cached: Promise<Group> | null = null;

const loadPlaque = () => {
  if (cached) {
    return cached;
  }

  cached = new Promise<Group>((resolve, reject) => {
    new GLTFLoader().load(
      staticFile(ASSETS.plaqueGlb),
      (gltf) => {
        gltf.scene.traverse((object) => {
          const mesh = object as unknown as {
            isMesh?: boolean;
            material?: {
              emissiveMap?: unknown;
              emissiveIntensity?: number;
              toneMapped?: boolean;
              roughness?: number;
              metalness?: number;
              needsUpdate?: boolean;
            };
          };
          if (!mesh.isMesh || !mesh.material) {
            return;
          }
          const material = mesh.material;
          material.toneMapped = false;
          if (material.emissiveMap) {
            // Printed recto / 3M verso: flat, light-independent artwork.
            material.emissiveIntensity = 1;
          } else {
            // Satin acrylic edge: keep it subtle, it only sells the 2 mm.
            material.roughness = 0.62;
            material.metalness = 0.06;
          }
          material.needsUpdate = true;
        });
        resolve(gltf.scene);
      },
      undefined,
      reject,
    );
  });

  return cached;
};

export const usePlaqueModel = () => {
  const [model, setModel] = useState<Group | null>(null);

  useEffect(() => {
    const handle = delayRender("Loading plaque-bleue-3d.glb");
    let cancelled = false;
    loadPlaque()
      .then((scene) => {
        if (!cancelled) {
          setModel(scene);
        }
        continueRender(handle);
      })
      .catch((error) => {
        continueRender(handle);
        throw error;
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return model;
};
