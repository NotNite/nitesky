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
      }
    ]
  },
  // TODO this doesnt work
  {
    name: "brandColor2",
    find: /#1083fe/g,
    replace: {
      match: /#1083fe/g,
      replacement: newColor
    }
  },
  {
    name: "birthday",
    find: "Birthday",
    replace: {
      match: /Birthday/g,
      replacement: "meow"
    }
  }
];
