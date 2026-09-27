import { settings } from "../settings";

const LABELERS_HEADER = "atproto-accept-labelers";
const MODERATION_DID = "did:plc:ar7c4by46qjdydhdevvrndac";

if (settings.disableBskyMod) {
  const origFetch = unsafeWindow.fetch;
  unsafeWindow.fetch = (input, init) => {
    if (input instanceof Request) {
      const labelers = input.headers.get(LABELERS_HEADER);
      if (labelers) {
        const separator = ", ";
        const newLabelers = labelers
          .split(separator)
          .filter((x) => !x.startsWith(MODERATION_DID))
          .join(separator);
        input.headers.set(LABELERS_HEADER, newLabelers);
      }
    }

    return origFetch(input, init);
  };
}
