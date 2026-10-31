"use client";

import { FormEvent, Suspense, useEffect, useRef, useState } from "react";
import { AxiosError } from "axios";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";
import styles from "@/components/auth/AuthShell.module.css";
import { useAuthStore } from "@/stores/auth.store";

function ResetPasswordForm({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    params.then(({ token: nextToken }) => {
      setToken(nextToken);
    });
  }, [params]);

  const resetPassword = useAuthStore((state) => state.resetPassword);

  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
    };
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!email) {
      setError(
        "Your password reset session is invalid. Please request a new code.",
      );
      return;
    }

    if (!token) {
      setError(
        "Your password reset session is invalid. Please request a new code.",
      );
      return;
    }

    if (!password) {
      setError("Please enter a new password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setIsLoading(true);

      await resetPassword({
        token,
        email,
        passwords: password,
      });

      setMessage("Your password has been reset successfully.");

      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
      redirectTimerRef.current = setTimeout(() => {
        router.push("/auth/login");
      }, 1500);
    } catch (cause) {
      const axiosError = cause as AxiosError<{ message?: string; error?: string }>;
      setError(
        axiosError.response?.data?.message ||
          axiosError.response?.data?.error ||
          "Unable to reset your password. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell variant="reset">
      <div className={styles.intro}>
        <p className={styles.kicker}>Password recovery</p>
        <h1>Reset your password</h1>
        <p>
          Create a new password for your JUVO account. Use at least 6
          characters.
        </p>
        {email ? (
          <p className={`${styles.hint} mt-3`}>
            Resetting password for <span className="font-medium">{email}</span>
          </p>
        ) : null}
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
          <label htmlFor="password" className={styles.label}>
            New password
          </label>
          <div className={styles.password}>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your new password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setError("");
              }}
              className={styles.input}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className={styles.passwordToggle}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="confirmPassword" className={styles.label}>
            Confirm password
          </label>
          <div className={styles.password}>
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your new password"
              value={confirmPassword}
              onChange={(event) => {
                setConfirmPassword(event.target.value);
                setError("");
              }}
              className={styles.input}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className={styles.passwordToggle}
              aria-label={
                showConfirmPassword ? "Hide password" : "Show password"
              }
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-400">
          <p className="mb-2 font-medium text-slate-700 dark:text-slate-300">
            Password requirements
          </p>
          <ul className="space-y-1">
            <li className={password.length >= 6 ? "text-emerald-600 dark:text-emerald-400" : ""}>
              • At least 6 characters
            </li>
            <li
              className={
                password && confirmPassword && password === confirmPassword
                  ? "text-emerald-600 dark:text-emerald-400"
                  : ""
              }
            >
              • Passwords must match
            </li>
          </ul>
        </div>

        <button
          type="submit"
          disabled={
            isLoading ||
            !password ||
            !confirmPassword ||
            password !== confirmPassword
          }
          aria-busy={isLoading}
          className={styles.submit}
        >
          {isLoading ? "Resetting password..." : "Reset password"}
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

export default function ResetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm params={params} />
    </Suspense>
  );
}
