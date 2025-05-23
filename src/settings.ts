type Settings = {
  customAccent?: string;
  noJpeg: boolean;
  forceDidLink: boolean;
};

const localStorageKey = "nitesky-settings";
const defaultSettings: Settings = {
  customAccent: undefined,
  noJpeg: true,
  forceDidLink: true
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
