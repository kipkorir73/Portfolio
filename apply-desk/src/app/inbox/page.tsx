import { connectEmailAction, readMessageAction, syncInboxAction } from "@/app/actions";
import { Shell } from "@/components/shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PROFILE } from "@/lib/profile";
import { readStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function InboxPage({
  searchParams,
}: {
  searchParams: Promise<{ connected?: string; synced?: string }>;
}) {
  const q = await searchParams;
  const store = readStore();
  const { settings, inbox } = store;

  return (
    <Shell current="/inbox">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-4xl">Inbox</h1>
          <p className="mt-2 max-w-xl text-muted-foreground">
            Connect {PROFILE.email} to file recruiter replies against applications.
            This preview uses a simulated mailbox. Real Gmail needs a Google Cloud
            OAuth client or an app password in SMTP settings — not a scrape of
            LinkedIn messages.
          </p>
        </div>
        <div className="flex gap-2">
          {settings.emailConnected ? (
            <form action={syncInboxAction}>
              <Button type="submit">Sync replies</Button>
            </form>
          ) : (
            <form action={connectEmailAction}>
              <Button type="submit">Connect {PROFILE.email}</Button>
            </form>
          )}
        </div>
      </div>
      {q.connected ? (
        <p className="mt-4 text-sm">Connected in demo mode. Sync to pull replies.</p>
      ) : null}
      {q.synced ? (
        <p className="mt-4 text-sm">Inbox synced. New replies are filed on applications.</p>
      ) : null}

      {!settings.emailConnected ? (
        <p className="mt-10 rounded-xl border bg-card p-6 text-muted-foreground">
          Email is disconnected. Connect to see replies, interviews, and
          rejections next to the jobs you applied to.
        </p>
      ) : inbox.length === 0 ? (
        <p className="mt-10 text-muted-foreground">
          Connected, but no messages yet. Apply by email, then sync.
        </p>
      ) : (
        <ul className="mt-8 space-y-4">
          {inbox.map((m) => (
            <li key={m.id} className="rounded-xl border bg-card p-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={m.unread ? "default" : "secondary"}>{m.kind}</Badge>
                {m.unread ? <Badge variant="outline">unread</Badge> : null}
              </div>
              <h2 className="mt-2 font-medium">{m.subject}</h2>
              <p className="text-sm text-muted-foreground">
                {m.from} &lt;{m.fromEmail}&gt; ·{" "}
                {new Date(m.receivedAt).toLocaleString("en-KE")}
              </p>
              <p className="mt-3 whitespace-pre-wrap text-sm">{m.body}</p>
              {m.unread ? (
                <form action={readMessageAction} className="mt-3">
                  <input type="hidden" name="id" value={m.id} />
                  <Button size="sm" variant="outline" type="submit">
                    Mark read
                  </Button>
                </form>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </Shell>
  );
}
