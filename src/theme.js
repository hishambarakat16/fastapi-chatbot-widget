const modules = import.meta.glob("./styles/themes/theme-*.css", {
  eager: false,
});

export const THEMES = Object.keys(modules)
  .map((p) => {
    const m = p.match(/theme-(.+)\.css$/);
    return m ? m[1] : null;
  })
  .filter(Boolean)
  .sort()
  .map((id) => ({
    id,
    label: id
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" "),
  }));

export const THEME_STORAGE_KEY = "theme";
export const DEFAULT_THEME = "classic";

export function normalizeTheme(v) {
  return THEMES.some((t) => t.id === v) ? v : DEFAULT_THEME;
}

export function applyTheme(themeId) {
  const id = normalizeTheme(themeId);
  document.documentElement.dataset.theme = id;
  localStorage.setItem(THEME_STORAGE_KEY, id);
  return id;
}

export function getInitialTheme() {
  return normalizeTheme(localStorage.getItem(THEME_STORAGE_KEY));
}
