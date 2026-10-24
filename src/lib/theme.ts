// Theme + display preferences, stored per browser and applied as classes on <html>
export type ThemePreference = 'light' | 'dark' | 'system';

export interface DisplaySettings {
  theme: ThemePreference;
  reduceMotion: boolean;
}

export const SETTINGS_KEY = 'tripsure_settings';
export const DEFAULT_SETTINGS: DisplaySettings = { theme: 'system', reduceMotion: false };

export const loadSettings = (): DisplaySettings => {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<DisplaySettings>) } : DEFAULT_SETTINGS;
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
};

export const saveSettings = (settings: DisplaySettings): void => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {}
};

// The blue & white site is light only; the stored preference is kept but no longer applied
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const resolveDark = (_theme: ThemePreference): boolean => false;

export const applySettings = (settings: DisplaySettings): void => {
  const root = document.documentElement;
  root.classList.toggle('dark', resolveDark(settings.theme));
  root.classList.toggle('reduce-motion', settings.reduceMotion);
};

// Inline <head> script: applies the saved reduced-motion preference before first paint
export const THEME_INIT_SCRIPT = `(function(){try{var s=JSON.parse(localStorage.getItem('${SETTINGS_KEY}')||'{}');if(s.reduceMotion)document.documentElement.classList.add('reduce-motion');}catch(e){}})();`;
