"use client";

import BetaExpiredScreen from "@/components/auth/BetaExpiredScreen";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function BetaEndedInner() {
  const params = useSearchParams();
  return <BetaExpiredScreen code={params.get("code")} />;
}

export default function BetaEndedPage() {
  return (
    <Suspense fallback={<BetaExpiredScreen />}>
      <BetaEndedInner />
    </Suspense>
  );
}
