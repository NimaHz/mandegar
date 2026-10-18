export const SWIPE_DISTANCE = 48;

export const scrollBehavior = (): ScrollBehavior =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";

export const isRtl = (element: Element) => getComputedStyle(element).direction === "rtl";

export const swipeStep = (element: Element, dx: number, dy = 0) => {
  if (Math.abs(dx) < SWIPE_DISTANCE || Math.abs(dx) < Math.abs(dy)) return 0;
  return (isRtl(element) ? dx > 0 : dx < 0) ? 1 : -1;
};
