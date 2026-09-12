import { setStatusAction } from "@/app/actions";
import { Shell } from "@/components/shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDay } from "@/lib/dates";
import { readStore } from "@/lib/store";

export const dynamic = "force-dynamic";

const STATUSES = ["queued", "needs_you", "sent", "replied", "interview", "rejected"] as const;

export default function ApplicationsPage() {
  const apps = readStore().applications;
  return (
    <Shell current="/applications">
      <h1 className="font-heading text-4xl">Applied</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Roles you applied to yourself. Use Mark sent if you already submitted,
        or Interview / the posting link for follow-up. Gmail will attach replies
        here once you grant access.
      </p>
      {apps.length === 0 ? (
        <p className="mt-10 text-muted-foreground">No applications yet.</p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-xl border bg-card">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Channel</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">When</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {apps.map((a) => (
                <tr key={a.id} className="border-b last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium">{a.title}</p>
                    <p className="text-muted-foreground">{a.company}</p>
                    {a.toEmail ? (
                      <p className="text-xs text-muted-foreground">{a.toEmail}</p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary">{a.channel}</Badge>
                  </td>
                  <td className="px-4 py-3">{a.status}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDay(a.appliedAt)}
                  </td>
                  <td className="px-4 py-3">
                    <form action={setStatusAction} className="flex flex-wrap gap-2">
                      <input type="hidden" name="id" value={a.id} />
                      {a.status !== "sent" ? (
                        <Button name="status" value="sent" size="sm" variant="outline">
                          Mark sent
                        </Button>
                      ) : null}
                      {a.status !== "interview" ? (
                        <Button name="status" value="interview" size="sm" variant="outline">
                          Interview
                        </Button>
                      ) : null}
                      <a className="text-xs underline self-center" href={a.url} target="_blank" rel="noreferrer">
                        Link
                      </a>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-4 hidden text-xs text-muted-foreground">
        Statuses: {STATUSES.join(", ")}
      </p>
    </Shell>
  );
}
