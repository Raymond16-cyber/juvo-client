"use client";

import AuthLoadingScreen from "@/components/auth/AuthLoadingScreen";
import AuthShell from "@/components/auth/AuthShell";
import styles from "@/components/auth/AuthShell.module.css";
import GuestRoute from "@/components/auth/GuestRoute";
import { AUTH_ENTER_LABEL, markEnteringApp } from "@/lib/auth-entry";
import { getApiErrorCode, getApiErrorMessage } from "@/lib/axios";
import { getBetaModeStatus } from "@/services/auth.service";
import { useAuthStore } from "@/stores/auth.store";
import { Eye, EyeOff } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((state) => state.login);
  const storeError = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [testerCode, setTesterCode] = useState("");
  const [betaEnabled, setBetaEnabled] = useState(false);
  const [needsCode, setNeedsCode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [entering, setEntering] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    clearError();
    getBetaModeStatus()
      .then((status) => setBetaEnabled(Boolean(status.enabled)))
      .catch(() => setBetaEnabled(false));
  }, [clearError]);

  const visibleError = error || storeError;

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    clearError();
    setLoading(true);

    try {
      const response = await login({
        email,
        password,
        ...(testerCode.trim() ? { testerCode: testerCode.trim() } : {}),
      });
      const nextPath = searchParams.get("next");
      const safeNext =
        nextPath?.startsWith("/home") &&
        !nextPath.startsWith("/home/onboarding")
          ? nextPath
          : "/home/dashboard";

      markEnteringApp();
      setEntering(true);
      router.push(
        response.user?.onboarding?.completed ? safeNext : "/home/onboarding",
      );
      return;
    } catch (loginError: unknown) {
      const code = getApiErrorCode(loginError);
      if (code === "BETA_ACCESS_REQUIRED") {
        setNeedsCode(true);
        setBetaEnabled(true);
      }
      if (code === "BETA_ACCESS_EXPIRED" || code === "BETA_ACCESS_REVOKED") {
        router.replace(`/beta-ended?code=${encodeURIComponent(code)}`);
        return;
      }
      setError(getApiErrorMessage(loginError, "Invalid email or password."));
      setLoading(false);
    }
  };

  if (entering) {
    return <AuthLoadingScreen label={AUTH_ENTER_LABEL} />;
  }

  return (
    <AuthShell variant="login">
      <div className={styles.intro}>
        <h1>{betaEnabled ? "Private Beta Access" : "Welcome back"}</h1>
        <p>
          {betaEnabled
            ? "JUVO is currently available to invited testers. Sign in with your account — enter a tester code if you have not activated access yet."
            : "Welcome back to your journal."}
        </p>
      </div>

      {visibleError ? (
        <div role="alert" className={styles.error}>
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
          <label htmlFor="password" className={styles.label}>
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
        {betaEnabled || needsCode ? (
          <div>
            <label htmlFor="testerCode" className={styles.label}>
              Tester access code {needsCode ? "(required)" : "(if needed)"}
            </label>
            <input
              id="testerCode"
              name="testerCode"
              type="text"
              autoComplete="one-time-code"
              spellCheck={false}
              required={needsCode}
              value={testerCode}
              onChange={(event) => {
                setTesterCode(event.target.value.toUpperCase());
                if (error) setError("");
              }}
              placeholder="JUVO-TEST-XXXX-XXXX-XXXX"
              className={styles.input}
            />
            <p className="mt-2 text-xs leading-5 text-slate-400">
              Approved testers can leave this blank. No code?{" "}
              <Link href="/waitlist" className={styles.link}>
                Contact the JUVO team
              </Link>
              .
            </p>
          </div>
        ) : null}
        <Link
          href={"/auth/forgot-password"}
          className={`${styles.link} ${styles.forgot} opacity-50`}
        >
          Forgot password?
        </Link>
        <button
          type="submit"
          disabled={loading}
          aria-busy={loading}
          className={styles.submit}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <Link href={"/auth/register"} className={styles.switch}>
        Don&apos;t have an account?{" "}
        <span aria-disabled="false" className={`${styles.link} opacity-50`}>
          Register
        </span>
      </Link>
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
