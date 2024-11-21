import { patches } from "./patches";
import type { WebpackModuleFunc, WebpackToolsModule } from "./types";

const modules: WebpackToolsModule[] = [
  {
    name: "niteskyInit",
    needs: []
  }
];

const funcs = NITESKY_WP_MODULES;
for (const [name, funcStr] of Object.entries(funcs)) {
  const func = new Function(
    "module",
    "exports",
    "require",
    funcStr + "\nmodule.exports = nitesky;"
  ) as WebpackModuleFunc;
  const entry = modules.find((m) => m.name === name);
  if (entry != null) entry.run = func;
}

unsafeWindow.__webpackTools_config = {
  siteConfigs: [
    {
      name: "bluesky",
      chunkObject: "webpackChunkweb",
      webpackVersion: "5",
      matchSites: ["bsky.app"],
      patchAll: true,
      injectSpacepack: true,
      patchEntryChunk: true,

      patches,
      modules
    }
  ]
};

// https://moonlight-mod.github.io/webpackTools/webpackTools.runtime.json
GM_addElement("script", {
  textContent: WEBPACKTOOLS_RUNTIME
});
