import type { Application, ApplicationStatus, InboxMessage, Job, Store } from "./types";

function later(a: string | null | undefined, b: string | null | undefined) {
  const ta = a ? Date.parse(a) : 0;
  const tb = b ? Date.parse(b) : 0;
  return ta >= tb ? a ?? null : b ?? null;
}

const STATUS_RANK: Record<ApplicationStatus, number> = {
  queued: 0,
  needs_you: 1,
  sent: 2,
  replied: 3,
  rejected: 3,
  interview: 4,
};

function preferApp(a: Application, b: Application) {
  if (STATUS_RANK[b.status] !== STATUS_RANK[a.status]) {
    return STATUS_RANK[b.status] > STATUS_RANK[a.status] ? b : a;
  }
  return Date.parse(b.appliedAt) >= Date.parse(a.appliedAt) ? b : a;
}

function preferJob(a: Job, b: Job) {
  return Date.parse(b.scannedAt) >= Date.parse(a.scannedAt) ? b : a;
}

function preferMsg(a: InboxMessage, b: InboxMessage) {
  return {
    ...a,
    ...b,
    unread: a.unread || b.unread,
  };
}

function byId<T extends { id: string }>(items: T[], pick: (a: T, b: T) => T) {
  const map = new Map<string, T>();
  for (const item of items) {
    const prev = map.get(item.id);
    map.set(item.id, prev ? pick(prev, item) : item);
  }
  return [...map.values()];
}

export function mergeStores(server: Store, local: Store | null | undefined): Store {
  if (!local) return server;
  const serverScan = server.settings.lastScanAt ? Date.parse(server.settings.lastScanAt) : 0;
  const localScan = local.settings.lastScanAt ? Date.parse(local.settings.lastScanAt) : 0;
  const localSettingsAt = local.settings.updatedAt ? Date.parse(local.settings.updatedAt) : 0;
  const serverSettingsAt = server.settings.updatedAt ? Date.parse(server.settings.updatedAt) : 0;
  const settingsFromLocal = localSettingsAt > 0 && localSettingsAt >= serverSettingsAt;
  const jobs =
    local.jobs.length === 0
      ? server.jobs
      : server.jobs.length === 0
        ? local.jobs
        : byId(
            localScan >= serverScan ? [...server.jobs, ...local.jobs] : [...local.jobs, ...server.jobs],
            preferJob,
          ).slice(0, 120);

  return {
    jobs,
    applications: byId([...server.applications, ...local.applications], preferApp),
    inbox: byId([...server.inbox, ...local.inbox], preferMsg).slice(0, 80),
    profile: later(server.profile?.cvUploadedAt, local.profile?.cvUploadedAt) === local.profile?.cvUploadedAt
      ? local.profile ?? server.profile ?? { cvFileName: null, cvUploadedAt: null, cvText: null }
      : server.profile ?? local.profile ?? { cvFileName: null, cvUploadedAt: null, cvText: null },
    settings: {
      autoApplyEmail: false,
      dailyCap: local.settings.dailyCap || server.settings.dailyCap,
      minScore: (settingsFromLocal ? local.settings.minScore : server.settings.minScore) ?? 10,
      keywords: (settingsFromLocal ? local.settings.keywords : server.settings.keywords) || server.settings.keywords,
      emailConnected: Boolean(server.settings.emailConnected),
      connectedEmail: server.settings.connectedEmail,
      lastScanAt: later(server.settings.lastScanAt, local.settings.lastScanAt),
      lastApplyAt: later(server.settings.lastApplyAt, local.settings.lastApplyAt),
      country:
        (settingsFromLocal ? local.settings.country : server.settings.country) ||
        local.settings.country ||
        server.settings.country ||
        "worldwide",
      updatedAt: later(server.settings.updatedAt, local.settings.updatedAt),
    },
  };
}

export function isStore(value: unknown): value is Store {
  if (!value || typeof value !== "object") return false;
  const v = value as Store;
  return (
    Array.isArray(v.jobs) &&
    Array.isArray(v.applications) &&
    Array.isArray(v.inbox) &&
    Boolean(v.settings) &&
    typeof v.settings === "object"
  );
}

export const LOCAL_STORE_KEY = "apply-desk-v1";
