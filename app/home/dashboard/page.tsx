import DashboardOverview from "@/components/dashboard/DashboardOverview";
import DashboardShell from "@/components/dashboard/DashboardShell";
import React, { Suspense } from "react";

const Page = () => {
  return (
    <DashboardShell>
      <Suspense fallback={null}>
        <DashboardOverview />
      </Suspense>
    </DashboardShell>
  );
};

export default Page;
