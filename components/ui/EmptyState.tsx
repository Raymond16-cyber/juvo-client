import { Clock3, type LucideIcon } from "lucide-react";

type EmptyStateProps = {
  title: string;
  body: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
};

export default function EmptyState({
  title,
  body,
  icon: Icon = Clock3,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex min-h-52 flex-col items-center justify-center px-6 py-10 text-center">
      <div className="grid h-11 w-11 place-items-center rounded-control border border-border bg-slate-50 text-slate-500 dark:bg-white/[0.04] dark:text-slate-300">
        <Icon size={18} />
      </div>
      <h3 className="mt-4 text-base font-semibold text-slate-950 dark:text-white">
        {title}
      </h3>
      <p className="mt-1.5 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">
        {body}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
