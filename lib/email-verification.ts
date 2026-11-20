const REMINDER_DISMISS_KEY = "juvo.emailVerify.reminderDismissedUntil";
const REMINDER_COOLDOWN_MS = 1000 * 60 * 60 * 24; // 24 hours

export function getVerifyEmailPath(email?: string | null) {
  const params = new URLSearchParams();
  if (email) params.set("email", email);
  const query = params.toString();
  return query ? `/auth/verify-email?${query}` : "/auth/verify-email";
}

export function isEmailVerificationReminderDue() {
  if (typeof window === "undefined") return true;
  const raw = window.localStorage.getItem(REMINDER_DISMISS_KEY);
  if (!raw) return true;
  const until = Number(raw);
  if (!Number.isFinite(until)) return true;
  return Date.now() >= until;
}

export function dismissEmailVerificationReminder(
  cooldownMs: number = REMINDER_COOLDOWN_MS,
) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    REMINDER_DISMISS_KEY,
    String(Date.now() + cooldownMs),
  );
}

export function clearEmailVerificationReminderDismiss() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(REMINDER_DISMISS_KEY);
}
