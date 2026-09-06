"use client";

import React, { useState } from "react";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, ArrowLeft } from "lucide-react";

import AuthVisual from "@/components/auth/AuthVisual";
import Button from "@/components/ui/Button";
import Header from "@/components/Header";
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

  React.useEffect(() => {
    params.then(({ token }) => {
      setToken(token);
      const urlParams = new URLSearchParams(window.location.search);
      const emailParam = urlParams.get("email");
      setEmail(emailParam);
    });
  }, [params]);

  const handleOtpChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/\D/g, "");

    if (value.length <= 6) {
      setOtp(value);
    }

    setError("");
  };

  const handleVerifyOtp = async (event: React.FormEvent<HTMLFormElement>) => {
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
    } catch (error) {
      const axiosError = error as AxiosError<{
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
    <div className="dark-page-shell min-h-screen overflow-x-hidden">
      <Header />

      <main className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-10 lg:px-16">
        <div className="grid w-full max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <section className="mx-auto w-full max-w-md">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
              <ShieldCheck className="h-7 w-7 text-primary" />
            </div>

            <div className="mb-8">
              <h1 className="mb-3 text-3xl font-semibold text-white">
                Verify your email
              </h1>

              <p className="text-sm leading-6 text-slate-400">
                We&apos;ve sent a 6-digit verification code to your email. Enter
                the code below to continue your JUVO journey.
              </p>
            </div>
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div>
                <label
                  htmlFor="otp"
                  className="mb-2 block text-sm text-slate-300"
                >
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
                  className="w-full rounded-md border border-slate-700 bg-transparent px-4 py-4 text-center text-2xl font-semibold tracking-[0.5em] text-white outline-none placeholder:text-slate-600 focus:border-white"
                />

                <p className="mt-2 text-xs text-slate-500">
                  Enter the 6-digit code sent to your email.
                </p>
              </div>

              {error && (
                <div className="rounded-md border border-red-500/20 bg-red-500/5 px-4 py-3">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              {message && (
                <div className="rounded-md border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
                  <p className="text-sm text-emerald-400">{message}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="w-full"
              >
                {isLoading ? "Verifying..." : "Verify Email"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-500">
                Didn&apos;t receive the code?
              </p>

              <Link
                href="/auth/forgot-password"
                className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-white transition hover:text-primary"
              >
                Request a new reset link
              </Link>
            </div>

            <div className="mt-8 border-t border-white/5 pt-6">
              <Link
                href="/auth/register"
                className="mx-auto flex w-fit items-center gap-2 text-sm text-slate-400 transition hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to registration
              </Link>
            </div>
          </section>

          <AuthVisual />
        </div>
      </main>
    </div>
  );
}
