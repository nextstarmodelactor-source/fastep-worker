export const HOUR_MS = 60 * 60 * 1000;
export const MIN_MS = 60 * 1000;

export function nowUtc() {
  return new Date();
}

export function addMs(date, ms) {
  return new Date(date.getTime() + ms);
}

export function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}
