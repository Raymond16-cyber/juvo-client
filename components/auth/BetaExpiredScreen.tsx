"use client";

import Button from "@/components/ui/Button";
import Link from "next/link";

type BetaExpiredScreenProps = {
  code?: string | null;
};

export default function BetaExpiredScreen({ code }: BetaExpiredScreenProps) {
  const revoked = code === "BETA_ACCESS_REVOKED";

  return (
    <div className="dark-page-shell flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg rounded-[1.75rem] border border-white/10 bg-[#09111f]/90 p-6 text-center shadow-[0_24px_80px_rgba(2,6,23,0.45)] backdrop-blur-xl sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300/80">
          Private beta
        </p>
        <h1 className="mt-3 text-2xl font-bold text-white sm:text-3xl">
          {revoked
            ? "Beta access revoked"
            : "Your JUVO Testing Period Has Ended"}
        </h1>
        <p className="mt-4 text-sm leading-7 text-slate-300">
          {revoked
            ? "Your tester access has been disabled by the JUVO team."
            : "Thank you for helping us test JUVO! Your 24-hour beta testing session has expired. We appreciate your feedback and contribution to making JUVO better."}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/waitlist">
            <Button className="w-full sm:w-auto">Join the waitlist</Button>
          </Link>
          <Link href="/auth/login">
            <Button variant="onDark" className="w-full sm:w-auto">
              Back to sign in
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
