import hatches from "./hatches";
import { installPatcher, patchesToApply } from "./metro";
import { settings } from "./settings";

unsafeWindow.nitesky = {
  settings,
  hatches,
  // @ts-expect-error
  patchesToApply
};

installPatcher();
