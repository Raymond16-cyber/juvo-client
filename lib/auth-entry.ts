const ENTERING_KEY = "juvo.enteringApp";

export const AUTH_SESSION_LABEL = "Checking your session";
export const AUTH_ENTER_LABEL = "Getting your dashboard ready";

export function markEnteringApp() {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(ENTERING_KEY, "1");
}

export function isEnteringApp() {
  if (typeof window === "undefined") return false;
  return window.sessionStorage.getItem(ENTERING_KEY) === "1";
}

export function clearEnteringApp() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(ENTERING_KEY);
}
