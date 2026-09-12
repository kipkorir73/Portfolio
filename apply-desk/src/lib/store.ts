import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { PROFILE } from "./profile";
import type { Store } from "./types";

const FILE = join(process.cwd(), "data", "store.json");

function seed(): Store {
  const scannedAt = new Date().toISOString();
  return {
    settings: {
      autoApplyEmail: true,
      dailyCap: 6,
      minScore: 40,
      keywords: "IT support, helpdesk, systems administrator, network, Nairobi, ICT",
      emailConnected: false,
      connectedEmail: null,
      lastScanAt: null,
      lastApplyAt: null,
    },
    jobs: [],
    applications: [
      {
        id: "app-seed-1",
        jobId: "seed-1",
        title: "IT Support Technician",
        company: "Aga Khan University Hospital",
        channel: "email",
        status: "replied",
        appliedAt: daysAgo(4),
        toEmail: "recruitment@aku.edu",
        url: "https://www.aku.edu/careers",
        note: "Application email sent from desk (demo history).",
      },
      {
        id: "app-seed-2",
        jobId: "seed-2",
        title: "ICT Officer",
        company: "International School of Kenya",
        channel: "company_site",
        status: "sent",
        appliedAt: daysAgo(2),
        toEmail: null,
        url: "https://www.isk.ac.ke/",
        note: "Marked applied after submitting on the school careers page.",
      },
      {
        id: "app-seed-3",
        jobId: "seed-3",
        title: "Desktop Support",
        company: "Safaricom PLC",
        channel: "linkedin",
        status: "needs_you",
        appliedAt: daysAgo(1),
        toEmail: null,
        url: "https://www.linkedin.com/jobs/",
        note: "LinkedIn does not allow bots to apply. Open the posting and submit yourself.",
      },
    ],
    inbox: [
      {
        id: "msg-seed-1",
        from: "AKU Recruitment",
        fromEmail: "recruitment@aku.edu",
        subject: "Re: IT Support Technician — Collins Kipkorir",
        body: `Hi Collins,\n\nThank you for your application. We have received your CV and would like to schedule a 20-minute phone screen next week.\n\nPlease reply with two mornings that work for you.\n\nRecruitment\nAga Khan University Hospital`,
        receivedAt: daysAgo(1),
        applicationId: "app-seed-1",
        kind: "interview",
        unread: true,
      },
    ],
  };
}

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(10, 15, 0, 0);
  return d.toISOString();
}

function emptyOk(store: Store) {
  void PROFILE;
  return store;
}

export function readStore(): Store {
  if (!existsSync(FILE)) {
    const initial = emptyOk(seed());
    writeStore(initial);
    return initial;
  }
  return JSON.parse(readFileSync(FILE, "utf8")) as Store;
}

export function writeStore(store: Store) {
  mkdirSync(join(process.cwd(), "data"), { recursive: true });
  writeFileSync(FILE, JSON.stringify(store, null, 2));
}

export function mutateStore(fn: (store: Store) => void): Store {
  const store = readStore();
  fn(store);
  writeStore(store);
  return store;
}
