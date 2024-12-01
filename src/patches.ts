import { WebpackToolsPatch } from "./types";
import { settings } from "./settings";

export const patches: WebpackToolsPatch[] = [];

if (settings.customAccent != null) {
  function rgbToHsl(rgb: string): number {
    const r = parseInt(rgb.slice(1, 3), 16) / 255;
    const g = parseInt(rgb.slice(3, 5), 16) / 255;
    const b = parseInt(rgb.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;

    let h = 0;
    if (delta !== 0) {
      if (max === r) {
        h = 60 * (((g - b) / delta) % 6);
      } else if (max === g) {
        h = 60 * ((b - r) / delta + 2);
      } else {
        h = 60 * ((r - g) / delta + 4);
      }
    }

    return h;
  }

  const hue = rgbToHsl(settings.customAccent);

  patches.push({
    name: "brandColor",
    find: "#0085ff",
    replace: [
      {
        match: /blue(.):"#[0-9a-fA-F]{6}"/g,
        replacement: (_, digit) => `blue${digit}:"${settings.customAccent}"`
      },
      {
        match: /{start:"#[0-9a-fA-F]{6}",end:(.{1,3}\.blue3)}/g,
        replacement: (_, end) => `{start:"${settings.customAccent}",end:${end}}`
      },
      {
        match: /brandBlue:"#[0-9a-fA-F]{6}"/g,
        replacement: `brandBlue:"${settings.customAccent}"`
      },
      {
        match: /{primary:(.{1,2}),negative:(.{1,2}),positive:(.{1,2})}/g,
        replacement: (_, primary, negative, positive) =>
          `{primary:${hue},negative:${hue},positive:${hue}}` // lol
      },
      {
        match: /like:"#[0-9a-fA-F]{6}"/g,
        // Copy pasted from one of the primary_ colors
        replacement: `like:"hsl(${hue}, 82%, 60%)"`
      }
    ]
  });

  patches.push({
    name: "brandColor2",
    find: /#1083fe/g,
    replace: {
      match: /#1083fe/g,
      replacement: settings.customAccent
    }
  });
}

if (settings.noJpeg) {
  // This targets what I think is the gallery thumbnails?
  const regex = /source:(.\(.\)),placeholder:/;
  patches.push({
    name: "noJpeg",
    find: regex,
    replace: {
      match: regex,
      replacement: (_, img) => `source:${img}.map((img) => {
        const fix = (src) => src?.replace("@jpeg", "@png");
        return typeof img === "string" ? fix(img) : { ...img, uri: fix(img.uri) };
      }),placeholder:`
    }
  });

  // This targets the function that makes the `background-image: url()` style
  // I think this is the Expo image component? Maybe?
  patches.push({
    name: "noJpeg2",
    find: "Image: asset with ID ",
    replace: {
      match: /\.uri\);if\((.)\){/,
      replacement: (_, src) =>
        `.uri);if(${src}){${src}=${src}.replace("@jpeg", "@png");`
    }
  });
}
