"use client";

import AuthLoadingScreen from "@/components/auth/AuthLoadingScreen";
import AuthVisual from "@/components/auth/AuthVisual";
import Header from "@/components/Header";
import Button from "@/components/ui/Button";
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
    <div className="dark-page-shell min-h-screen overflow-x-hidden">
      <Header />
      <main className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-10 lg:px-16">
        <div className="grid w-full max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <section className="mx-auto w-full max-w-md">
            <div className="mb-8">
              <h1 className="mb-3 text-3xl font-semibold text-white">
                Welcome back
              </h1>
              <p className="text-sm leading-6 text-slate-400">
                Sign in to continue tracking your trading discipline and
                performance.
              </p>
            </div>

            {visibleError ? (
              <div
                role="alert"
                className="mb-5 rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200"
              >
                {visibleError}
              </div>
            ) : null}

            <form className="space-y-5" onSubmit={handleLogin}>
              <div>
                <label htmlFor="email" className="mb-2 block text-sm text-slate-300">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    if (error) setError("");
                  }}
                  placeholder="Enter your email"
                  className="w-full rounded-md border border-slate-700 bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-white"
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm text-slate-300"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      if (error) setError("");
                    }}
                    placeholder="Enter your password"
                    className="w-full rounded-md border border-slate-700 bg-transparent px-4 py-3 pr-12 text-sm text-white outline-none placeholder:text-slate-500 focus:border-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <Link
                href="/auth/forgot-password"
                className="inline-block text-xs text-slate-400 transition-colors hover:text-white"
              >
                Forgot password?
              </Link>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-400">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/register"
                className="font-medium text-white hover:underline"
              >
                Register
              </Link>
            </p>
          </section>

          <AuthVisual />
        </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
