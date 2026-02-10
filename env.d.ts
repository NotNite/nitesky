import type { Settings } from "./src/settings";

declare global {
  interface Nitesky {
    settings: Settings;
  }

  interface Window {
    __webpackTools_config: any;
    nitesky: Nitesky;
  }

  const unsafeWindow: Window;
  const GM_addElement: (name: string, attributes: any) => HTMLElement;
  const WEBPACKTOOLS_RUNTIME: string;
  const NITESKY_WP_MODULES: Record<string, string>;
}

export {};
