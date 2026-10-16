export const ADMIN_HINT_COOKIE = "mandegar_admin";
export const SESSION_COOKIE_NAMES = ["__Host-mandegar_sid", "mandegar_sid"] as const;

export const hasAdminHint = () =>
  document.cookie.split("; ").some((entry) => entry === `${ADMIN_HINT_COOKIE}=1`);

export const clearAdminHint = () => {
  document.cookie = `${ADMIN_HINT_COOKIE}=; path=/; max-age=0`;
};
