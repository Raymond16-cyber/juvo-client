"use client";

import AuthLoadingScreen from "@/components/auth/AuthLoadingScreen";
import AuthShell from "@/components/auth/AuthShell";
import styles from "@/components/auth/AuthShell.module.css";
import GuestRoute from "@/components/auth/GuestRoute";
import { AUTH_ENTER_LABEL, markEnteringApp } from "@/lib/auth-entry";
import { getApiErrorMessage } from "@/lib/axios";
import { useAuthStore } from "@/stores/auth.store";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((state) => state.login);
  const storeError = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [entering, setEntering] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    clearError();
  }, [clearError]);

  const visibleError = error || storeError;

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    clearError();
    setLoading(true);

    try {
      const response = await login({ email, password });
      const nextPath = searchParams.get("next");
      const safeNext =
        nextPath?.startsWith("/home") && !nextPath.startsWith("/home/onboarding")
          ? nextPath
          : "/home/dashboard";

      markEnteringApp();
      setEntering(true);
      router.push(
        response.user?.onboarding?.completed ? safeNext : "/home/onboarding",
      );
      return;
    } catch (loginError: unknown) {
      setError(
        getApiErrorMessage(loginError, "Invalid email or password."),
      );
      setLoading(false);
    }
  };

  if (entering) {
    return <AuthLoadingScreen label={AUTH_ENTER_LABEL} />;
  }

  return (
    <AuthShell variant="login">
      <div className={styles.intro}>
        <h1>
          Welcome back
        </h1>
        <p>
          Welcome back to your journal.
        </p>
      </div>

      {visibleError ? (
        <div
          role="alert"
          className={styles.error}
        >
          {visibleError}
        </div>
      ) : null}

      <form className="space-y-5" onSubmit={handleLogin}>
        <div>
          <label htmlFor="email" className={styles.label}>
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              if (error) setError("");
            }}
            placeholder="Enter your email"
            className={styles.input}
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className={styles.label}
          >
            Password
          </label>
          <div className={styles.password}>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                if (error) setError("");
              }}
              placeholder="Enter your password"
              className={styles.input}
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className={styles.passwordToggle}
              aria-label={showPassword ? "Hide password" : "Show password"}
              title={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        <Link
          href="/auth/forgot-password"
          className={`${styles.link} ${styles.forgot}`}
        >
          Forgot password?
        </Link>
        <button type="submit" disabled={loading} aria-busy={loading} className={styles.submit}>
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <p className={styles.switch}>
        Don&apos;t have an account?{" "}
        <Link
          href="/auth/register"
          className={styles.link}
        >
          Register
        </Link>
      </p>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <GuestRoute>
        <LoginForm />
      </GuestRoute>
    </Suspense>
  );
}
