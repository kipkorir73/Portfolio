import { PROFILE } from "./profile";
import { collectJobs } from "./jobs";
import { mutateStore, readStore } from "./store";
import type { Application, InboxMessage } from "./types";

export function statsFrom(store: ReturnType<typeof readStore>) {
  const apps = store.applications;
  const today = new Date().toISOString().slice(0, 10);
  const appliedToday = apps.filter(
    (a) =>
      a.appliedAt.slice(0, 10) === today &&
      a.status !== "queued" &&
      a.status !== "needs_you",
  );
  const byChannel = {
    email: apps.filter((a) => a.channel === "email" && a.status !== "queued").length,
    job_board: apps.filter((a) => a.channel === "job_board" && a.status !== "needs_you" && a.status !== "queued").length,
    company_site: apps.filter((a) => a.channel === "company_site" && a.status !== "needs_you" && a.status !== "queued").length,
    linkedin: apps.filter((a) => a.channel === "linkedin").length,
  };
  const replies = store.inbox.filter((m) => m.kind !== "other");
  return {
    totalApplied: apps.filter((a) => a.status !== "queued" && a.status !== "needs_you").length,
    openRoles: store.jobs.filter((j) => !apps.some((a) => a.jobId === j.id && a.status !== "queued")).length,
    appliedToday: appliedToday.length,
    replies: replies.length,
    unread: store.inbox.filter((m) => m.unread).length,
    interviews:
      apps.filter((a) => a.status === "interview").length +
      store.inbox.filter((m) => m.kind === "interview").length,
    byChannel,
    emailConnected: store.settings.emailConnected,
    lastScanAt: store.settings.lastScanAt,
  };
}

export async function runDailyScan() {
  const current = readStore();
  const jobs = await collectJobs(current.settings.keywords);
  const min = current.settings.minScore;
  const matched = jobs.filter((j) => j.score >= min).slice(0, 80);

  mutateStore((s) => {
    s.jobs = matched.slice(0, 80);
    s.settings.lastScanAt = new Date().toISOString();
    s.settings.autoApplyEmail = false;
  });

  return { jobs: matched.length };
}

export function markJobApplied(jobId: string) {
  const store = readStore();
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

export function connectEmail() {
  return mutateStore((s) => {
    s.settings.emailConnected = true;
    s.settings.connectedEmail = PROFILE.email;
  });
}

export function syncInbox() {
  const store = readStore();
  if (!store.settings.emailConnected) {
    throw new Error("Connect email first");
  }

  const extras: InboxMessage[] = [];
  const sent = store.applications.filter((a) => a.status === "sent");
  const hasReply = new Set(store.inbox.map((m) => m.applicationId));

  for (const app of sent.slice(0, 2)) {
    if (hasReply.has(app.id)) continue;
    extras.push({
      id: `msg-${app.id}`,
      from: `${app.company} Hiring`,
      fromEmail: app.toEmail ?? `jobs@${app.company.toLowerCase().replace(/\s+/g, "")}.com`,
      subject: `Re: ${app.title} — ${PROFILE.name}`,
      body: `Hello ${PROFILE.name.split(" ")[0]},\n\nThis is a placeholder until Gmail is connected. Real replies to ${PROFILE.email} will file here against jobs you marked as applied.\n\n— ${app.company}`,
      receivedAt: new Date().toISOString(),
      applicationId: app.id,
      kind: "reply",
      unread: true,
    });
  }

  return mutateStore((s) => {
    for (const msg of extras) {
      s.inbox.unshift(msg);
      const app = s.applications.find((a) => a.id === msg.applicationId);
      if (app && app.status === "sent") app.status = "replied";
    }
  });
}

export function markApplication(id: string, status: Application["status"]) {
  return mutateStore((s) => {
    const app = s.applications.find((a) => a.id === id);
    if (app) app.status = status;
  });
}

export function markRead(id: string) {
  return mutateStore((s) => {
    const msg = s.inbox.find((m) => m.id === id);
    if (msg) msg.unread = false;
  });
}
