"use client";

import AuthShell from "@/components/auth/AuthShell";
import styles from "@/components/auth/AuthShell.module.css";
import { getApiErrorMessage } from "@/lib/axios";
import { resendEmailVerification } from "@/services/auth.service";
import { useAuthStore } from "@/stores/auth.store";
import Link from "next/link";
import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

function VerifyEmailPendingForm() {
  const searchParams = useSearchParams();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const userEmail = useAuthStore((state) => state.user?.email || "");
  const queryEmail = searchParams.get("email") || "";
  const sentParam = searchParams.get("sent");
  const initiallyFailed = sentParam === "0";

  const [email, setEmail] = useState(queryEmail || userEmail);

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
      return "Request a fresh verification link below, then open it from your inbox.";
    }
    return "We sent a verification link to your email. Open the link to confirm your account before continuing.";
  }, [initiallyFailed, message]);

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
          disabled={busy}
          aria-busy={busy}
          className={styles.secondary}
        >
          {busy ? "Sending..." : "Resend verification link"}
        </button>
      </form>

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
