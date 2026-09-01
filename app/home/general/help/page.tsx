import DashboardShell from "@/components/dashboard/DashboardShell";
import Card from "@/components/ui/Card";
import PageHeader from "@/components/ui/PageHeader";
import Link from "next/link";

const faqs = [
  {
    q: "What is Juvo for?",
    a: "Juvo is an AI-assisted trading journal. It helps you build discipline, review behavior, and see which sessions actually have an edge.",
  },
  {
    q: "Does Juvo tell me what to trade?",
    a: "No. Juvo will not give buy or sell signals. It coaches process: risk, psychology, plan adherence, and review quality.",
  },
  {
    q: "How should I start a day?",
    a: "Create or pick a trading account, write a pre-market note, set confidence, then log trades as they happen. Close the day with an honest review.",
  },
  {
    q: "Why is the dashboard empty?",
    a: "Metrics come from journals you log. Placeholder P/L would lie to you. Start a session and the numbers fill in.",
  },
  {
    q: "How does Juvo AI work?",
    a: "Chat and end-of-day reviews use your recent journals as context. Configure AI_API_KEY on the server so Juvo can reply with Gemini.",
  },
];

export default function HelpPage() {
  return (
    <DashboardShell>
      <div className="mx-auto max-w-3xl space-y-6">
        <PageHeader
          eyebrow="General"
          title="Help Center"
          description="Short answers for a journal that is supposed to keep you honest."
        />
        {faqs.map((item) => (
          <Card key={item.q} className="p-6">
            <h2 className="text-lg font-bold text-slate-950 dark:text-white">{item.q}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{item.a}</p>
          </Card>
        ))}
        <Card className="p-6">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Still stuck? Ask Juvo from the workspace, or start with today&apos;s journal.
          </p>
          <div className="mt-4 flex gap-3">
            <Link href="/home/ai/chat" className="text-sm font-bold text-primary">
              Open Juvo AI
            </Link>
            <Link href="/home/journal" className="text-sm font-bold text-primary">
              Open journal
            </Link>
          </div>
        </Card>
      </div>
    </DashboardShell>
  );
}
