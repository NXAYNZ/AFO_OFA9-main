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

export const resolveDark = (theme: ThemePreference): boolean =>
  theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

export const applySettings = (settings: DisplaySettings): void => {
  const root = document.documentElement;
  root.classList.toggle('dark', resolveDark(settings.theme));
  root.classList.toggle('reduce-motion', settings.reduceMotion);
};

// Inline <head> script: applies the saved theme before first paint so dark mode does not flash white
export const THEME_INIT_SCRIPT = `(function(){try{var s=JSON.parse(localStorage.getItem('${SETTINGS_KEY}')||'{}');var t=s.theme||'system';var d=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);var r=document.documentElement;if(d)r.classList.add('dark');if(s.reduceMotion)r.classList.add('reduce-motion');}catch(e){}})();`;
