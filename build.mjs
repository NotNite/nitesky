/* eslint-disable no-console */
// This build script is a bunch of dumb hacks to keep it in one build
import fs from "node:fs";
import path from "node:path";
import * as esbuild from "esbuild";

const prod = process.env.NODE_ENV === "production";
const watch = process.argv.includes("--watch");
const clean = process.argv.includes("--clean");

const external = [];

const lastMessages = new Set();
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

async function build() {
  /** @type {import("esbuild").BuildOptions} */
  const esbuildConfig = {
    entryPoints: ["src/index.ts"],
    outfile: path.resolve("dist", "nitesky.user.js"),

    format: "iife",
    platform: "browser",

    treeShaking: true,
    bundle: true,
    minify: prod,
    sourcemap: "inline",

    external,

    logLevel: "silent",
    plugins: [deduplicatedLogging],

    banner: {
      js: `// ==UserScript==
// @name         nitesky
// @namespace    https://notnite.com
// @version      1.0.0
// @description  Bluesky client mod
// @author       NotNite
// @homepageURL  https://github.com/NotNite/nitesky
// @downloadURL  https://notnite.github.io/nitesky/nitesky.user.js
// @include      https://bsky.app/*
// @grant        GM_addElement
// @run-at       document-start
// ==/UserScript==
`
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
