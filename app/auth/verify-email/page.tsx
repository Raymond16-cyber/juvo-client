"use client";

import AuthShell from "@/components/auth/AuthShell";
import styles from "@/components/auth/AuthShell.module.css";
import { AUTH_ENTER_LABEL, markEnteringApp } from "@/lib/auth-entry";
import { getApiErrorMessage } from "@/lib/axios";
import { resendEmailVerification } from "@/services/auth.service";
import { useAuthStore } from "@/stores/auth.store";
import Link from "next/link";
import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function VerifyEmailPendingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const userEmail = user?.email || "";
  const queryEmail = searchParams.get("email") || "";
  const sentParam = searchParams.get("sent");
  const initiallyFailed = sentParam === "0";

  const [email, setEmail] = useState(queryEmail || userEmail);
  const [skipping, setSkipping] = useState(false);

  useEffect(() => {
    if (!email && (queryEmail || userEmail)) {
      setEmail(queryEmail || userEmail);
    }
  }, [email, queryEmail, userEmail]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(
    initiallyFailed
      ? "We created your account, but could not send the verification email yet. Use resend below."
      : "",
  );

  const helperCopy = useMemo(() => {
    if (initiallyFailed && !message) {
      return "Request a fresh verification link below, then open it from your inbox. You can also continue into JUVO and verify later.";
    }
    return "We sent a verification link to your email. Open it when you can. If the email is delayed, you can continue into JUVO and verify later.";
  }, [initiallyFailed, message]);

  const continueHref = user?.onboarding?.completed
    ? "/home/dashboard"
    : "/home/onboarding";

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

  function continueWithoutVerifying() {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }
    markEnteringApp();
    setSkipping(true);
    router.push(continueHref);
  }

  return (
    <AuthShell variant="verify">
      <div className={styles.intro}>
        <p className={styles.kicker}>One last step</p>
        <h1>Verify your email</h1>
        <p>{helperCopy}</p>
      </div>

      {message ? (
        <div role="status" className={styles.success}>
          {message}
        </div>
      ) : null}
      {error ? (
        <div role="alert" className={styles.error}>
          {error}
        </div>
      ) : null}

      <form className="space-y-4" onSubmit={resend}>
        <div>
          <label htmlFor="verifyEmail" className={styles.label}>
            Email address
          </label>
          <input
            id="verifyEmail"
            className={styles.input}
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        <button
          type="submit"
          disabled={busy || skipping}
          aria-busy={busy}
          className={styles.secondary}
        >
          {busy ? "Sending..." : "Resend verification link"}
        </button>
      </form>

      {isAuthenticated ? (
        <div className="mt-5 space-y-3">
          <button
            type="button"
            className={styles.submit}
            disabled={skipping}
            aria-busy={skipping}
            onClick={continueWithoutVerifying}
          >
            {skipping
              ? AUTH_ENTER_LABEL
              : user?.onboarding?.completed
                ? "Continue to dashboard"
                : "Continue to onboarding"}
          </button>
          <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
            Billing, broker connections, exports, and referrals stay locked until
            your email is verified. We will remind you on the dashboard.
          </p>
        </div>
      ) : null}

      <p className={styles.switch}>
        {isAuthenticated ? (
          <Link href="/home/general/settings" className={styles.link}>
            Back to settings
          </Link>
        ) : (
          <Link href="/auth/login" className={styles.link}>
            Continue to sign in
          </Link>
        )}
      </p>
    </AuthShell>
  );
}

export default function VerifyEmailPendingPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailPendingForm />
    </Suspense>
  );
}
