function patchImgSrc(src?: string) {
  if (!src) return src;
  src = src?.replace("@jpeg", "@png")?.replace("@webp", "@png");

  // the default quality is webp, so we'll force it to png, only if it's not a data URI
  if (src && !src.includes("@") && !src.startsWith("data:")) src += "@png";
  return src;
}

export function patchImgUri(img?: { uri?: string }) {
  if (!img) {
    return img;
  } else {
    return { ...img, uri: patchImgSrc(img.uri) };
  }
}
