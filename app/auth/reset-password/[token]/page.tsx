"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { LockKeyhole, ArrowLeft, Eye, EyeOff } from "lucide-react";

import Button from "@/components/ui/Button";
import Header from "@/components/Header";
import images from "@/constants/images.service";
import { useAuthStore } from "@/stores/auth.store";

export default function ResetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get email from URL
  const email = searchParams.get("email");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [token, setToken] = useState<string | null>(null);

  /**
   * Resolve the dynamic route parameter.
   */
  React.useEffect(() => {
    params.then(({ token }) => {
      setToken(token);
    });
  }, [params]);

  const resetPassword = useAuthStore((state) => state.resetPassword);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setMessage("");

    // -------------------------
    // Validation
    // -------------------------

    if (!email) {
      setError(
        "Your password reset session is invalid. Please request a new reset link.",
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

      const result = await resetPassword({
        token,
        email,
        passwords: password,
      });

      setMessage("Your password has been reset successfully.");

      // Give user a moment to see success message
      setTimeout(() => {
        router.push("/auth/login");
      }, 1500);
    } catch (error: any) {
      setError(
        error?.response?.data?.message ||
          "Unable to reset your password. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-transparent">
      <Header />

      <main className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-10 lg:px-16">
        <div className="grid w-full max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-2">
          {/* =========================================
              RESET PASSWORD FORM
          ========================================== */}

          <section className="mx-auto w-full max-w-md">
            {/* Icon */}

            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
              <LockKeyhole className="h-7 w-7 text-primary" />
            </div>

            {/* Heading */}

            <div className="mb-8">
              <h1 className="mb-3 text-3xl font-semibold text-white">
                Reset your password
              </h1>

              <p className="text-sm leading-6 text-slate-400">
                Create a new password for your JUVO account. Make sure your
                password is at least 6 characters long.
              </p>

              {email && (
                <p className="mt-3 text-xs text-slate-500">
                  Resetting password for{" "}
                  <span className="text-slate-300">{email}</span>
                </p>
              )}
            </div>

            {/* Form */}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* New Password */}

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm text-slate-300"
                >
                  New password
                </label>

                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your new password"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      setError("");
                    }}
                    className="w-full rounded-md border border-slate-700 bg-transparent px-4 py-3 pr-12 text-sm text-white outline-none placeholder:text-slate-500 focus:border-white"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-white"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm text-slate-300"
                >
                  Confirm password
                </label>

                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your new password"
                    value={confirmPassword}
                    onChange={(event) => {
                      setConfirmPassword(event.target.value);
                      setError("");
                    }}
                    className="w-full rounded-md border border-slate-700 bg-transparent px-4 py-3 pr-12 text-sm text-white outline-none placeholder:text-slate-500 focus:border-white"
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-white"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Password requirements */}

              <div className="rounded-md border border-white/5 bg-white/[0.02] px-4 py-3">
                <p className="mb-2 text-xs font-medium text-slate-300">
                  Password requirements
                </p>

                <ul className="space-y-1 text-xs text-slate-500">
                  <li
                    className={password.length >= 6 ? "text-emerald-400" : ""}
                  >
                    • At least 6 characters
                  </li>

                  <li
                    className={
                      password &&
                      confirmPassword &&
                      password === confirmPassword
                        ? "text-emerald-400"
                        : ""
                    }
                  >
                    • Passwords must match
                  </li>
                </ul>
              </div>

              {/* Error */}

              {error && (
                <div className="rounded-md border border-red-500/20 bg-red-500/5 px-4 py-3">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              {/* Success */}

              {message && (
                <div className="rounded-md border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
                  <p className="text-sm text-emerald-400">{message}</p>
                </div>
              )}

              {/* Submit */}

              <Button
                type="submit"
                disabled={
                  isLoading ||
                  !password ||
                  !confirmPassword ||
                  password !== confirmPassword
                }
                className="w-full"
              >
                {isLoading ? "Resetting password..." : "Reset password"}
              </Button>
            </form>

            {/* Back to login */}

            <div className="mt-8 border-t border-white/5 pt-6">
              <Link
                href="/auth/login"
                className="mx-auto flex w-fit items-center gap-2 text-sm text-slate-400 transition hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to login
              </Link>
            </div>
          </section>

          {/* =========================================
              JUVO VISUAL
          ========================================== */}

          <section className="hidden items-center justify-center lg:flex">
            <div className="relative flex w-full max-w-md items-center justify-center">
              {/* Glow */}

              <div className="absolute h-72 w-72 rounded-full bg-primary/10 blur-3xl" />

              <Image
                src={images.appLogo}
                alt="JUVO Logo"
                width={400}
                height={400}
                priority
                className="relative z-10 h-auto w-full object-contain"
              />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
