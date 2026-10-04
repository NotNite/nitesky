function patchImgSrc(src?: string) {
  if (!src) return src;
  src = src?.replace("@jpeg", "@png")?.replace("@webp", "@png");

  // the default quality is webp, so we'll force it to png, only if it's not a special URI
  const shouldIgnore = src.startsWith("data:") || src.startsWith("blurhash:");
  if (src && !src.includes("@") && !shouldIgnore) src += "@png";
  return src;
}

export function patchImgUri(img?: { uri?: string }) {
  if (!img) {
    return img;
  } else {
    return { ...img, uri: patchImgSrc(img.uri) };
  }
}
