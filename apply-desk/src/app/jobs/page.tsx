import { markAppliedAction, scanAction } from "@/app/actions";
import { Shell } from "@/components/shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { readStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ ran?: string; jobs?: string; logged?: string }>;
}) {
  const q = await searchParams;
  const store = readStore();
  const jobs = store.jobs;
  const applied = new Set(
    store.applications.filter((a) => a.status !== "queued").map((a) => a.jobId),
  );

  return (
    <Shell current="/jobs">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-4xl">Openings</h1>
          <p className="mt-2 max-w-xl text-muted-foreground">
            Ranked against your CV. Open the link and apply yourself. Come back
            and tap I applied so follow-up can match Gmail later.
          </p>
        </div>
        <form action={scanAction}>
          <Button type="submit">Scan again</Button>
        </form>
      </div>
      {q.ran ? (
        <p className="mt-4 rounded-md border bg-card px-3 py-2 text-sm">
          Scan finished. {q.jobs ?? "0"} matching openings. Nothing was sent —
          use Apply on each posting.
        </p>
      ) : null}
      {q.logged ? (
        <p className="mt-4 rounded-md border bg-card px-3 py-2 text-sm">
          Logged. When Gmail is connected, replies to that role can file here.
        </p>
      ) : null}
      {jobs.length === 0 ? (
        <p className="mt-10 text-muted-foreground">
          No openings stored yet. Scan from Today.
        </p>
      ) : (
        <ul className="mt-8 space-y-4">
          {jobs.map((job) => {
            const done = applied.has(job.id);
            return (
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
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <a
                    className="inline-flex h-8 items-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground"
                    href={job.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Apply on posting
                  </a>
                  {done ? (
                    <span className="text-sm text-muted-foreground">Logged as applied</span>
                  ) : (
                    <form action={markAppliedAction}>
                      <input type="hidden" name="jobId" value={job.id} />
                      <Button type="submit" variant="outline">
                        I applied
                      </Button>
                    </form>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Shell>
  );
}
