type Settings = {
  customAccent: string | null;
};

const localStorageKey = "nitesky-settings";
const defaultSettings = {
  customAccent: "#CB2027"
};

function readSettings(): Settings {
  const settings = localStorage.getItem(localStorageKey);
  if (settings == null) {
    return JSON.parse(JSON.stringify(defaultSettings));
  } else {
    return JSON.parse(settings);
  }
}

export const settings = readSettings();
writeSettings(); // to save the default settings

export function writeSettings() {
  localStorage.setItem(localStorageKey, JSON.stringify(settings));
}
