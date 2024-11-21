import { WebpackToolsPatch } from "./types";

const newColor = "#CB2027";

export const patches: WebpackToolsPatch[] = [
  {
    name: "brandColor",
    find: "#0085ff",
    replace: [
      {
        match: /blue(.):"#[0-9a-fA-F]{6}"/g,
        replacement: (_, digit) => `blue${digit}:"${newColor}"`
      },
      {
        match: /{start:"#[0-9a-fA-F]{6}",end:(.{1,3}\.blue3)}/g,
        replacement: (_, end) => `{start:"${newColor}",end:${end}}`
      },
      {
        match: /brandBlue:"#[0-9a-fA-F]{6}"/g,
        replacement: `brandBlue:"${newColor}"`
      },
      {
        match: /{primary:(.{1,2}),negative:(.{1,2}),positive:(.{1,2})}/g,
        replacement: (_, primary, negative, positive) =>
          `{primary:358,negative:358,positive:358}` // lol
      },
      {
        match: /like:"#[0-9a-fA-F]{6}"/g,
        replacement: `like:"${newColor}"`
      }
    ]
  },
  {
    name: "brandColor2",
    find: /#1083fe/g,
    replace: {
      match: /#1083fe/g,
      replacement: newColor
    }
  }
];
