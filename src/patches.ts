import { settings } from "./settings";
import type { WebpackToolsPatch } from "./types";

export const patches: WebpackToolsPatch[] = [];

if (settings.customAccent != null) {
  // TODO: maybe we should use the original values as a deviation from a standard color
  // (right now we just overwrite saturation/lightness which means you can't represent some shades of colors)
  function rgbToHsl(rgb: string): number {
    const r = parseInt(rgb.slice(0, 2), 16) / 255;
    const g = parseInt(rgb.slice(2, 4), 16) / 255;
    const b = parseInt(rgb.slice(4, 6), 16) / 255;

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

  let accent = settings.customAccent;
  if (accent.startsWith("#")) accent = accent.slice(1);
  const hue = rgbToHsl(accent);

  // patches @bsky.app/alf
  patches.push({
    name: "customAccent",
    find: ".DEFAULT_PALETTE=",
    replace: [
      // like color
      {
        match: '"#EC4899"',
        replacement: `"hsl(${hue}, 82%, 60%)"`
      },
      // main color palette
      {
        match: /(primary|positive|negative|contrast)_(\d+):"#[0-9a-fA-F]{6}"/g,
        replacement: (_, rawColor, intensityStr) => {
          type AlfColor = "primary" | "positive" | "negative" | "contrast";

          // replaces the old broken behavior. lol
          const hues = {
            primary: hue,
            positive: hue,
            negative: hue
          } as const;

          const color = rawColor as AlfColor;
          const intensity = parseInt(intensityStr, 10);

          let hsl: string;
          if (color === "contrast") {
            // Contrast is handled slightly differently
            const saturation = intensity >= 800 ? "28%" : intensity >= 600 ? "24%" : "20%";

            const lightnessTable: Record<number, string> = {
              0: "100%",
              25: "95%",
              50: "90%",
              100: "86%",
              200: "81%",
              300: "72%",
              400: "62%",
              500: "53%",
              600: "44%",
              700: "34%",
              800: "25%",
              900: "20%",
              950: "15%",
              975: "11%",
              1000: "6%"
            };

            hsl = `hsl(${hues.primary}, ${saturation}, ${lightnessTable[intensity]})`;
          } else {
            const lightnessTable: Record<number, string> = {
              0: `100%`,
              25: `97%`,
              50: `95%`,
              100: `90%`,
              200: `80%`,
              300: `70%`,
              400: `60%`,
              500: `50%`,
              600: `42%`,
              700: `34%`,
              800: `26%`,
              900: `18%`,
              950: `10%`,
              975: `7%`,
              1000: `0%`
            };

            const saturationTable: Record<Exclude<AlfColor, "contrast">, string> = {
              primary: "99%",
              positive: "82%",
              negative: "91%"
            };

            hsl = `hsl(${hues[color]}, ${saturationTable[color]}, ${lightnessTable[intensity]})`;
          }

          return `${color}_${intensity}:"${hsl}"`;
        }
      }
    ]
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
      replacement: (_, img) => `source:${img}.map(webpackRequire("nitesky/noJpeg").patchUri),placeholder:`
    }
  });

  // This targets the function that makes the `background-image: url()` style
  // I think this is the Expo image component? Maybe?
  patches.push({
    name: "noJpeg2",
    find: "Image: asset with ID ",
    replace: {
      match: /\.uri\);if\((.)\){/,
      replacement: (_, src) => `.uri);if(${src}){${src}=webpackRequire("nitesky/noJpeg").patchSrc(${src});`
    }
  });

  // Prevents PNGs from becoming JPEGs on upload
  // https://github.com/bluesky-social/social-app/blob/3685439ffb827fbad95b0244d28abdae6549ef4b/src/state/gallery.ts#L203
  patches.push({
    name: "noJpeg3",
    find: '"Failed to convert blob to data URI"',
    replace: [
      {
        match: /format:(.)\.SaveFormat\.JPEG,/,
        replacement: (_, saveFormat) => `format:${saveFormat}.SaveFormat.PNG,`
      },
      {
        match: 'mime:"image/jpeg",',
        replacement: 'mime:"image/png",'
      }
    ]
  });
}

if (settings.forceDidLink) {
  // This would call a function to check if the handle is invalid and assign a var holding the DID
  // We can just nop it so it never sets it
  const regex = /(\.isInvalidHandle\)\(.\.handle\))&&\(.=.\.handle\)/;
  patches.push({
    name: "forceDidLink",
    find: regex,
    replace: {
      match: regex,
      replacement: (_, orig) => orig
    }
  });
}

if (settings.noVia) {
  patches.push({
    name: "noVia",
    find: "toISOString(),via:",
    replace: {
      match: /(?<=\.toISOString\(\)),via:./g,
      replacement: ""
    }
  });
}

if (settings.tidSuffix) {
  const find = /(.)=(.{1,2})\.TID\.next\(.\);/;
  patches.push({
    name: "tidSuffix",
    find,
    replace: {
      match: find,
      replacement: (_, tid, obj) => `${tid} = webpackRequire("nitesky/tidSuffix").modifyTid(${tid}, ${obj}.TID);`
    }
  });
}
