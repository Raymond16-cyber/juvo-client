"use client";

import Header from "@/components/Header";
import Button from "@/components/ui/Button";
import images from "@/constants/images.service";
import { getApiErrorMessage } from "@/lib/axios";
import { useAuthStore } from "@/stores/auth.store";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const register = useAuthStore((state) => state.register);
  const storeError = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
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
      router.push("/home/onboarding");
    } catch (registerError: unknown) {
      setError(
        getApiErrorMessage(registerError, "Registration failed. Please try again."),
      );
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
              <h1 className="mb-3 text-3xl font-semibold text-white">
                Register for JUVO
              </h1>
              <p className="text-sm leading-6 text-slate-400">
                Join our community and start your journey towards building
                discipline and achieving your trading goals.
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

            <form className="space-y-5" onSubmit={handleRegister}>
              <div>
                <label htmlFor="fullName" className="mb-2 block text-sm text-slate-300">
                  Full Name
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  required
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  className="w-full rounded-md border border-slate-700 bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-white"
                />
              </div>
              <div>
                <label
                  htmlFor="registerEmail"
                  className="mb-2 block text-sm text-slate-300"
                >
                  Email
                </label>
                <input
                  id="registerEmail"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-md border border-slate-700 bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-white"
                />
              </div>
              <div>
                <label
                  htmlFor="registerPassword"
                  className="mb-2 block text-sm text-slate-300"
                >
                  Password
                </label>
                <input
                  id="registerPassword"
                  name="password"
                  type="password"
                  placeholder="Create a password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-md border border-slate-700 bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-white"
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Creating account..." : "Create Account"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-400">
              Already have an account?{" "}
              <Link href="/auth/login" className="font-medium text-white hover:underline">
                Sign in
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
