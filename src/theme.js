export const THEMES = [
  { id: "classic", label: "Classic" },
  { id: "lux", label: "Lux" },
];

export const THEME_STORAGE_KEY = "theme";
export const DEFAULT_THEME = "classic";

export function normalizeTheme(v) {
  return THEMES.some((t) => t.id === v) ? v : DEFAULT_THEME;
}

export function applyTheme(themeId) {
  document.documentElement.dataset.theme = themeId;
  localStorage.setItem(THEME_STORAGE_KEY, themeId);
}

export function getInitialTheme() {
  return normalizeTheme(localStorage.getItem(THEME_STORAGE_KEY));
}
