/* eslint-disable no-console */
// This build script is a bunch of dumb hacks to keep it in one build
import * as esbuild from "esbuild";
import path from "path";
import fs from "fs";

const prod = process.env.NODE_ENV === "production";
const watch = process.argv.includes("--watch");
const clean = process.argv.includes("--clean");

const external = [];

let lastMessages = new Set();
/** @type {import("esbuild").Plugin} */
const deduplicatedLogging = {
  name: "deduplicated-logging",
  setup(build) {
    build.onStart(() => {
      lastMessages.clear();
    });

    build.onEnd(async (result) => {
      const formatted = await Promise.all([
        esbuild.formatMessages(result.warnings, {
          kind: "warning",
          color: true
        }),
        esbuild.formatMessages(result.errors, { kind: "error", color: true })
      ]).then((a) => a.flat());

      // console.log(formatted);
      for (const message of formatted) {
        if (lastMessages.has(message)) continue;
        lastMessages.add(message);
        console.log(message.trim());
      }
    });
  }
};

const outdir = path.resolve("dist");
const runtime = fs.readFileSync("webpackTools.runtime.js", "utf8");
const banner = `
// ==UserScript==
// @name         nitesky
// @namespace    https://notnite.com
// @version      1.0.0
// @description  Bluesky client mod
// @author       NotNite
// @include      https://bsky.app/*
// @grant        GM_addElement
// @run-at       document-start
// ==/UserScript==
`.trimStart();

/** @type {import("esbuild").Plugin} */
const packager = {
  name: "packager",
  setup(build) {
    build.onEnd(async (result) => {
      const webpackModules = {};
      let template = null;
      for (const file of result.outputFiles) {
        const filePath = path.relative(outdir, file.path).replaceAll("\\", "/");
        const contentsStr = new TextDecoder().decode(file.contents);
        if (filePath === "index.js") {
          template = contentsStr;
          continue;
        }

        let [type, name] = filePath.split("/");
        if (name == null) continue;
        name = name.replace(/\.js$/, "");
        if (type === "webpackModules") {
          webpackModules[name] = contentsStr;
        }
      }

      const final =
        banner +
        template
          .replace("NITESKY_WP_MODULES", JSON.stringify(webpackModules))
          // Dumb hack to dodge globalName
          .replace("var nitesky =", "");
      fs.writeFileSync("nitesky.user.js", final);
    });
  }
};

async function build() {
  /** @type {import("esbuild").BuildOptions} */
  const esbuildConfig = {
    entryPoints: ["src/index.ts", "src/webpackModules/*.ts"],
    write: false,
    outdir,

    format: "iife",
    globalName: "nitesky", // so we can return the value of the wp modules
    platform: "browser",

    treeShaking: true,
    bundle: true,
    minify: prod,
    sourcemap: "inline",

    external,

    logLevel: "silent",
    plugins: [deduplicatedLogging, packager],
    define: {
      WEBPACKTOOLS_RUNTIME: JSON.stringify(runtime)
    }
  };

  if (watch) {
    const ctx = await esbuild.context(esbuildConfig);
    await ctx.watch();
  } else {
    await esbuild.build(esbuildConfig);
  }
}

if (clean) {
  fs.rmSync("./dist", { recursive: true, force: true });
} else {
  await build();
}
