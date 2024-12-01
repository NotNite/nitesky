type Settings = {
  customAccent: string | null;
  noJpeg: boolean;
};

const localStorageKey = "nitesky-settings";
const defaultSettings: Settings = {
  customAccent: "#CB2027",
  noJpeg: true
};

function readSettings(): Settings {
  const settings = localStorage.getItem(localStorageKey);
  if (settings == null) {
    return JSON.parse(JSON.stringify(defaultSettings));
  } else {
    let obj: Settings = JSON.parse(settings);
    obj = { ...defaultSettings, ...obj };
    return obj;
  }
}

export const settings = readSettings();
writeSettings(); // to save the default settings

export function writeSettings() {
  localStorage.setItem(localStorageKey, JSON.stringify(settings));
}
