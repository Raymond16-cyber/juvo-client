"use client";

import React, { useRef, useState } from "react";
import Header from "@/components/Header";
import Button from "@/components/ui/Button";
import Image from "next/image";
import images from "@/constants/images.service";

import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";

import "swiper/css";

import { useAuthStore } from "@/stores/auth.store";
import { useRouter } from "next/navigation";

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

function Register() {
  const router = useRouter();
  // =========================
  // AUTH STORE
  // =========================
  const register = useAuthStore((state) => state.register);
  const login = useAuthStore((state) => state.login);
  const registerMessage = useAuthStore((state) => state.message);

  // =========================
  // REGISTER STATE
  // =========================

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // =========================
  // LOGIN STATE
  // =========================

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // =========================
  // UI STATE
  // =========================

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // =========================
  // SWIPER
  // =========================

  const swiperRef = useRef<SwiperType | null>(null);

  const goToLogin = () => {
    swiperRef.current?.slideNext();
  };

  const goToRegister = () => {
    swiperRef.current?.slidePrev();
  };

  // =========================
  // REGISTER
  // =========================

  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      await register({
        fullName,
        email,
        password,
      });
      setMessage(registerMessage || "Registration successful!");
      setLoading(false);
      router.push("/home/onboarding");
    } catch (error: unknown) {
      console.error("Registration error:", error);

      setError(
        getAuthErrorMessage(error, "Registration failed. Please try again."),
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // LOGIN
  // =========================

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await login({
        email: loginEmail,
        password: loginPassword,
      });
      router.push(
        response.user?.onboarding?.completed
          ? "/home/dashboard"
          : "/home/onboarding",
      );
    } catch (error: unknown) {
      console.error("Login error:", error);

      setError(getAuthErrorMessage(error, "Login failed. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dark-page-shell min-h-screen overflow-x-hidden">
      <Header />

      <main className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-10 lg:px-16">
        <div className="grid w-full max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-2">
          {/* =====================================================
              AUTH SLIDER
          ====================================================== */}

          <section className="mx-auto w-full max-w-md overflow-hidden">
            <Swiper
              slidesPerView={1}
              spaceBetween={24}
              speed={500}
              allowTouchMove={true}
              onSwiper={(swiper) => {
                swiperRef.current = swiper;
              }}
              className="w-full"
            >
              {/* =================================================
                  REGISTER
              ================================================== */}

              <SwiperSlide>
                <div className="w-full">
                  {/* Header */}

                  <div className="mb-8">
                    <h1 className="mb-3 text-3xl font-semibold text-white">
                      Register for JUVO
                    </h1>

                    <p className="text-sm leading-6 text-slate-400">
                      Join our community and start your journey towards building
                      discipline and achieving your trading goals.
                    </p>
                  </div>

                  {/* Social buttons */}

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button type="button" className="flex-1">
                      Register with Google
                    </Button>

                    <Button type="button" className="flex-1">
                      Register with Apple
                    </Button>
                  </div>

                  {/* Divider */}

                  <div className="my-8 flex items-center gap-4">
                    <div className="h-px flex-1 bg-slate-700" />

                    <span className="text-xs text-slate-500">OR</span>

                    <div className="h-px flex-1 bg-slate-700" />
                  </div>

                  {/* Error */}

                  {error ? (
                    <div className="mb-5 rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                      {error}
                    </div>
                  ) : message ? (
                    <div className="mb-5 rounded-md border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400">
                      {message}
                    </div>
                  ) : null}

                  {/* Registration form */}

                  <form className="space-y-5" onSubmit={handleRegister}>
                    {/* Full Name */}

                    <div>
                      <label
                        htmlFor="fullName"
                        className="mb-2 block text-sm text-slate-300"
                      >
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

                    {/* Email */}

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

                    {/* Password */}

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

                    {/* Submit */}

                    <Button type="submit" disabled={loading} className="w-full">
                      {loading ? "Creating account..." : "Create Account"}
                    </Button>
                  </form>

                  {/* Login navigation */}

                  <p className="mt-6 text-center text-sm text-slate-400">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={goToLogin}
                      className="font-medium text-white hover:underline"
                    >
                      Sign in
                    </button>
                  </p>
                </div>
              </SwiperSlide>

              {/* =================================================
                  LOGIN
              ================================================== */}

              <SwiperSlide>
                <div className="w-full">
                  {/* Header */}

                  <div className="mb-8">
                    <h1 className="mb-3 text-3xl font-semibold text-white">
                      Welcome back
                    </h1>

                    <p className="text-sm leading-6 text-slate-400">
                      Sign in to continue tracking your trading discipline and
                      performance.
                    </p>
                  </div>

                  {/* Social buttons */}

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button type="button" className="flex-1">
                      Sign in with Google
                    </Button>

                    <Button type="button" className="flex-1">
                      Sign in with Apple
                    </Button>
                  </div>

                  {/* Divider */}

                  <div className="my-8 flex items-center gap-4">
                    <div className="h-px flex-1 bg-slate-700" />

                    <span className="text-xs text-slate-500">OR</span>

                    <div className="h-px flex-1 bg-slate-700" />
                  </div>

                  {/* Login form */}

                  <form className="space-y-5" onSubmit={handleLogin}>
                    {/* Email */}

                    <div>
                      <label
                        htmlFor="loginEmail"
                        className="mb-2 block text-sm text-slate-300"
                      >
                        Email
                      </label>

                      <input
                        id="loginEmail"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        required
                        value={loginEmail}
                        onChange={(event) => setLoginEmail(event.target.value)}
                        className="w-full rounded-md border border-slate-700 bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-white"
                      />
                    </div>

                    {/* Password */}

                    <div>
                      <label
                        htmlFor="loginPassword"
                        className="mb-2 block text-sm text-slate-300"
                      >
                        Password
                      </label>

                      <input
                        id="loginPassword"
                        name="password"
                        type="password"
                        placeholder="Enter your password"
                        required
                        value={loginPassword}
                        onChange={(event) =>
                          setLoginPassword(event.target.value)
                        }
                        className="w-full rounded-md border border-slate-700 bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-white"
                      />
                    </div>

                    {/* Submit */}
                    <a
                      href="/auth/forgot-password"
                      className="text-xs text-slate-400 transition-colors hover:text-white"
                    >
                      Forgot password?
                    </a>

                    <Button type="submit" disabled={loading} className="w-full">
                      {loading ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>

                  {/* Register navigation */}

                  <p className="mt-6 text-center text-sm text-slate-400">
                    Don&apos;t have an account?{" "}
                    <button
                      type="button"
                      onClick={goToRegister}
                      className="font-medium text-white hover:underline"
                    >
                      Register
                    </button>
                  </p>
                </div>
              </SwiperSlide>
            </Swiper>
          </section>

          {/* =====================================================
              JUVO LOGO
          ====================================================== */}

          <section className="flex justify-center lg:justify-end">
            <div className="relative flex w-full max-w-md items-center justify-center">
              {/* Glow */}

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

export default Register;
