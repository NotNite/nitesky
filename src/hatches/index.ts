import { patchImgUri } from "./noJpeg";
import { modifyTid } from "./tidSuffix";

declare global {
  interface NiteskyHatches {
    patchImgUri: typeof patchImgUri;
    modifyTid: typeof modifyTid;
  }
}

const hatches: NiteskyHatches = {
  patchImgUri,
  modifyTid
};

export default hatches;
