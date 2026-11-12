export type ThemeMode = "light" | "dark" | "auto";
export const THEME_KEY = "app:theme";

export function storedTheme(): ThemeMode {
  const saved = localStorage.getItem(THEME_KEY);
  return saved === "light" || saved === "dark" || saved === "auto" ? saved : "auto";
}

export function applyTheme(mode: ThemeMode): void {
  const dark = mode === "dark" || (mode === "auto" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
}
