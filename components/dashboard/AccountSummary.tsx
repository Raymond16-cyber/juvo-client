import { WalletCards } from "lucide-react";

export default function AccountSummary() {
  return (
    <section
      data-dashboard-card
      className="dashboard-card rounded-2xl border border-slate-200 bg-slate-950 p-7 text-white shadow-sm dark:border-white/10 dark:bg-[#08111f]"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-300">Primary Account</p>
          <h2 className="mt-2 text-3xl font-bold">$124,850.42</h2>
        </div>
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/15 text-primary">
          <WalletCards size={22} />
        </div>
      </div>

      <div className="mt-7 grid gap-3 sm:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
        {[
          ["Balance", "$118.4k"],
          ["Equity", "$124.8k"],
          ["Risk Used", "2.1%"],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl bg-white/[0.06] p-4">
            <p className="text-xs text-slate-400">{label}</p>
            <p className="mt-1 text-sm font-bold">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-300">Monthly target</span>
          <span className="font-bold text-primary">74%</span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-white/10">
          <div className="h-full w-[74%] rounded-full bg-primary" />
        </div>
      </div>
    </section>
  );
}
