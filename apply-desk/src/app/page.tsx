import Link from "next/link";
import { scanAction } from "@/app/actions";
import { Shell } from "@/components/shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { statsFrom } from "@/lib/daily";
import { PROFILE } from "@/lib/profile";
import { readStore } from "@/lib/store";

export const dynamic = "force-dynamic";

function fmt(iso: string | null) {
  if (!iso) return "Not yet";
  return new Date(iso).toLocaleString("en-KE", { dateStyle: "medium", timeStyle: "short" });
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ ran?: string }>;
}) {
  const { ran } = await searchParams;
  const store = readStore();
  const stats = statsFrom(store);
  const recent = store.applications.slice(0, 5);
  const unread = store.inbox.filter((m) => m.unread).slice(0, 3);

  return (
    <Shell current="/">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Good — you are signed in as</p>
          <h1 className="font-heading text-4xl sm:text-5xl">{PROFILE.name}</h1>
          <p className="mt-2 max-w-xl text-muted-foreground">{PROFILE.title}</p>
        </div>
        <form action={scanAction}>
          <Button type="submit" size="lg">
            Run today&apos;s scan &amp; apply
          </Button>
        </form>
      </div>

      {ran ? (
        <p className="mt-4 rounded-md border bg-card px-3 py-2 text-sm">
          Scan finished. Email-fit roles were applied (mock send). LinkedIn and
          careers-page jobs are waiting on you.
        </p>
      ) : null}

      <section className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Applied (sent)" value={stats.totalApplied} href="/applications" />
        <Stat label="Applied today" value={stats.appliedToday} href="/applications" />
        <Stat label="Need you" value={stats.needsYou} href="/applications" />
        <Stat label="Replies" value={stats.replies} detail={`${stats.unread} unread`} href="/inbox" />
      </section>

      <section className="mt-6 grid gap-3 sm:grid-cols-4">
        <Channel label="Email" value={stats.byChannel.email} />
        <Channel label="Job boards" value={stats.byChannel.job_board} />
        <Channel label="Company sites" value={stats.byChannel.company_site} />
        <Channel label="LinkedIn (you)" value={stats.byChannel.linkedin} />
      </section>

      <p className="mt-4 text-xs text-muted-foreground">
        Last scan: {fmt(stats.lastScanAt)}. Email:{" "}
        {stats.emailConnected ? "connected (demo inbox)" : "not connected yet"}
        . This desk does not log into LinkedIn or fill Workday/Greenhouse for you.
      </p>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-2xl font-normal">Recent applications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recent.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nothing sent yet. Run today&apos;s scan.
              </p>
            ) : (
              recent.map((a) => (
                <div key={a.id} className="flex items-start justify-between gap-3 border-b border-border pb-3 last:border-0">
                  <div>
                    <p className="font-medium">{a.title}</p>
                    <p className="text-sm text-muted-foreground">{a.company}</p>
                  </div>
                  <Badge variant={a.status === "replied" || a.status === "interview" ? "default" : "secondary"}>
                    {a.channel} · {a.status}
                  </Badge>
                </div>
              ))
            )}
            <Link href="/applications" className="inline-block text-sm underline">
              All applications
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-2xl font-normal">Inbox</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {unread.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No unread replies. Connect email on the Inbox page, then sync.
              </p>
            ) : (
              unread.map((m) => (
                <div key={m.id} className="border-b border-border pb-3 last:border-0">
                  <p className="font-medium">{m.subject}</p>
                  <p className="text-sm text-muted-foreground">
                    {m.from} · {m.kind}
                  </p>
                </div>
              ))
            )}
            <Link href="/inbox" className="inline-block text-sm underline">
              Open inbox
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

function Channel({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border bg-card px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-medium">{value}</p>
    </div>
  );
}
