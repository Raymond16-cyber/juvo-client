"use client";

import AuthShell from "@/components/auth/AuthShell";
import { getApiErrorMessage } from "@/lib/axios";
import { resendEmailVerification } from "@/services/auth.service";
import { FormEvent, useState } from "react";

export default function VerifyEmailPendingPage() {
  const [email, setEmail] = useState(() =>
    typeof window === "undefined"
      ? ""
      : new URLSearchParams(window.location.search).get("email") || "",
  );
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function resend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      setMessage((await resendEmailVerification(email)).message);
    } catch (cause) {
      setError(
        getApiErrorMessage(
          cause,
          "We could not resend the verification email.",
        ),
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell variant="register">
      <div className="space-y-5">
        <div>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            One last step
          </p>
          <h1 className="mt-1 text-3xl font-bold text-slate-950 dark:text-white">
            Verify your email
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
            We sent a verification link to your email. Verify it before using an
            invitation code or starting a discounted checkout.
          </p>
        </div>
        {message ? (
          <p
            role="status"
            className="rounded-xl bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300"
          >
            {message}
          </p>
        ) : null}
        {error ? (
          <p
            role="alert"
            className="rounded-xl bg-rose-500/10 px-3 py-2 text-sm text-rose-700 dark:text-rose-300"
          >
            {error}
          </p>
        ) : null}
        <form className="space-y-4" onSubmit={resend}>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
            Email address
            <input
              className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-primary dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="inline-flex h-11 w-full items-center justify-center rounded-full border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:opacity-60 dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
          >
            {busy ? "Sending..." : "Resend verification email"}
          </button>
        </form>
        <span
          aria-disabled="true"
          className="block text-sm font-bold text-primary opacity-50"
        >
          Continue to sign in
        </span>
      </div>
    </AuthShell>
  );
}
