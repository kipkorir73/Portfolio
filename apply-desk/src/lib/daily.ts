import { COVER_LETTER, PROFILE } from "./profile";
import { collectJobs } from "./jobs";
import { mutateStore, readStore } from "./store";
import type { Application, InboxMessage, Job } from "./types";

function todayKey(iso: string) {
  return iso.slice(0, 10);
}

export function statsFrom(store: ReturnType<typeof readStore>) {
  const apps = store.applications;
  const today = new Date().toISOString().slice(0, 10);
  const appliedToday = apps.filter((a) => a.appliedAt.slice(0, 10) === today);
  const byChannel = {
    email: apps.filter((a) => a.channel === "email" && a.status !== "queued").length,
    job_board: apps.filter((a) => a.channel === "job_board" && a.status !== "needs_you" && a.status !== "queued").length,
    company_site: apps.filter((a) => a.channel === "company_site" && a.status !== "needs_you" && a.status !== "queued").length,
    linkedin: apps.filter((a) => a.channel === "linkedin").length,
  };
  const replies = store.inbox.filter((m) => m.kind !== "other");
  return {
    totalApplied: apps.filter((a) => a.status !== "queued" && a.status !== "needs_you").length,
    needsYou: apps.filter((a) => a.status === "needs_you" || a.status === "queued").length,
    appliedToday: appliedToday.length,
    replies: replies.length,
    unread: store.inbox.filter((m) => m.unread).length,
    interviews: apps.filter((a) => a.status === "interview").length + store.inbox.filter((m) => m.kind === "interview").length,
    byChannel,
    emailConnected: store.settings.emailConnected,
    lastScanAt: store.settings.lastScanAt,
  };
}

function letter(job: Job) {
  return COVER_LETTER.replaceAll("{{title}}", job.title).replaceAll("{{company}}", job.company);
}

function applyOne(job: Job): Application {
  if (job.channel === "email" && job.applyEmail) {
    return {
      id: `app-${job.id}`,
      jobId: job.id,
      title: job.title,
      company: job.company,
      channel: "email",
      status: "sent",
      appliedAt: new Date().toISOString(),
      toEmail: job.applyEmail,
      url: job.url,
      note: `Application email queued to ${job.applyEmail} from ${PROFILE.email} (mock send unless SMTP is configured).\n\n${letter(job)}`,
    };
  }
  if (job.channel === "linkedin") {
    return {
      id: `app-${job.id}`,
      jobId: job.id,
      title: job.title,
      company: job.company,
      channel: "linkedin",
      status: "needs_you",
      appliedAt: new Date().toISOString(),
      toEmail: null,
      url: job.url,
      note: "Cannot auto-apply on LinkedIn. Open the job and use Easy Apply yourself, then mark it sent.",
    };
  }
  return {
    id: `app-${job.id}`,
    jobId: job.id,
    title: job.title,
    company: job.company,
    channel: job.channel,
    status: "queued",
    appliedAt: new Date().toISOString(),
    toEmail: null,
    url: job.url,
    note: "No apply-to email on this posting. Open the careers page and submit, then mark as sent.",
  };
}

export async function runDailyScan(opts?: { apply: boolean }) {
  const current = readStore();
  const jobs = await collectJobs(current.settings.keywords);
  const min = current.settings.minScore;
  const matched = jobs.filter((j) => j.score >= min).slice(0, 40);

  const store = mutateStore((s) => {
    const existing = new Map(s.jobs.map((j) => [j.id, j]));
    for (const job of matched) existing.set(job.id, job);
    s.jobs = [...existing.values()].sort((a, b) => b.score - a.score).slice(0, 80);
    s.settings.lastScanAt = new Date().toISOString();
  });

  let applied: Application[] = [];
  if (opts?.apply ?? store.settings.autoApplyEmail) {
    applied = autoApply(store.settings.dailyCap);
  }

  return { jobs: matched.length, applied: applied.length };
}

function autoApply(cap: number) {
  const today = new Date().toISOString().slice(0, 10);
  const created: Application[] = [];
  mutateStore((s) => {
    const already = new Set(s.applications.map((a) => a.jobId));
    const sentToday = s.applications.filter(
      (a) => todayKey(a.appliedAt) === today && a.status === "sent",
    ).length;
    let room = Math.max(0, cap - sentToday);
    for (const job of s.jobs) {
      if (room <= 0) break;
      if (already.has(job.id)) continue;
      if (job.channel !== "email" || !job.applyEmail) continue;
      const app = applyOne(job);
      s.applications.unshift(app);
      already.add(job.id);
      created.push(app);
      room -= 1;
    }
    let queued = 0;
    for (const job of s.jobs) {
      if (already.has(job.id)) continue;
      if (job.channel === "email") continue;
      if (queued >= 12) break;
      const app = applyOne(job);
      s.applications.unshift(app);
      already.add(job.id);
      queued += 1;
    }
    if (created.length) s.settings.lastApplyAt = new Date().toISOString();
  });
  return created;
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
  const sentEmail = store.applications.filter((a) => a.channel === "email" && a.status === "sent");
  const hasReply = new Set(store.inbox.map((m) => m.applicationId));

  for (const app of sentEmail.slice(0, 2)) {
    if (hasReply.has(app.id)) continue;
    extras.push({
      id: `msg-${app.id}`,
      from: `${app.company} Hiring`,
      fromEmail: app.toEmail ?? `jobs@${app.company.toLowerCase().replace(/\s+/g, "")}.com`,
      subject: `Re: ${app.title} — ${PROFILE.name}`,
      body: `Hello ${PROFILE.name.split(" ")[0]},\n\nWe received your CV for ${app.title}. This is a simulated inbox message so you can see how replies are filed against applications. Connect a real Gmail app password later to scan kipkorirc583@gmail.com.\n\n— ${app.company}`,
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
