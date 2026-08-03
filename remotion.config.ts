/**
 * Note: When using the Node.JS APIs, the config file
 * doesn't apply. Instead, pass options directly to the APIs.
 *
 * All configuration options: https://remotion.dev/docs/config
 */

import { Config } from "@remotion/cli/config";
import { enableTailwind } from '@remotion/tailwind-v4';

Config.setRspack(true);
Config.setVideoImageFormat("jpeg");
// La plaque NFC est un vrai modèle 3D rendu par @remotion/three : sans backend
// GL explicite, Chrome Headless tombe sur SwiftShader et le canvas peut sortir
// vide au rendu. Reprise du réglage du projet d'origine.
Config.setChromiumOpenGlRenderer("angle");
Config.setOverwriteOutput(true);
// Rspack est activé ci-dessus : l'override doit passer par le bundler,
// sinon Remotion ignore la configuration Tailwind et affiche un warning.
Config.overrideBundlerConfig(enableTailwind);
