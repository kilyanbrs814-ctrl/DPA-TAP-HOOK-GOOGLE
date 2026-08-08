import React, { createContext, useContext } from "react";
import { T } from "./constants";

/** Timeline locale du reel NFC. Les valeurs sont exprimées en frames. */
export type DpaTiming = Record<keyof typeof T, number>;

const DpaTimingContext = createContext<DpaTiming>(T);

/**
 * Permet au Short de fournir ses propres repères sans modifier la timeline
 * historique utilisée par DpaTapFullVsl. Sans provider, tous les composants
 * continuent de lire `T` exactement comme avant.
 */
export const DpaTimingProvider: React.FC<{
  readonly timing?: DpaTiming;
  readonly children: React.ReactNode;
}> = ({ timing = T, children }) => (
  <DpaTimingContext.Provider value={timing}>
    {children}
  </DpaTimingContext.Provider>
);

export const useDpaTiming = () => useContext(DpaTimingContext);

export const starFrameAt = (
  timing: DpaTiming,
  index: number,
) => timing.starFirst + index * timing.starStep;
