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
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

function RegisterForm() {
  const router = useRouter();
  const register = useAuthStore((state) => state.register);
  const storeError = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [testerCode, setTesterCode] = useState("");
  const [betaEnabled, setBetaEnabled] = useState(false);
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

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    clearError();
    setLoading(true);

    try {
      await register({
        fullName,
        email,
        password,
        ...(testerCode.trim() ? { testerCode: testerCode.trim() } : {}),
      });
      markEnteringApp();
      setEntering(true);
      router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`);
      return;
    } catch (registerError: unknown) {
      const code = getApiErrorCode(registerError);
      if (code === "BETA_ACCESS_REQUIRED" || code === "BETA_CODE_INVALID") {
        setBetaEnabled(true);
      }
      setError(
        getApiErrorMessage(
          registerError,
          "Registration failed. Please try again.",
        ),
      );
      setLoading(false);
    }
  };

  if (entering) {
    return <AuthLoadingScreen label={AUTH_ENTER_LABEL} />;
  }

  return (
    <AuthShell variant="register">
      <div className={styles.intro}>
        <h1>{betaEnabled ? "Private Beta Access" : "Register for JUVO"}</h1>
        <p>
          {betaEnabled
            ? "JUVO is currently available to invited testers. Enter your tester access code to get started."
            : "Start your trading journal. Build your own perspective."}
        </p>
      </div>

      {visibleError ? (
        <div role="alert" className={styles.error}>
          {visibleError}
        </div>
      ) : null}

      <form className="space-y-5" onSubmit={handleRegister}>
        <div>
          <label htmlFor="fullName" className={styles.label}>
            Full Name
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            autoComplete="name"
            placeholder="Enter your full name"
            required
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            className={styles.input}
          />
        </div>
        <div>
          <label htmlFor="registerEmail" className={styles.label}>
            Email
          </label>
          <input
            id="registerEmail"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="Enter your email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={styles.input}
          />
        </div>
        <div>
          <label htmlFor="registerPassword" className={styles.label}>
            Password
          </label>
          <div className={styles.password}>
            <input
              id="registerPassword"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              aria-describedby="password-hint"
              placeholder="Create a password"
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
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
          <p id="password-hint" className={styles.hint}>
            Use at least 8 characters.
          </p>
        </div>
        {betaEnabled ? (
          <div>
            <label htmlFor="testerCode" className={styles.label}>
              Tester access code
            </label>
            <input
              id="testerCode"
              name="testerCode"
              type="text"
              autoComplete="one-time-code"
              spellCheck={false}
              required
              value={testerCode}
              onChange={(event) => setTesterCode(event.target.value.toUpperCase())}
              placeholder="JUVO-TEST-XXXX-XXXX-XXXX"
              className={styles.input}
            />
            <p className="mt-2 text-xs leading-5 text-slate-400">
              Don&apos;t have a code?{" "}
              <Link href="/waitlist" className={styles.link}>
                Contact the JUVO team
              </Link>
              .
            </p>
          </div>
        ) : null}
        <button
          type="submit"
          disabled={loading}
          aria-busy={loading}
          className={styles.submit}
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <p className={styles.switch}>
        Already have an account?{" "}
        <Link href="/auth/login" className={styles.link}>
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}

export default function RegisterPage() {
  return (
    <GuestRoute>
      <RegisterForm />
    </GuestRoute>
  );
}
