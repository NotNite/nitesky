import type { Settings } from "./src/settings";
import type { WebpackToolsConfig } from "./src/types";

declare global {
  interface NiteskyHatches {}

  interface Nitesky {
    settings: Settings;
    hatches: NiteskyHatches;
  }

  interface Window {
    __webpackTools_config: WebpackToolsConfig;
    nitesky: Nitesky;
  }

  const unsafeWindow: Window;
  const GM_addElement: (name: string, attributes: any) => HTMLElement;
  const WEBPACKTOOLS_RUNTIME: string;
  const NITESKY_WP_MODULES: Record<string, string>;
}
