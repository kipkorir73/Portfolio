import Link from "next/link";
import { scanAction } from "@/app/actions";
import { Shell } from "@/components/shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { statsFrom } from "@/lib/daily";
import { PROFILE } from "@/lib/profile";
import { formatWhen } from "@/lib/dates";
import { readStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const store = readStore();
  const stats = statsFrom(store);
  const recent = store.applications.slice(0, 5);
  const unread = store.inbox.filter((m) => m.unread).slice(0, 3);
  const topJobs = store.jobs.slice(0, 4);

  return (
    <Shell current="/">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Signed in as</p>
          <h1 className="font-heading text-4xl sm:text-5xl">{PROFILE.name}</h1>
          <p className="mt-2 max-w-xl text-muted-foreground">
            Scan matching roles, open the link, apply yourself. The desk only
            logs what you mark. Gmail follow-up comes after you grant access.
          </p>
        </div>
        <form action={scanAction}>
          <Button type="submit" size="lg">
            Scan openings
          </Button>
        </form>
      </div>

      <section className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Openings" value={stats.openRoles} href="/jobs" />
        <Stat label="You applied" value={stats.totalApplied} href="/applications" />
        <Stat label="Applied today" value={stats.appliedToday} href="/applications" />
        <Stat label="Replies" value={stats.replies} detail={`${stats.unread} unread`} href="/inbox" />
      </section>

      <p className="mt-4 text-xs text-muted-foreground">
        Last scan: {formatWhen(stats.lastScanAt)}. Gmail:{" "}
        {stats.emailConnected ? "connected" : "not connected yet — add access when you are ready to follow up"}
        .
      </p>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-2xl font-normal">Waiting for you</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topJobs.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No openings yet. Scan to pull roles that fit the CV.
              </p>
            ) : (
              topJobs.map((job) => (
                <div key={job.id} className="flex items-start justify-between gap-3 border-b border-border pb-3 last:border-0">
                  <div>
                    <p className="font-medium">{job.title}</p>
                    <p className="text-sm text-muted-foreground">{job.company}</p>
                  </div>
                  <a className="text-sm underline shrink-0" href={job.url} target="_blank" rel="noreferrer">
                    Apply
                  </a>
                </div>
              ))
            )}
            <Link href="/jobs" className="inline-block text-sm underline">
              All openings
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-2xl font-normal">Your applications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recent.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Empty until you apply on a posting and tap I applied.
              </p>
            ) : (
              recent.map((a) => (
                <div key={a.id} className="flex items-start justify-between gap-3 border-b border-border pb-3 last:border-0">
                  <div>
                    <p className="font-medium">{a.title}</p>
                    <p className="text-sm text-muted-foreground">{a.company}</p>
                  </div>
                  <Badge variant={a.status === "replied" || a.status === "interview" ? "default" : "secondary"}>
                    {a.status}
                  </Badge>
                </div>
              ))
            )}
            {unread.length > 0 ? (
              <div className="pt-2">
                <p className="text-xs text-muted-foreground uppercase">Unread follow-up</p>
                {unread.map((m) => (
                  <p key={m.id} className="text-sm">
                    {m.subject}
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Replies will land here after Gmail is connected.
              </p>
            )}
            <Link href="/inbox" className="inline-block text-sm underline">
              Inbox
            </Link>
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}

function Stat({
  label,
  value,
  detail,
  href,
}: {
  label: string;
  value: number;
  detail?: string;
  href: string;
}) {
  return (
    <Link href={href} className="rounded-xl border bg-card p-4 hover:border-foreground/30">
      <p className="text-xs tracking-wide text-muted-foreground uppercase">{label}</p>
      <p className="font-heading mt-1 text-4xl">{value}</p>
      {detail ? <p className="text-xs text-muted-foreground">{detail}</p> : null}
    </Link>
  );
}
