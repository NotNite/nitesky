import { patches } from "./patches";
import { settings } from "./settings";

export const patchesToApply = new Set(patches);

export type PatchFind = RegExp | string | (RegExp | string)[];

export type Patch = {
  name: string;
  find: PatchFind;
  replace: PatchReplace | PatchReplace[];
};
export type PatchReplace = {
  match: string | RegExp;
  replacement: string | ((substring: string, ...args: string[]) => string);
};

// TODO
export type MetroFactory = (
  global: any,
  metroRequire: any,
  metroImportDefault: any,
  metroImportAll: any,
  moduleObject: any,
  moduleExports: any,
  dependencyMap: any
) => void;

export type MetroDefine = (factory: MetroFactory, moduleId: number, dependencyMap: unknown) => void;

function matchModule(moduleStr: string, queryArg: PatchFind) {
  const queryArray = Array.isArray(queryArg) ? queryArg : [queryArg];
  return !queryArray.some((query) => {
    if (query instanceof RegExp) {
      return !query.test(moduleStr);
    } else {
      return !moduleStr.includes(query);
    }
  });
}

function patchFactory(factory: MetroFactory, id: number): MetroFactory {
  let funcStr = Function.prototype.toString.apply(factory);
  const origStr = funcStr;

  const matchingPatches = [];
  for (const patch of patchesToApply) {
    if (patch.find)
      if (matchModule(funcStr, patch.find)) {
        matchingPatches.push(patch);
        patchesToApply.delete(patch);
      }
  }

  for (const patch of matchingPatches) {
    const replacements = Array.isArray(patch.replace) ? patch.replace : [patch.replace];
    for (const replacement of replacements) {
      // @ts-expect-error whatever
      funcStr = funcStr.replace(replacement.match, replacement.replacement);
    }
  }

  if (matchingPatches.length > 0 && funcStr === origStr) {
    console.log("patch failed", factory, matchingPatches);
  }

  if (matchingPatches.length > 0 || settings.patchAll) {
    let debugString = "";
    if (matchingPatches.length > 0) {
      debugString += `Patched by: ${matchingPatches.map((patch) => patch.name).join(", ")}`;
    }

    return new Function(
      "_global",
      "_metroRequire",
      "_metroImportDefault",
      "_metroImportAll",
      "_moduleObject",
      "_moduleExports",
      "_dependencyMap",
      `(${funcStr}).apply(this, arguments)\n// ${debugString}\n//# sourceURL=Metro-Module-${id}`
    ) as MetroFactory;
  } else {
    return factory;
  }
}

export function installPatcher() {
  let oldDefine: MetroDefine | null = null;
  const fakeDefine: MetroDefine = (factory, moduleId, dependencyMap) => {
    const patched = patchFactory(factory, moduleId);
    oldDefine!(patched, moduleId, dependencyMap);
  };

  Object.defineProperty(unsafeWindow, "__d", {
    get() {
      if (oldDefine) {
        return fakeDefine;
      } else {
        return undefined;
      }
    },
    set(v) {
      if (!oldDefine) {
        oldDefine = v;
      }
    }
  });
}
