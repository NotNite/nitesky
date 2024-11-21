import WebpackRequire from "./require";

export type WebpackModule = {
  id: string | number;
  loaded?: boolean;
  exports: any;
};

export type WebpackRequireType = typeof WebpackRequire & {
  c: Record<string, WebpackModule>;
  m: Record<string, WebpackModuleFunc>;
  e: (module: number | string) => Promise<void>;
};

export type WebpackModuleFunc = (
  module: any,
  exports: any,
  require: WebpackRequireType
) => void;

export type WebpackToolsSiteConfig = {
  name: string;
  chunkObject: string;
  webpackVersion: "4" | "5";
  patchAll?: boolean;
  modules?: WebpackToolsModule[];
  patches?: WebpackToolsPatch[];
  injectSpacepack?: boolean;
  patchEntryChunk?: boolean;
};

type WebpackToolsModuleNeeds = string | RegExp | { moduleId: string };
export type WebpackToolsModule = {
  name: string;
  needs: WebpackToolsModuleNeeds[] | Set<WebpackToolsModuleNeeds>;
  entry?: boolean;
  run?: WebpackModuleFunc;
};
export type WebpackToolsPatch = {
  name: string;
  find: RegExp | string | (RegExp | string)[];
  replace: WebpackToolsPatchReplace | WebpackToolsPatchReplace[];
};

export type WebpackToolsPatchReplace = {
  match: string | RegExp;
  replacement: string | ((substring: string, ...args: string[]) => string);
};

export type WebpackToolsSpacepackEverywhere = {
  enabled?: boolean;
  ignoreSites?: string[];
  ignoreChunkObjects?: string[];
};

export type WebpackToolsConfig = {
  siteConfigs: WebpackToolsSiteConfig[];
  spacepackEverywhere?: WebpackToolsSpacepackEverywhere;
};
