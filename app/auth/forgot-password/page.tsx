"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthShell from "@/components/auth/AuthShell";
import styles from "@/components/auth/AuthShell.module.css";
import { useAuthStore } from "@/stores/auth.store";

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const requestResetPassword = useAuthStore(
    (state) => state.requestResetPassword,
  );
  const resetPasswordToken = useAuthStore((state) => state.resetPasswordToken);
  const clearError = useAuthStore((state) => state.clearError);
  const error = useAuthStore((state) => state.error);
  const isLoading = useAuthStore((state) => state.isLoading);
  const message = useAuthStore((state) => state.message);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearError();
    try {
      await requestResetPassword({ email });
    } catch {
      // The auth store already exposes a user-facing error.
    }
  };

  useEffect(() => {
    if (message && resetPasswordToken) {
      router.push(
        `/auth/verify-otp-code/${resetPasswordToken}?email=${encodeURIComponent(email)}`,
      );
    }
  }, [email, message, resetPasswordToken, router]);

  return (
    <AuthShell variant="forgot">
      <div className={styles.intro}>
        <p className={styles.kicker}>Password recovery</p>
        <h1>Forgot your password?</h1>
        <p>
          Enter your email address and we&apos;ll send you a 6-digit verification
          code to reset your password.
        </p>
      </div>

      {error ? (
        <div role="alert" className={styles.error}>
          {error}
        </div>
      ) : null}
      {message ? (
        <div role="status" className={styles.success}>
          {message}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className={styles.label}>
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Enter your email"
            className={styles.input}
          />
        </div>

        <button
          type="submit"
          className={styles.submit}
          disabled={isLoading}
          aria-busy={isLoading}
        >
          {isLoading ? "Sending..." : "Send reset code"}
        </button>
      </form>

      <p className={styles.switch}>
        <Link href="/auth/login" className={styles.link}>
          ← Back to sign in
        </Link>
      </p>
    </AuthShell>
  );
}
