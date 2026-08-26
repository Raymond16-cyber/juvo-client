import DashboardOverview from "@/components/dashboard/DashboardOverview";
import DashboardShell from "@/components/dashboard/DashboardShell";
import React from "react";

const Page = () => {
  return (
    <DashboardShell>
      <DashboardOverview />
    </DashboardShell>
  );
};

export default Page;
