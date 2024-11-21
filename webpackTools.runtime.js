(() => {
  // src/matchModule.js
  function matchModule(moduleStr, queryArg) {
    const queryArray = queryArg instanceof Array ? queryArg : [queryArg];
    return !queryArray.some((query) => {
      if (query instanceof RegExp) {
        return !query.test(moduleStr);
      } else {
        return !moduleStr.includes(query);
      }
    });
  }

  // src/spacepackLite.js
  var namedRequireMap = {
    p: "publicPath",
    s: "entryModuleId",
    c: "moduleCache",
    m: "moduleFactories",
    e: "ensureChunk",
    f: "ensureChunkHandlers",
    E: "prefetchChunk",
    F: "prefetchChunkHandlers",
    G: "preloadChunk",
    H: "preloadChunkHandlers",
    d: "definePropertyGetters",
    r: "makeNamespaceObject",
    t: "createFakeNamespaceObject",
    n: "compatGetDefaultExport",
    hmd: "harmonyModuleDecorator",
    nmd: "nodeModuleDecorator",
    h: "getFullHash",
    w: "wasmInstances",
    v: "instantiateWasm",
    oe: "uncaughtErrorHandler",
    nc: "scriptNonce",
    l: "loadScript",
    ts: "createScript",
    tu: "createScriptUrl",
    tt: "getTrustedTypesPolicy",
    cn: "chunkName",
    j: "runtimeId",
    u: "getChunkScriptFilename",
    k: "getChunkCssFilename",
    hu: "getChunkUpdateScriptFilename",
    hk: "getChunkUpdateCssFilename",
    x: "startup",
    X: "startupEntrypoint",
    O: "onChunksLoaded",
    C: "externalInstallChunk",
    i: "interceptModuleExecution",
    g: "global",
    S: "shareScopeMap",
    I: "initializeSharing",
    R: "currentRemoteGetScope",
    hmrF: "getUpdateManifestFilename",
    hmrM: "hmrDownloadManifest",
    hmrC: "hmrDownloadUpdateHandlers",
    hmrD: "hmrModuleData",
    hmrI: "hmrInvalidateModuleHandlers",
    hmrS: "hmrRuntimeStatePrefix",
    amdD: "amdDefine",
    amdO: "amdOptions",
    System: "system",
    o: "hasOwnProperty",
    y: "systemContext",
    b: "baseURI",
    U: "relativeUrl",
    a: "asyncModule"
  };
  function getNamedRequire(webpackRequire) {
    const namedRequireObj = {};
    Object.getOwnPropertyNames(webpackRequire).forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(namedRequireMap, key)) {
        namedRequireObj[namedRequireMap[key]] = webpackRequire[key];
      }
    });
    return namedRequireObj;
  }
  function getSpacepack(chunkObject, logSuccess = false) {
    function spacepack(module, exports, webpackRequire) {
      if (logSuccess) {
        if (!chunkObject) {
          console.log("[wpTools] spacepack loaded");
        } else {
          console.log("[wpTools] spacepack loaded in " + chunkObject);
        }
      }
      function findByExports(keysArg) {
        if (!webpackRequire.c) {
          throw new Error("webpack runtime didn't export its moduleCache");
        }
        const keys = keysArg instanceof Array ? keysArg : [keysArg];
        return Object.entries(webpackRequire.c).filter(([moduleId, exportCache]) => {
          return !keys.some((searchKey) => {
            return !(exportCache !== void 0 && exportCache !== window && (exports?.[searchKey] || exports?.default?.[searchKey]));
          });
        }).map(([moduleId, exportCache]) => {
          return exportCache;
        });
      }
      function findByCode(search) {
        return Object.entries(webpackRequire.m).filter(([moduleId, moduleFunc]) => {
          const funcStr = Function.prototype.toString.apply(moduleFunc);
          return matchModule(funcStr, search);
        }).map(([moduleId, moduleFunc]) => {
          try {
            return {
              id: moduleId,
              exports: webpackRequire(moduleId)
            };
          } catch (error) {
            console.error("Failed to require module: " + error);
            return {
              id: moduleId,
              exports: {}
            };
          }
        });
      }
      function findObjectFromKey(exports2, key) {
        let subKey;
        if (key.indexOf(".") > -1) {
          const splitKey = key.split(".");
          key = splitKey[0];
          subKey = splitKey[1];
        }
        for (const exportKey in exports2) {
          const obj = exports2[exportKey];
          if (obj && obj[key] !== void 0) {
            if (subKey) {
              if (obj[key][subKey])
                return obj;
            } else {
              return obj;
            }
          }
        }
        return null;
      }
      function findObjectFromValue(exports2, value) {
        for (const exportKey in exports2) {
          const obj = exports2[exportKey];
          if (obj == value)
            return obj;
          for (const subKey in obj) {
            if (obj && obj[subKey] == value) {
              return obj;
            }
          }
        }
        return null;
      }
      function findObjectFromKeyValuePair(exports2, key, value) {
        for (const exportKey in exports2) {
          const obj = exports2[exportKey];
          if (obj && obj[key] == value) {
            return obj;
          }
        }
        return null;
      }
      function findFunctionByStrings(exports2, ...strings) {
        return Object.entries(exports2).filter(
          ([index, func]) => typeof func === "function" && !strings.some(
            (query) => !(query instanceof RegExp ? func.toString().match(query) : func.toString().includes(query))
          )
        )?.[0]?.[1] ?? null;
      }
      function inspect(moduleId) {
        return webpackRequire.m[moduleId];
      }
      const exportedRequire = module.exports.default = exports.default = {
        require: webpackRequire,
        modules: webpackRequire.m,
        cache: webpackRequire.c,
        __namedRequire: getNamedRequire(webpackRequire),
        findByCode,
        findByExports,
        findObjectFromKey,
        findObjectFromKeyValuePair,
        findObjectFromValue,
        findFunctionByStrings,
        inspect
      };
      if (chunkObject) {
        exportedRequire.chunkObject = window[chunkObject];
        exportedRequire.name = chunkObject;
      }
      if (window.wpTools) {
        const runtimesRegistry = window.wpTools.runtimes;
        if (runtimesRegistry[chunkObject]) {
          console.warn("[wpTools] Multiple active runtimes for " + chunkObject);
          let currId = 0;
          if (runtimesRegistry[chunkObject].__wpTools_multiRuntime_id) {
            currId = runtimesRegistry[chunkObject].__wpTools_multiRuntime_id;
          }
          runtimesRegistry[chunkObject + "_" + currId] = runtimesRegistry[chunkObject];
          currId++;
          runtimesRegistry[chunkObject + "_" + currId] = exportedRequire;
          runtimesRegistry[chunkObject] = exportedRequire;
        }
        runtimesRegistry[chunkObject] = exportedRequire;
        window["spacepack_" + chunkObject] = exportedRequire;
      }
      window["spacepack"] = exportedRequire;
    }
    spacepack.__wpt_processed = true;
    return spacepack;
  }

  // src/Patcher.js
  var ConfigValidationError = class extends Error {
  };
  function validateProperty(name, object, key, required, validationCallback) {
    if (!Object.prototype.hasOwnProperty.call(object, [key])) {
      if (required) {
        throw new ConfigValidationError(`Required property not found, missing ${key} in ${name}`);
      } else {
        return;
      }
    } else {
      if (!validationCallback(object[key])) {
        throw new ConfigValidationError(
          `Failed to validate ${key} in ${name}. The following check failed: 
${validationCallback.toString()}`
        );
      }
    }
  }
  var Patcher = class {
    constructor(config) {
      this._validateConfig(config);
      this.name = config.name;
      this.chunkObject = config.chunkObject;
      this.webpackVersion = config.webpackVersion.toString();
      this.patchAll = config.patchAll;
      this.modules = new Set(config.modules ?? []);
      for (const module of this.modules) {
        this._validateModuleConfig(module);
      }
      this.patches = new Set(config.patches ?? []);
      for (const patch of this.patches) {
        this._validatePatchConfig(patch);
      }
      this.patchesToApply = /* @__PURE__ */ new Set();
      if (this.patches) {
        for (const patch of this.patches) {
          if (patch.replace instanceof Array) {
            for (const index in patch.replace) {
              this.patchesToApply.add({
                name: patch.name + "_" + index,
                find: patch.find,
                replace: patch.replace[index]
              });
            }
            continue;
          }
          this.patchesToApply.add(patch);
        }
      }
      this.modulesToInject = /* @__PURE__ */ new Set();
      if (this.modules) {
        for (const module of this.modules) {
          if (module.needs !== void 0 && module.needs instanceof Array) {
            module.needs = new Set(module.needs);
          }
          this.modulesToInject.add(module);
        }
      }
      if (config.injectSpacepack !== false) {
        this.modulesToInject.add({
          name: "spacepack",
          // This is sorta a scope hack.
          // If we rewrap this function, it will lose its scope (in this case the match module import and the chunk object name)
          run: getSpacepack(this.chunkObject),
          entry: true
        });
      }
      if (config.patchEntryChunk) {
        this.modulesToInject.add({
          name: "patchEntryChunk",
          run: (module, exports, webpackRequire) => {
            this._patchModules(webpackRequire.m);
          },
          entry: true
        });
        this.patchEntryChunk = true;
      }
    }
    run() {
      if (this.webpackVersion === "4" || this.webpackVersion === "5") {
        this._interceptWebpackModern();
      } else {
        this._interceptWebpackLegacy;
      }
    }
    _interceptWebpackModern() {
      let realChunkObject = window[this.chunkObject];
      const patcher = this;
      Object.defineProperty(window, this.chunkObject, {
        set: function set(value) {
          realChunkObject = value;
          if (patcher.patchEntryChunk) {
            let newChunk = [["patchEntryChunk"], {}];
            patcher._injectModules(newChunk);
            realChunkObject.push(newChunk);
          }
          if (!value.push.__wpt_injected) {
            realChunkObject = value;
            const realPush = value.push;
            value.push = function(chunk) {
              if (!chunk.__wpt_processed) {
                chunk.__wpt_processed = true;
                patcher._patchModules(chunk[1]);
                patcher._injectModules(chunk);
              }
              return realPush.apply(this, arguments);
            };
            value.push.__wpt_injected = true;
            if (realPush === Array.prototype.push) {
              console.log("[wpTools] Injected " + patcher.chunkObject + " (before webpack runtime)");
            } else {
              console.log("[wpTools] Injected " + patcher.chunkObject + " (at webpack runtime)");
            }
          }
        },
        get: function get() {
          return realChunkObject;
        },
        configurable: true
      });
    }
    _interceptWebpackLegacy() {
    }
    _patchModules(modules) {
      for (const id in modules) {
        if (modules[id].__wpt_processed) {
          continue;
        }
        let funcStr = Function.prototype.toString.apply(modules[id]);
        const matchingPatches = [];
        for (const patch of this.patchesToApply) {
          if (matchModule(funcStr, patch.find)) {
            matchingPatches.push(patch);
            this.patchesToApply.delete(patch);
          }
        }
        for (const patch of matchingPatches) {
          funcStr = funcStr.replace(patch.replace.match, patch.replace.replacement);
        }
        if (matchingPatches.length > 0 || this.patchAll) {
          let debugString = "";
          if (matchingPatches.length > 0) {
            debugString += "Patched by: " + matchingPatches.map((patch) => patch.name).join(", ");
          }
          modules[id] = new Function(
            "module",
            "exports",
            "webpackRequire",
            `(${funcStr}).apply(this, arguments)
// ${debugString}
//# sourceURL=${this.chunkObject}-Module-${id}`
          );
          modules[id].__wpt_patched = true;
        }
        modules[id].__wpt_funcStr = funcStr;
        modules[id].__wpt_processed = true;
      }
    }
    _injectModules(chunk) {
      const readyModules = /* @__PURE__ */ new Set();
      for (const moduleToInject of this.modulesToInject) {
        if (moduleToInject?.needs?.size > 0) {
          for (const need of moduleToInject.needs) {
            for (const wpModule of Object.entries(chunk[1])) {
              if (need?.moduleId && wpModule[0] === need.moduleId || matchModule(wpModule[1].__wpt_funcStr, need)) {
                moduleToInject.needs.delete(need);
                if (moduleToInject.needs.size === 0) {
                  readyModules.add(moduleToInject);
                }
                break;
              }
            }
          }
        } else {
          readyModules.add(moduleToInject);
        }
      }
      if (readyModules.size > 0) {
        const injectModules = {};
        const injectEntries = [];
        for (const readyModule of readyModules) {
          this.modulesToInject.delete(readyModule);
          injectModules[readyModule.name] = readyModule.run;
          if (readyModule.entry) {
            injectEntries.push(readyModule.name);
          }
        }
        if (chunk[1] instanceof Array) {
          const origChunkArray = chunk[1];
          chunk[1] = {};
          origChunkArray.forEach((module, index) => {
            chunk[1][index] = module;
          });
        }
        chunk[1] = Object.assign(chunk[1], injectModules);
        if (injectEntries.length > 0) {
          switch (this.webpackVersion) {
            case "5":
              if (chunk[2]) {
                const originalEntry = chunk[2];
                chunk[2] = function(webpackRequire) {
                  originalEntry.apply(this, arguments);
                  injectEntries.forEach(webpackRequire);
                };
              } else {
                chunk[2] = function(webpackRequire) {
                  injectEntries.forEach(webpackRequire);
                };
              }
              break;
            case "4":
              if (chunk[2]?.[0]) {
                chunk[2]?.[0].concat([injectEntries]);
              } else {
                chunk[2] = [injectEntries];
              }
              break;
          }
        }
      }
    }
    _validateConfig(config) {
      validateProperty("siteConfigs[?]", config, "name", true, (value) => {
        return typeof value === "string";
      });
      const name = config.name;
      validateProperty(`siteConfigs[${name}]`, config, "chunkObject", true, (value) => {
        return typeof value === "string";
      });
      validateProperty(`siteConfigs[${name}]`, config, "webpackVersion", true, (value) => {
        return ["4", "5"].includes(value.toString());
      });
      validateProperty(`siteConfigs[${name}]`, config, "patchAll", false, (value) => {
        return typeof value === "boolean";
      });
      validateProperty(`siteConfigs[${name}]`, config, "modules", false, (value) => {
        return value instanceof Array;
      });
      validateProperty(`siteConfigs[${name}]`, config, "patches", false, (value) => {
        return value instanceof Array;
      });
      validateProperty(`siteConfigs[${name}]`, config, "injectSpacepack", false, (value) => {
        return typeof value === "boolean";
      });
      validateProperty(`siteConfigs[${name}]`, config, "patchEntryChunk", false, (value) => {
        return typeof value === "boolean";
      });
    }
    _validatePatchReplacement(replace, name, index) {
      let indexStr = index === void 0 ? "" : `[${index}]`;
      validateProperty(
        `siteConfigs[${this.name}].patches[${name}].replace${indexStr}`,
        replace,
        "match",
        true,
        (value) => {
          return typeof value === "string" || value instanceof RegExp;
        }
      );
      validateProperty(`siteConfigs[${this.name}].patches[${name}].replace`, replace, "replacement", true, (value) => {
        return typeof value === "string" || value instanceof Function;
      });
    }
    _validatePatchConfig(config) {
      validateProperty(`siteConfigs[${this.name}].patches[?]`, config, "name", true, (value) => {
        return typeof value === "string";
      });
      const name = config.name;
      validateProperty(`siteConfigs[${this.name}].patches[${name}]`, config, "find", true, (value) => {
        return (
          // RegExp, String, or an Array of RegExps and Strings
          typeof value === "string" || value instanceof RegExp || value instanceof Array && !value.some((value2) => {
            !(typeof value2 === "string" || value2 instanceof RegExp);
          })
        );
      });
      validateProperty(`siteConfigs[${this.name}].patches[${name}]`, config, "replace", true, (value) => {
        return typeof value === "object";
      });
      if (config.replace instanceof Array) {
        config.replace.forEach((replacement, index) => {
          this._validatePatchReplacement(replacement, name, index);
        });
      } else {
        this._validatePatchReplacement(config.replace, name);
      }
    }
    _validateModuleConfig(config) {
      validateProperty(`siteConfigs[${this.name}].modules[?]`, config, "name", true, (value) => {
        return typeof value === "string";
      });
      const name = config.name;
      validateProperty(`siteConfigs[${this.name}].modules[${name}]`, config, "needs", false, (value) => {
        return (value instanceof Array || value instanceof Set) && ![...value].some((value2) => {
          !(typeof value2 === "string" || value2 instanceof RegExp || value2 instanceof Object && typeof value2.moduleId === "string");
        });
      });
      validateProperty(`siteConfigs[${this.name}].modules[${name}]`, config, "run", true, (value) => {
        return typeof value === "function";
      });
      validateProperty(`siteConfigs[${this.name}].modules[${name}]`, config, "entry", false, (value) => {
        return typeof value === "boolean";
      });
      if (config.entry === void 0) {
        config.entry = false;
      }
    }
  };

  // src/spacepackEverywhere.js
  function getWebpackVersion(chunkObject) {
    if (chunkObject instanceof Array) {
      return "modern";
    } else {
      return "legacy";
    }
  }
  var onChunkLoaded = function(webpackRequire) {
    webpackRequire("spacepack");
  };
  onChunkLoaded[0] = ["spacepack"];
  onChunkLoaded[Symbol.iterator] = function() {
    return {
      read: false,
      next() {
        if (!this.read) {
          this.read = true;
          return { done: false, value: 0 };
        } else {
          return { done: true };
        }
      }
    };
  };
  function pushSpacepack(chunkObjectName) {
    const chunkObject = window[chunkObjectName];
    if (chunkObject.__spacepack_everywhere_injected) {
      return;
    }
    const version = getWebpackVersion(chunkObject);
    console.log("[wpTools] Got " + chunkObjectName + " using webpack " + version + " :)");
    switch (version) {
      case "modern":
        chunkObject.__spacepack_everywhere_injected = true;
        chunkObject.push([["spacepack"], { spacepack: getSpacepack(chunkObjectName, true) }, onChunkLoaded]);
        break;
      case "legacy":
        console.log("[wpTools] Legacy is not currently supported. Please share this site to https://github.com/moonlight-mod/webpackTools/issues/1 to help with development of legacy support");
        break;
    }
  }
  function spacepackEverywhere(config) {
    if (config?.ignoreSites?.includes(window.location.host)) {
      return;
    }
    for (const key of Object.getOwnPropertyNames(window)) {
      if ((key.includes("webpackJsonp") || key.includes("webpackChunk") || key.includes("__LOADABLE_LOADED_CHUNKS__")) && !key.startsWith("spacepack") && !config?.ignoreChunkObjects?.includes(key)) {
        pushSpacepack(key);
      }
    }
  }

  // src/entry/userscript.js
  var globalConfig = window.__webpackTools_config;
  delete window.__webpackTools_config;
  var siteConfigs = /* @__PURE__ */ new Set();
  for (let siteConfig of globalConfig.siteConfigs) {
    if (siteConfig.matchSites?.includes(window.location.host)) {
      siteConfigs.add(siteConfig);
      break;
    }
  }
  window.wpTools = {
    globalConfig,
    activeSiteConfigs: siteConfigs,
    spacepackEverywhereDetect: () => {
      spacepackEverywhere(globalConfig.spacepackEverywhere);
    },
    runtimes: {}
  };
  if (siteConfigs.size > 0) {
    for (const siteConfig of siteConfigs) {
      const patcher = new Patcher(siteConfig);
      patcher.run();
    }
  } else if (globalConfig?.spacepackEverywhere?.enabled !== false) {
    window.addEventListener("load", () => {
      spacepackEverywhere(globalConfig.spacepackEverywhere);
    });
  }
})();

//# sourceURL=wpTools