export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = Exclude<ThemePreference, "system">;

export const THEME_STORAGE_KEY = "mandegar:theme";
export const THEME_COLORS: Record<ResolvedTheme, string> = { light: "#f3f6f6", dark: "#071318" };

export const LIGHT_QUERY = "(prefers-color-scheme: light)";
export const DARK_QUERY = "(prefers-color-scheme: dark)";

export const isThemePreference = (value: unknown): value is ThemePreference =>
  value === "light" || value === "dark" || value === "system";

export const resolveTheme = (preference: ThemePreference): ResolvedTheme =>
  preference === "system" ? (window.matchMedia(DARK_QUERY).matches ? "dark" : "light") : preference;

export const readThemePreference = (): ThemePreference => {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return isThemePreference(stored) ? stored : "system";
  } catch {
    return "system";
  }
};

export const applyTheme = (theme: ResolvedTheme) => {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
};

export const applyStoredTheme = () => applyTheme(resolveTheme(readThemePreference()));

export const themeBootScript = `(function(){try{var p=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)});var d=p==="dark"||((!p||p==="system")&&matchMedia(${JSON.stringify(
  DARK_QUERY,
)}).matches);var t=d?"dark":"light";document.documentElement.dataset.theme=t;document.documentElement.style.colorScheme=t;if(p==="dark"||p==="light"){var c=${JSON.stringify(
  THEME_COLORS,
)}[t];document.querySelectorAll('meta[name="theme-color"]').forEach(function(m){m.media=m.content===c?"all":"not all";});}}catch(e){}})();`;
