export const STORAGE_KEYS = {
  theme: 'drawing-with-blockly-theme',
  language: 'drawing-with-blockly-language',
};

export const DEFAULT_THEME = 'light';
export const DEFAULT_LANGUAGE = 'en';

export const THEMES = {
  light: 'light',
  dark: 'dark',
};

export const LANGUAGES = {
  en: 'en',
  es: 'es',
};

export const readTheme = () => {
  const theme = window.localStorage.getItem(STORAGE_KEYS.theme);
  return theme === THEMES.dark ? THEMES.dark : DEFAULT_THEME;
};

export const writeTheme = (theme) => {
  window.localStorage.setItem(STORAGE_KEYS.theme, theme);
};

export const readLanguage = () => {
  const language = window.localStorage.getItem(STORAGE_KEYS.language);
  return language === LANGUAGES.es ? LANGUAGES.es : DEFAULT_LANGUAGE;
};

export const writeLanguage = (language) => {
  window.localStorage.setItem(STORAGE_KEYS.language, language);
};

export const applyThemeToDocument = (theme) => {
  document.documentElement.setAttribute('data-theme', theme);
};
