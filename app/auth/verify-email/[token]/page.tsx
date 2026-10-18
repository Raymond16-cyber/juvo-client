"use client";

import AuthShell from "@/components/auth/AuthShell";
import { getApiErrorMessage } from "@/lib/axios";
import { verifyEmail } from "@/services/auth.service";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function VerifyEmailPage() {
  const params = useParams<{ token: string }>();

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function verify() {
      try {
        const response = await verifyEmail(params.token);

        console.log("Email verification response:", response);
        setMessage(response.message);
        setStatus("success");
      } catch (error) {
        console.error("Email verification failed:", error);

        setMessage(
          getApiErrorMessage(
            error,
            "This verification link is invalid or expired.",
          ),
        );
        setStatus("error");
      }
    }

    void verify();
  }, [params.token]);

  console.log(message);

  return (
    <AuthShell variant="register">
      <div className="space-y-5 text-center">
        <div>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            JUVO account
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-950 dark:text-white">
            {status === "loading"
              ? "Verifying email..."
              : status === "success"
                ? "Email verified"
                : "Verification failed"}
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
            {status === "loading"
              ? "Please wait while we confirm your email address."
              : message}
          </p>
        </div>

        {status !== "loading" && (
          <Link
            href={status === "success" ? "/home/onboarding" : "/register"}
            className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-bold text-slate-950 transition hover:bg-secondary"
          >
            {status === "success" ? "Continue to JUVO" : "Back to registration"}
          </Link>
        )}
      </div>
    </AuthShell>
  );
}
