import { readMessageAction } from "@/app/actions";
import { Shell } from "@/components/shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PROFILE } from "@/lib/profile";
import { readStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function InboxPage() {
  const store = readStore();
  const { settings, inbox } = store;

  return (
    <Shell current="/inbox">
      <h1 className="font-heading text-4xl">Inbox</h1>
      <p className="mt-2 max-w-xl text-muted-foreground">
        Follow-up lives here. When you are ready, give the desk access to{" "}
        {PROFILE.email} so replies, interviews, and rejections file against jobs
        you marked as applied. Nothing is connected yet.
      </p>

      {!settings.emailConnected ? (
        <p className="mt-10 rounded-xl border bg-card p-6 text-muted-foreground">
          Gmail is waiting on you. Apply from Openings first. Then we can wire
          this mailbox to watch for recruiter replies — no demo connect, no
          fake sync.
        </p>
      ) : inbox.length === 0 ? (
        <p className="mt-10 text-muted-foreground">
          Connected, but no messages yet.
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
