const goals = [
  { label: "Respect daily risk limit", progress: 92 },
  { label: "Journal every trade", progress: 78 },
  { label: "Follow A+ setups only", progress: 64 },
];

export default function TradingGoals() {
  return (
    <section className="dashboard-card rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-card">
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
        Growth
      </p>
      <h2 className="mt-1 text-xl font-bold text-slate-950 dark:text-white">
        Trading Goals
      </h2>

      <div className="mt-6 space-y-6">
        {goals.map((goal) => (
          <div key={goal.label}>
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {goal.label}
              </span>
              <span className="font-bold text-slate-950 dark:text-white">
                {goal.progress}%
              </span>
            </div>
            <div className="mt-3 h-2.5 rounded-full bg-slate-100 dark:bg-white/10">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${goal.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
