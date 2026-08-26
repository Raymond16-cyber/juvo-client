import Button from "@/components/ui/Button";
import { Bell, CalendarDays, Plus, Search } from "lucide-react";

export default function DashboardHeader() {
  return (
    <header className="mb-6 hidden items-center justify-between gap-4 lg:flex">
      <div>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
          Welcome back, Ballistic Trader
        </p>
        <h1 className="mt-1 text-3xl font-bold text-slate-950 dark:text-white">
          Trading Dashboard
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <label className="flex h-11 w-72 items-center gap-3 rounded-full border border-slate-200 bg-white px-4 text-sm text-slate-500 shadow-sm dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400">
          <Search size={17} />
          <input
            className="w-full bg-transparent text-slate-700 outline-none placeholder:text-slate-400 dark:text-white"
            placeholder="Search trades, notes..."
          />
        </label>
        <button className="grid h-11 w-11 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:bg-white/10">
          <CalendarDays size={18} />
        </button>
        <button className="grid h-11 w-11 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:bg-white/10">
          <Bell size={18} />
        </button>
        <Button className="h-11 px-5">
          <Plus size={18} />
          Log Trade
        </Button>
      </div>
    </header>
  );
}
