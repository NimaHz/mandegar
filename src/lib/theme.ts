export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = Exclude<ThemePreference, "system">;

export const THEME_STORAGE_KEY = "mandegar:theme";
export const THEME_COLORS: Record<ResolvedTheme, string> = { light: "#f3f6f6", dark: "#071318" };

export const DARK_QUERY = "(prefers-color-scheme: dark)";

export const isThemePreference = (value: unknown): value is ThemePreference =>
  value === "light" || value === "dark" || value === "system";

export const resolveTheme = (preference: ThemePreference): ResolvedTheme =>
  preference === "system" ? (window.matchMedia(DARK_QUERY).matches ? "dark" : "light") : preference;

export const applyTheme = (theme: ResolvedTheme) => {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
  document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach((meta) => {
    meta.content = THEME_COLORS[theme];
  });
};

export const themeBootScript = `(function(){try{var p=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)});var d=p==="dark"||((!p||p==="system")&&matchMedia(${JSON.stringify(
  DARK_QUERY,
)}).matches);var t=d?"dark":"light";document.documentElement.dataset.theme=t;document.documentElement.style.colorScheme=t;}catch(e){}})();`;
