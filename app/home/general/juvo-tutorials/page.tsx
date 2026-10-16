import DashboardShell from "@/components/dashboard/DashboardShell";
import JuvoTutorialCard from "@/components/home/JuvoTutorialCard";
import PageHeader from "@/components/ui/PageHeader";

const tutorials = [
  {
    title: "How to Connect Your cTrader Account to JUVO",
    url: "https://youtu.be/2Wh36UKXT_s",
  },
];

export default function JuvoTutorialsPage() {
  return (
    <DashboardShell>
      <div className="mx-auto max-w-5xl space-y-6">
        <PageHeader
          eyebrow="Help Center"
          title="JUVO Tutorials"
          description="Watch guided walkthroughs for connecting your accounts and getting more from your JUVO workspace."
        />
        <div className="grid gap-6 lg:grid-cols-2">
          {tutorials.map((tutorial) => (
            <JuvoTutorialCard key={tutorial.url} {...tutorial} />
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
