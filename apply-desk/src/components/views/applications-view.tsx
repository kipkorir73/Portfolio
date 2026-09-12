"use client";

import { useState } from "react";
import { useDesk } from "@/components/desk-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDay } from "@/lib/dates";
import type { ApplicationStatus } from "@/lib/types";

export function ApplicationsView() {
  const { store, setStatus } = useDesk();
  const [busy, setBusy] = useState<string | null>(null);
  if (!store) return null;
  const apps = store.applications;

  async function update(id: string, status: ApplicationStatus) {
    setBusy(`${id}:${status}`);
    try {
      await setStatus(id, status);
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
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
                  <td className="px-4 py-3 text-muted-foreground">{formatDay(a.appliedAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {a.status !== "sent" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          type="button"
                          disabled={busy === `${a.id}:sent`}
                          onClick={() => void update(a.id, "sent")}
                        >
                          Mark sent
                        </Button>
                      ) : null}
                      {a.status !== "interview" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          type="button"
                          disabled={busy === `${a.id}:interview`}
                          onClick={() => void update(a.id, "interview")}
                        >
                          Interview
                        </Button>
                      ) : null}
                      <a className="text-xs underline self-center" href={a.url} target="_blank" rel="noreferrer">
                        Link
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
