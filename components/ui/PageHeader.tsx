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
    <div className="flex flex-col gap-4 border-b border-border pb-5 sm:pb-6 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
          {eyebrow}
        </p>
        <h1 className="mt-1.5 break-words text-2xl font-semibold tracking-tight text-slate-950 sm:text-[1.75rem] dark:text-white">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex w-full min-w-0 flex-wrap items-center gap-2 sm:gap-3 lg:w-auto lg:justify-end">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
