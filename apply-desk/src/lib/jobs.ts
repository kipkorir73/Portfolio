import { guessChannel, scoreText } from "./match";
import type { Job } from "./types";

function idFrom(url: string, title: string) {
  const raw = `${url}|${title}`.toLowerCase();
  let h = 0;
  for (const ch of raw) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return `job-${h.toString(16)}`;
}

const SEED_JOBS: Omit<Job, "score" | "reasons" | "scannedAt">[] = [
  {
    id: "local-1",
    title: "IT Assistant / ICT Support",
    company: "Brookhouse School",
    location: "Nairobi, Kenya",
    source: "School careers",
    url: "https://www.brookhouse.ac.ke/careers",
    applyEmail: "recruitment@brookhouse.ac.ke",
    channel: "email",
    description:
      "First-line IT support for staff and students. PCs, printers, Google Workspace, classroom AV, and user accounts. School environment.",
    tags: ["IT support", "education", "Nairobi"],
    postedAt: new Date().toISOString(),
  },
  {
    id: "local-2",
    title: "Network & Desktop Support Technician",
    company: "CopyCat Group",
    location: "Nairobi, Kenya",
    source: "Company site",
    url: "https://copycatgroup.com/careers",
    applyEmail: null,
    channel: "company_site",
    description:
      "LAN/WAN support, Windows endpoints, printers, and on-site troubleshooting for enterprise clients in Nairobi.",
    tags: ["network", "Windows", "Nairobi"],
    postedAt: new Date().toISOString(),
  },
  {
    id: "local-3",
    title: "Helpdesk Analyst (L1)",
    company: "Liquid Intelligent Technologies",
    location: "Nairobi / hybrid",
    source: "Job board",
    url: "https://www.brightermonday.co.ke/",
    applyEmail: "careers@liquid.tech",
    channel: "email",
    description:
      "L1 ticketing, connectivity issues, user access, and escalation. ISP and enterprise environment.",
    tags: ["helpdesk", "L1", "ticketing"],
    postedAt: new Date().toISOString(),
  },
  {
    id: "local-4",
    title: "IT Support Specialist",
    company: "Equity Bank",
    location: "Nairobi, Kenya",
    source: "LinkedIn",
    url: "https://www.linkedin.com/jobs/view/it-support-equity",
    applyEmail: null,
    channel: "linkedin",
    description:
      "Branch and HQ desktop support, Windows, peripherals, and user account management. Easy Apply on LinkedIn.",
    tags: ["IT support", "Windows", "LinkedIn"],
    postedAt: new Date().toISOString(),
  },
  {
    id: "local-5",
    title: "Systems Administrator (Junior)",
    company: "Moringa School",
    location: "Nairobi, Kenya",
    source: "Company site",
    url: "https://moringaschool.com/careers",
    applyEmail: "people@moringaschool.com",
    channel: "email",
    description:
      "Windows/Linux labs, campus Wi-Fi, student accounts, and first-line support for a training campus.",
    tags: ["sysadmin", "Linux", "campus"],
    postedAt: new Date().toISOString(),
  },
  {
    id: "local-6",
    title: "ICT Officer — School",
    company: "Braeburn Schools",
    location: "Nairobi, Kenya",
    source: "School careers",
    url: "https://www.braeburn.com/careers",
    applyEmail: "recruitment@braeburn.ac.ke",
    channel: "email",
    description:
      "Support teachers and students, maintain PCs and printers, biometric attendance, and follow school IT policy.",
    tags: ["school", "ICT", "hardware"],
    postedAt: new Date().toISOString(),
  },
];

async function fetchJson(url: string) {
  const res = await fetch(url, {
    headers: { "user-agent": "ApplyDesk/1.0 (personal job matcher)" },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`${url} ${res.status}`);
  return res.json();
}

function fromRemoteOk(raw: unknown[], keywords: string, scannedAt: string): Job[] {
  return raw
    .filter((row) => row && typeof row === "object" && "position" in row)
    .map((row) => {
      const r = row as {
        position?: string;
        company?: string;
        location?: string;
        url?: string;
        description?: string;
        tags?: string[];
        date?: string;
      };
      const title = r.position ?? "Role";
      const description = strip(r.description ?? "");
      const url = r.url ?? "https://remoteok.com";
      const { score, reasons } = scoreText(title, description, keywords);
      return {
        id: idFrom(url, title),
        title,
        company: r.company ?? "Remote company",
        location: r.location || "Remote",
        source: "RemoteOK",
        url,
        applyEmail: null,
        channel: guessChannel(url, null),
        description: description.slice(0, 420),
        tags: (r.tags ?? []).slice(0, 6),
        score,
        reasons,
        postedAt: r.date ?? scannedAt,
        scannedAt,
      } satisfies Job;
    });
}

function strip(html: string) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export async function collectJobs(keywords: string): Promise<Job[]> {
  const scannedAt = new Date().toISOString();
  const found: Job[] = [];

  try {
    const remoteOk = (await fetchJson("https://remoteok.com/api")) as unknown[];
    found.push(...fromRemoteOk(remoteOk, keywords, scannedAt));
  } catch {
    // public API can throttle; local board still runs
  }

  try {
    const arbeitnow = (await fetchJson(
      "https://www.arbeitnow.com/api/job-board-api",
    )) as { data?: Array<{ slug: string; title: string; company_name: string; location: string; url: string; description: string; tags?: string[]; created_at: number }> };
    for (const r of arbeitnow.data ?? []) {
      const { score, reasons } = scoreText(r.title, strip(r.description), keywords);
      found.push({
        id: idFrom(r.url, r.title),
        title: r.title,
        company: r.company_name,
        location: r.location || "Remote",
        source: "Arbeitnow",
        url: r.url,
        applyEmail: null,
        channel: guessChannel(r.url, null),
        description: strip(r.description).slice(0, 420),
        tags: (r.tags ?? []).slice(0, 6),
        score,
        reasons,
        postedAt: new Date(r.created_at * 1000).toISOString(),
        scannedAt,
      });
    }
  } catch {
    // ignore
  }

  for (const job of SEED_JOBS) {
    const { score, reasons } = scoreText(job.title, job.description, keywords);
    found.push({ ...job, score, reasons, scannedAt });
  }

  const byId = new Map<string, Job>();
  for (const job of found) {
    const prev = byId.get(job.id);
    if (!prev || job.score > prev.score) byId.set(job.id, job);
  }

  return [...byId.values()].sort((a, b) => b.score - a.score);
}
