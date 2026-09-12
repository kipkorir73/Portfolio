"use client";

import { useState } from "react";
import { CountrySelect } from "@/components/country-select";
import { useDesk } from "@/components/desk-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { countryLabel } from "@/lib/countries";
import { postedLabel } from "@/lib/dates";

export function JobsView() {
  const { store, scanning, scan, applied, saveSettings } = useDesk();
  const [logging, setLogging] = useState<string | null>(null);
  if (!store) return null;
  const jobs = store.jobs;
  const country = store.settings.country || "worldwide";
  const already = new Set(
    store.applications.filter((a) => a.status !== "queued").map((a) => a.jobId),
  );

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-4xl">Openings</h1>
          <p className="mt-2 max-w-xl text-muted-foreground">
            Ranked against your CV from the last 7 days in{" "}
            <span className="text-foreground">{countryLabel(country)}</span>: IT /
            ICT / helpdesk plus generalist office roles. Remote jobs stay in the
            list. Change country below, then scan.
          </p>
        </div>
        <Button type="button" disabled={scanning} onClick={() => void scan()}>
          {scanning ? "Scanning…" : "Scan again"}
        </Button>
      </div>
      <div className="mt-6 max-w-md">
        <CountrySelect
          value={country}
          disabled={scanning}
          onChange={(code) => {
            void saveSettings(store.settings.minScore, store.settings.keywords, code);
          }}
        />
      </div>
      {jobs.length === 0 ? (
        <p className="mt-10 text-muted-foreground">
          No openings stored yet. Scan from Today.
        </p>
      ) : (
        <ul className="mt-8 space-y-4">
          {jobs.map((job) => {
            const done = already.has(job.id);
            return (
              <li key={job.id} className="rounded-xl border bg-card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-medium">{job.title}</h2>
                    <p className="text-sm text-muted-foreground">
                      {job.company} · {job.location} · {job.source} · {postedLabel(job.postedAt)}
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
                    <Button
                      type="button"
                      variant="outline"
                      disabled={logging === job.id}
                      onClick={() => {
                        setLogging(job.id);
                        void applied(job.id).finally(() => setLogging(null));
                      }}
                    >
                      {logging === job.id ? "Saving…" : "I applied"}
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
