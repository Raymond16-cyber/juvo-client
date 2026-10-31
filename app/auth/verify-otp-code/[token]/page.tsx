"use client";

import { FormEvent, useEffect, useState } from "react";
import { AxiosError } from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthShell from "@/components/auth/AuthShell";
import styles from "@/components/auth/AuthShell.module.css";
import { useAuthStore } from "@/stores/auth.store";

interface VerifyOtpPageProps {
  params: Promise<{
    token: string;
  }>;
}

export default function VerifyOtpPage({ params }: VerifyOtpPageProps) {
  const router = useRouter();

  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  const verifyOtp = useAuthStore((state) => state.verifyOtpCode);

  useEffect(() => {
    params.then(({ token: nextToken }) => {
      setToken(nextToken);
      const urlParams = new URLSearchParams(window.location.search);
      setEmail(urlParams.get("email"));
    });
  }, [params]);

  const handleOtpChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/\D/g, "");
    if (value.length <= 6) {
      setOtp(value);
    }
    setError("");
  };

  const handleVerifyOtp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token) {
      setError("Verification token is missing.");
      return;
    }

    if (!email) {
      setError("Email is missing. Please request a new verification code.");
      return;
    }

    if (otp.length !== 6) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      setMessage(null);

      const result = await verifyOtp({
        token,
        otp,
        email,
      });

      setMessage(result.message);

      router.push(
        `/auth/reset-password/${result.resetPasswordToken}?email=${encodeURIComponent(email)}`,
      );
    } catch (cause) {
      const axiosError = cause as AxiosError<{
        error?: string;
        message?: string;
      }>;

      setError(
        axiosError.response?.data?.error ||
          axiosError.response?.data?.message ||
          "Unable to verify the OTP. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell variant="otp">
      <div className={styles.intro}>
        <p className={styles.kicker}>Password recovery</p>
        <h1>Enter verification code</h1>
        <p>
          We sent a 6-digit verification code to your email. Enter it below to
          continue resetting your password.
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

      <form onSubmit={handleVerifyOtp} className="space-y-5">
        <div>
          <label htmlFor="otp" className={styles.label}>
            Verification code
          </label>
          <input
            id="otp"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={otp}
            onChange={handleOtpChange}
            placeholder="000000"
            className={`${styles.input} text-center text-2xl font-semibold tracking-[0.4em]`}
          />
          <p className={styles.hint}>Enter the 6-digit code from your email.</p>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          aria-busy={isLoading}
          className={styles.submit}
        >
          {isLoading ? "Verifying..." : "Verify code"}
        </button>
      </form>

      <p className={styles.switch}>
        <Link href="/auth/forgot-password" className={styles.link}>
          Request a new code
        </Link>
        {" · "}
        <Link href="/auth/login" className={styles.link}>
          Back to sign in
        </Link>
      </p>
    </AuthShell>
  );
}
