export default function AuthLoadingScreen({
  label = "Checking your session",
}: {
  label?: string;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-950 dark:bg-background dark:text-white">
      <div className="flex flex-col items-center gap-4">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-950 text-2xl font-bold text-primary dark:bg-white dark:text-slate-950">
          J
        </span>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
          {label}
        </p>
      </div>
    </div>
  );
}
