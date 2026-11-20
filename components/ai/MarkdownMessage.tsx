"use client";

import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type MarkdownMessageProps = {
  content: string;
  className?: string;
};

const components: Components = {
  h1: ({ children }) => (
    <h1 className="mb-2 mt-3 text-base font-bold tracking-tight first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="mb-2 mt-3 text-[15px] font-bold tracking-tight first:mt-0">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-1.5 mt-3 text-sm font-semibold tracking-tight first:mt-0">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="mb-1.5 mt-2.5 text-sm font-semibold first:mt-0">
      {children}
    </h4>
  ),
  p: ({ children }) => <p className="mb-2.5 last:mb-0">{children}</p>,
  strong: ({ children }) => (
    <strong className="font-semibold text-slate-900 dark:text-white">
      {children}
    </strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  ul: ({ children }) => (
    <ul className="mb-2.5 list-disc space-y-1 pl-5 last:mb-0">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-2.5 list-decimal space-y-1 pl-5 last:mb-0">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="leading-6">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="mb-2.5 border-l-2 border-primary/50 bg-primary/5 py-1.5 pl-3 pr-2 text-slate-600 last:mb-0 dark:border-primary/40 dark:bg-primary/10 dark:text-slate-300">
      {children}
    </blockquote>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className="font-medium text-primary underline-offset-2 hover:underline"
    >
      {children}
    </a>
  ),
  code: ({ className, children }) => {
    const isBlock = Boolean(className?.includes("language-"));
    if (isBlock) {
      return (
        <code className="block overflow-x-auto whitespace-pre rounded-lg bg-slate-900/90 px-3 py-2 text-[12px] leading-5 text-slate-100 dark:bg-black/50">
          {children}
        </code>
      );
    }
    return (
      <code className="rounded bg-slate-200/80 px-1 py-0.5 text-[12px] font-medium text-slate-800 dark:bg-white/10 dark:text-slate-100">
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="mb-2.5 overflow-x-auto last:mb-0">{children}</pre>
  ),
  table: ({ children }) => (
    <div className="mb-2.5 max-w-full overflow-x-auto last:mb-0">
      <table className="min-w-full border-collapse text-left text-[13px]">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="border-b border-slate-200 dark:border-white/10">
      {children}
    </thead>
  ),
  th: ({ children }) => (
    <th className="whitespace-nowrap px-2 py-1.5 font-semibold text-slate-800 dark:text-slate-100">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border-t border-slate-100 px-2 py-1.5 align-top text-slate-600 dark:border-white/5 dark:text-slate-300">
      {children}
    </td>
  ),
  hr: () => (
    <hr className="my-3 border-slate-200 dark:border-white/10" />
  ),
};

export default function MarkdownMessage({
  content,
  className = "",
}: MarkdownMessageProps) {
  return (
    <div
      className={`juvo-markdown min-w-0 max-w-full break-words text-sm leading-6 ${className}`}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}

