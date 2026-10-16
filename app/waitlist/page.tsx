"use client";

import AuthShell from "@/components/auth/AuthShell";
import { getApiErrorMessage } from "@/lib/axios";
import {
  joinWaitlistService,
  retryWaitlistInvitationService,
} from "@/services/waitlist.service";
import { FormEvent, useState } from "react";

export default function WaitlistPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [retry, setRetry] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      const response = retry
        ? await retryWaitlistInvitationService(email)
        : await joinWaitlistService({ email, name });
      setSuccess(response.message);
      if (!retry) setName("");
    } catch (cause) {
      setError(
        getApiErrorMessage(
          cause,
          "We could not process your request. Please try again.",
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
            Early access
          </p>
          <h1 className="mt-1 text-3xl font-bold text-slate-950 dark:text-white">
            Join the JUVO waitlist
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
            Get an invitation to build a calmer, more honest trading review
            practice. Your invitation email includes 40% off your first
            successful qualifying subscription payment.
          </p>
        </div>
        {error ? (
          <p
            role="alert"
            className="rounded-xl bg-rose-500/10 px-3 py-2 text-sm text-rose-700 dark:text-rose-300"
          >
            {error}
          </p>
        ) : null}
        {success ? (
          <p
            role="status"
            className="rounded-xl bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300"
          >
            {success}
          </p>
        ) : null}
        <form className="space-y-4" onSubmit={submit}>
          {!retry ? (
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
              Name{" "}
              <span className="font-normal text-slate-400">(optional)</span>
              <input
                className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-primary dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoComplete="name"
              />
            </label>
          ) : null}
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
            Email address
            <input
              className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-primary dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="inline-flex h-11 w-full items-center justify-center rounded-full bg-primary px-5 text-sm font-bold text-slate-950 transition hover:bg-secondary disabled:opacity-60"
          >
            {busy
              ? "Please wait..."
              : retry
                ? "Resend invitation"
                : "Join waitlist"}
          </button>
        </form>
        <button
          type="button"
          className="text-sm font-semibold text-primary underline underline-offset-4"
          onClick={() => {
            setRetry((value) => !value);
            setError("");
            setSuccess("");
          }}
        >
          {retry
            ? "I have not joined the waitlist yet"
            : "Already joined but did not receive the email?"}
        </button>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Already have an account?{" "}
          <span
            aria-disabled="true"
            className="font-bold text-primary opacity-50"
          >
            Sign in
          </span>
        </p>
      </div>
    </AuthShell>
  );
}
