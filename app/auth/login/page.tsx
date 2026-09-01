"use client";

import Header from "@/components/Header";
import Button from "@/components/ui/Button";
import images from "@/constants/images.service";
import { useAuthStore } from "@/stores/auth.store";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

function getAuthErrorMessage(error: unknown, fallback: string) {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof error.response === "object" &&
    error.response !== null &&
    "data" in error.response &&
    typeof error.response.data === "object" &&
    error.response.data !== null &&
    "message" in error.response.data &&
    typeof error.response.data.message === "string"
  ) {
    return error.response.data.message;
  }

  return fallback;
}

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await login({ email, password });
      router.push(
        response.user?.onboarding?.completed ? "/home/dashboard" : "/home/onboarding",
      );
    } catch (loginError: unknown) {
      setError(getAuthErrorMessage(loginError, "Login failed. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dark-page-shell min-h-screen overflow-x-hidden">
      <Header />
      <main className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-10 lg:px-16">
        <div className="grid w-full max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <section className="mx-auto w-full max-w-md">
            <div className="mb-8">
              <h1 className="mb-3 text-3xl font-semibold text-white">Welcome back</h1>
              <p className="text-sm leading-6 text-slate-400">
                Sign in to continue tracking your trading discipline and performance.
              </p>
            </div>

            {error ? (
              <div className="mb-5 rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                {error}
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
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Enter your email"
                  className="w-full rounded-md border border-slate-700 bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-white"
                />
              </div>
              <div>
                <label htmlFor="password" className="mb-2 block text-sm text-slate-300">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-md border border-slate-700 bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-white"
                />
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
              <Link href="/auth/register" className="font-medium text-white hover:underline">
                Register
              </Link>
            </p>
          </section>

          <section className="flex justify-center lg:justify-end">
            <div className="relative flex w-full max-w-md items-center justify-center">
              <div className="absolute h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
              <Image
                src={images.appLogo}
                alt="JUVO Logo"
                width={500}
                height={500}
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
