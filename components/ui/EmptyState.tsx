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
    <div className="flex min-h-56 flex-col items-center justify-center p-8 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-300">
        <Icon size={20} />
      </div>
      <h3 className="mt-4 text-base font-bold text-slate-950 dark:text-white">
        {title}
      </h3>
      <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
        {body}
      </p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
