import { bundle } from "@remotion/bundler";
import { selectComposition, renderStill } from "@remotion/renderer";
import { enableTailwind } from "@remotion/tailwind-v4";
import path from "node:path";
import fs from "node:fs";
const OUT = process.argv[2];
fs.mkdirSync(OUT, { recursive: true });
const frames = [702, 703, 714, 725, 735, 745, 760, 775, 795, 820, 882];
const serveUrl = await bundle({
  entryPoint: "C:/Users/user/Desktop/DPA-TAP-HOOK-GOOGLE/src/index.ts",
  webpackOverride: enableTailwind,
});
const composition = await selectComposition({ serveUrl, id: "DpaTapFullVsl", inputProps: {} });
for (const frame of frames) {
  await renderStill({
    composition, serveUrl,
    output: path.join(OUT, `DpaTapFullVsl-${String(frame).padStart(4, "0")}.png`),
    frame, imageFormat: "png", chromiumOptions: { gl: "angle" }, overwrite: true,
  });
}
console.log("ok", frames.length, "stills");
