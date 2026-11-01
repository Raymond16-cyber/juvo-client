type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
};

export default function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: PageHeaderProps) {
  return (
    <div className="relative flex flex-col gap-4 overflow-hidden rounded-3xl border border-slate-200/80 bg-white/70 p-5 shadow-sm backdrop-blur-xl sm:p-6 lg:flex-row lg:items-end lg:justify-between dark:border-white/10 dark:bg-white/[0.035]">
      <div className="pointer-events-none absolute -right-10 -top-16 h-40 w-40 rounded-full bg-violet-400/15 blur-3xl dark:bg-cyan-400/10" />
      <div className="min-w-0">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-violet-600 sm:text-sm sm:normal-case sm:tracking-normal dark:text-cyan-300">
          <span className="h-2 w-2 rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 shadow-[0_0_12px_rgba(139,92,246,0.6)]" />
          <span>{eyebrow}</span>
        </p>
        <h1 className="relative mt-2 break-words text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl dark:text-white">
          {title}
        </h1>
        {description ? (
          <p className="relative mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="relative flex w-full min-w-0 flex-wrap items-center gap-2 sm:gap-3 lg:w-auto lg:justify-end">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
