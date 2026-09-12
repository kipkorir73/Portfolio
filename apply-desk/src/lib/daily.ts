import { collectJobs } from "./jobs";
import { mutateStore, readStore } from "./store";
import type { Application } from "./types";

export async function runDailyScan() {
  const current = await readStore();
  const extra = [current.settings.keywords, current.profile?.cvText].filter(Boolean).join("\n");
  const jobs = await collectJobs(extra);
  const min = current.settings.minScore >= 20 ? 10 : current.settings.minScore;
  const matched = jobs.filter((j) => j.score >= min).slice(0, 120);
  const keptPrevious = matched.length === 0 && current.jobs.length > 0;

  await mutateStore((s) => {
    if (matched.length > 0) s.jobs = matched;
    s.settings.lastScanAt = new Date().toISOString();
    s.settings.autoApplyEmail = false;
  });

  return {
    jobs: matched.length > 0 ? matched.length : current.jobs.length,
    keptPrevious,
  };
}

export async function markJobApplied(jobId: string) {
  const store = await readStore();
  const job = store.jobs.find((j) => j.id === jobId);
  if (!job) return store;
  if (store.applications.some((a) => a.jobId === jobId && a.status !== "queued")) {
    return store;
  }
  const app: Application = {
    id: `app-${job.id}`,
    jobId: job.id,
    title: job.title,
    company: job.company,
    channel: job.channel,
    status: "sent",
    appliedAt: new Date().toISOString(),
    toEmail: job.applyEmail,
    url: job.url,
    note: `You applied yourself via the posting. Follow-up will use Gmail once you grant access.`,
  };
  return mutateStore((s) => {
    s.applications = s.applications.filter((a) => a.jobId !== jobId);
    s.applications.unshift(app);
    s.settings.lastApplyAt = app.appliedAt;
  });
}

export async function markApplication(id: string, status: Application["status"]) {
  return mutateStore((s) => {
    const app = s.applications.find((a) => a.id === id);
    if (app) app.status = status;
  });
}

export async function markRead(id: string) {
  return mutateStore((s) => {
    const msg = s.inbox.find((m) => m.id === id);
    if (msg) msg.unread = false;
  });
}
