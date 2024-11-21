declare global {
  interface Window {
    __webpackTools_config: any;
  }

  const unsafeWindow: Window;
  const GM_addElement: (name: string, attributes: any) => HTMLElement;
  const WEBPACKTOOLS_RUNTIME: string;
  const NITESKY_WP_MODULES: Record<string, string>;
}

export {};
