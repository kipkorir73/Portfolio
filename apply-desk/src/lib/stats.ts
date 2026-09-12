import type { Store } from "./types";

export function statsFrom(store: Store) {
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

export type DeskStats = ReturnType<typeof statsFrom>;
