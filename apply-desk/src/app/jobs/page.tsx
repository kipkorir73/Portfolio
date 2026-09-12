import { Shell } from "@/components/shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { scanAction } from "@/app/actions";
import { readStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export default function JobsPage() {
  const jobs = readStore().jobs;
  return (
    <Shell current="/jobs">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-4xl">Openings</h1>
          <p className="mt-2 max-w-xl text-muted-foreground">
            Ranked against your CV: IT support, networking, Windows/Linux, Nairobi
            / remote. Public boards plus a Kenya ICT list. Not a LinkedIn scrape.
          </p>
        </div>
        <form action={scanAction}>
          <Button type="submit">Scan again</Button>
        </form>
      </div>
      {jobs.length === 0 ? (
        <p className="mt-10 text-muted-foreground">
          No openings stored yet. Run a scan from Today.
        </p>
      ) : (
        <ul className="mt-8 space-y-4">
          {jobs.map((job) => (
            <li key={job.id} className="rounded-xl border bg-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-medium">{job.title}</h2>
                  <p className="text-sm text-muted-foreground">
                    {job.company} · {job.location} · {job.source}
                  </p>
                </div>
                <Badge>match {job.score}</Badge>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{job.description}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="secondary">{job.channel}</Badge>
                {job.reasons.map((r) => (
                  <Badge key={r} variant="outline">
                    {r}
                  </Badge>
                ))}
              </div>
              <a
                className="mt-4 inline-block text-sm underline"
                href={job.url}
                target="_blank"
                rel="noreferrer"
              >
                Open posting
              </a>
            </li>
          ))}
        </ul>
      )}
    </Shell>
  );
}
