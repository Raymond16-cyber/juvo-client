"use client";

import React, { useEffect } from "react";
import Header from "@/components/Header";
import Button from "@/components/ui/Button";
import { useAuthStore } from "@/stores/auth.store";
import { useRouter } from "next/navigation";

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const requestResetPassword = useAuthStore(
    (state) => state.requestResetPassword,
  );
  const resetPasswordToken = useAuthStore((state) => state.resetPasswordToken);
  const clearError = useAuthStore((state) => state.clearError);
  const error = useAuthStore((state) => state.error);
  const isLoading = useAuthStore((state) => state.isLoading);
  const message = useAuthStore((state) => state.message);
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearError();
    try {
      const data = await requestResetPassword({ email });
    } catch (error) {
      console.error("Error requesting password reset:", error);
    }
  };

  // =========================
  //  USE-EFFECT STATES
  // =========================
  useEffect(() => {
    if (message) {
      console.log(resetPasswordToken);
      router.push(`/auth/verify-otp-code/${resetPasswordToken}?email=${encodeURIComponent(email)}`);
    }
  });

  return (
    <div className="min-h-screen overflow-x-hidden bg-transparent">
      <Header />

      <main className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4">
        <section className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="mb-3 text-3xl font-semibold text-white">
              Forgot your password?
            </h1>

            <p className="text-sm leading-6 text-slate-400">
              Enter your email address and we'll send you a link to reset your
              password.
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-md bg-red-500/20 p-3 text-sm text-red-500">
              {error}
            </div>
          )}
          {message && (
            <div className="mb-4 rounded-md bg-green-500/20 p-3 text-sm text-green-500">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm text-slate-300"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full rounded-md border border-slate-700 bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-white"
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <a
              href="/auth/register"
              className="text-sm text-slate-400 transition-colors hover:text-white"
            >
              ← Back to sign in
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
