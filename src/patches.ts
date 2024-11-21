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
        match: /primary_(\d{2,3}):`hsl\(\${t.primary}, 99%, (\d{1,2})%\)`/g,
        replacement: (_, num, percent) => `primary_${num}:\`${newColor}\``
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
