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
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [entering, setEntering] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    clearError();
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
      });
      markEnteringApp();
      setEntering(true);
      router.push("/home/onboarding");
      return;
    } catch (registerError: unknown) {
      setError(
        getApiErrorMessage(registerError, "Registration failed. Please try again."),
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
        <h1>
          Register for JUVO
        </h1>
        <p>
          Start your trading journal. Build your own perspective.
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
          <label
            htmlFor="registerEmail"
            className={styles.label}
          >
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
          <label
            htmlFor="registerPassword"
            className={styles.label}
          >
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
          <p id="password-hint" className={styles.hint}>Use at least 8 characters.</p>
        </div>
        <button type="submit" disabled={loading} aria-busy={loading} className={styles.submit}>
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
