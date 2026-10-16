import Card from "@/components/ui/Card";

type JuvoTutorialCardProps = {
  title: string;
  url: string;
};

function getYouTubeEmbedUrl(source: string) {
  try {
    const url = new URL(source);
    const videoId =
      url.hostname === "youtu.be"
        ? url.pathname.slice(1)
        : url.hostname.endsWith("youtube.com")
          ? url.pathname === "/embed"
            ? url.pathname.split("/")[2]
            : url.searchParams.get("v")
          : null;

    return videoId && /^[A-Za-z0-9_-]{11}$/.test(videoId)
      ? `https://www.youtube-nocookie.com/embed/${videoId}`
      : null;
  } catch {
    return null;
  }
}

export default function JuvoTutorialCard({
  title,
  url,
}: JuvoTutorialCardProps) {
  const embedUrl = getYouTubeEmbedUrl(url);

  return (
    <Card className="overflow-hidden p-0">
      <div className="p-6 pb-0">
        <h2 className="text-lg font-bold text-slate-950 dark:text-white">
          {title}
        </h2>
      </div>
      {embedUrl ? (
        <div className="mt-5 aspect-video overflow-hidden border-y border-slate-200 bg-slate-100 dark:border-white/10 dark:bg-white/[0.04]">
          <iframe
            className="h-full w-full"
            src={embedUrl}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      ) : (
        <p className="p-6 text-sm text-slate-500 dark:text-slate-400">
          This tutorial is temporarily unavailable.
        </p>
      )}
    </Card>
  );
}
