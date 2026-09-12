import { guessChannel, scoreText } from "./match";
import type { Channel, Job } from "./types";

const UA =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const KE_PLACE =
  /\b(kenya|nairobi|mombasa|kisumu|nakuru|eldoret|thika|kiambu|machakos|nyeri|kitale|kakamega|meru|kisii|malindi|kilifi|kajiado|embu)\b/i;

const IT_HINT =
  /\b(ict|it support|it officer|it assistant|it specialist|it manager|help ?desk|service desk|sysadmin|systems? admin|network admin|network engineer|support engineer|technical support|desktop (support|technician)|it technician|ict technician|information technology|information systems|infrastructure manager|noc support)\b/i;

function idFrom(url: string, title: string) {
  const raw = `${url.split("?")[0]}|${title}`.toLowerCase();
  let h = 0;
  for (const ch of raw) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return `job-${h.toString(16)}`;
}

function strip(html: string) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&rsquo;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&ndash;/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

const MONTHS: Record<string, number> = {
  jan: 0,
  january: 0,
  feb: 1,
  february: 1,
  mar: 2,
  march: 2,
  apr: 3,
  april: 3,
  may: 4,
  jun: 5,
  june: 5,
  jul: 6,
  july: 6,
  aug: 7,
  august: 7,
  sep: 8,
  sept: 8,
  september: 8,
  oct: 9,
  october: 9,
  nov: 10,
  november: 10,
  dec: 11,
  december: 11,
};

function withinWeek(iso: string | null, now = Date.now()) {
  if (!iso) return false;
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return false;
  const age = now - t;
  return age >= -12 * 60 * 60 * 1000 && age <= WEEK_MS;
}

function toIso(date: Date) {
  return date.toISOString();
}

function parsePosted(text: string, now = Date.now()): string | null {
  const blob = strip(text);
  if (/\bnew\b/i.test(blob) && !/\d+\s+(week|month|year)s?\s+ago/i.test(blob)) {
    const rel = blob.match(/(\d+)\s+(minute|hour|day|week|month|year)s?\s+ago/i);
    if (!rel) return toIso(new Date(now));
  }
  const iso = blob.match(/\b(20\d{2}-\d{2}-\d{2})\b/);
  if (iso) {
    const t = Date.parse(iso[1] + "T12:00:00Z");
    return Number.isNaN(t) ? null : new Date(t).toISOString();
  }
  const rel = blob.match(/(\d+)\s+(minute|hour|day|week|month|year)s?\s+ago/i);
  if (rel) {
    const n = Number(rel[1]);
    const unit = rel[2].toLowerCase();
    const ms =
      unit.startsWith("minute") ? n * 60_000 :
      unit.startsWith("hour") ? n * 3_600_000 :
      unit.startsWith("day") ? n * 86_400_000 :
      unit.startsWith("week") ? n * 7 * 86_400_000 :
      unit.startsWith("month") ? n * 30 * 86_400_000 :
      n * 365 * 86_400_000;
    return toIso(new Date(now - ms));
  }
  if (/\btoday\b/i.test(blob)) return toIso(new Date(now));
  if (/\byesterday\b/i.test(blob)) return toIso(new Date(now - 86_400_000));
  const named = blob.match(
    /\b(\d{1,2})\s+(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t|tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)(?:\s+(\d{4}))?\b/i,
  );
  if (named) {
    const day = Number(named[1]);
    const month = MONTHS[named[2].toLowerCase()];
    const year = named[3] ? Number(named[3]) : new Date(now).getUTCFullYear();
    if (month == null) return null;
    const d = new Date(Date.UTC(year, month, day, 12));
    if (d.getTime() > now + 2 * 86_400_000) d.setUTCFullYear(year - 1);
    return d.toISOString();
  }
  return null;
}

function decode(text: string) {
  return strip(text);
}

function cleanUrl(href: string) {
  try {
    const u = new URL(href);
    if (u.hostname.includes("duckduckgo.com") && u.searchParams.get("uddg")) {
      return decodeURIComponent(u.searchParams.get("uddg") ?? href);
    }
    u.hash = "";
    if (u.hostname.includes("linkedin.com")) {
      u.search = "";
    }
    return u.toString();
  } catch {
    return href;
  }
}

function sourceFromUrl(url: string): { source: string; channel: Channel } {
  if (/linkedin\.com/i.test(url)) return { source: "LinkedIn", channel: "linkedin" };
  if (/brightermonday/i.test(url)) return { source: "BrighterMonday", channel: "job_board" };
  if (/myjobmag/i.test(url)) return { source: "MyJobMag", channel: "job_board" };
  if (/fuzu\.com/i.test(url)) return { source: "Fuzu", channel: "job_board" };
  if (/indeed\./i.test(url)) return { source: "Indeed", channel: "job_board" };
  if (/careerjet/i.test(url)) return { source: "Careerjet", channel: "job_board" };
  if (/greenhouse|lever\.co|workable|smartrecruiters|recruitee|ashbyhq/i.test(url)) {
    return { source: "Company ATS", channel: "company_site" };
  }
  if (/careers|jobs\./i.test(url)) return { source: "Company site", channel: "company_site" };
  return { source: guessChannel(url, null) === "job_board" ? "Web" : "Web", channel: guessChannel(url, null) };
}

function isKenyaJob(job: Pick<Job, "location" | "url" | "source" | "description" | "title">) {
  const blob = `${job.title} ${job.location} ${job.url} ${job.source} ${job.description}`;
  if (/brightermonday\.co\.ke|myjobmag\.co\.ke|fuzu\.com\/kenya|linkedin\.com\/jobs|ke\.linkedin/i.test(job.url)) {
    return KE_PLACE.test(blob) || /kenya/i.test(job.location) || /kenya/i.test(job.url);
  }
  return KE_PLACE.test(blob);
}

const FETCH_MS = 2200;
const SCAN_BUDGET_MS = 6500;

async function fetchText(url: string, ms: number) {
  try {
    const res = await fetch(url, {
      headers: {
        "user-agent": UA,
        accept: "text/html,application/xhtml+xml",
        "accept-language": "en-US,en;q=0.9",
      },
      cache: "no-store",
      redirect: "follow",
      signal: AbortSignal.timeout(ms),
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

function makeJob(partial: Omit<Job, "id" | "channel" | "score" | "reasons" | "tags" | "applyEmail"> & { applyEmail?: string | null }, keywords: string): Job {
  const { score, reasons } = scoreText(partial.title, `${partial.description} ${partial.location} Kenya`, keywords);
  const { source, channel } = sourceFromUrl(partial.url);
  return {
    ...partial,
    id: idFrom(partial.url, partial.title),
    source: partial.source || source,
    channel,
    applyEmail: partial.applyEmail ?? null,
    tags: ["Kenya", source, ...reasons].slice(0, 6),
    score,
    reasons,
  };
}

function parseBrighterMonday(html: string, scannedAt: string, keywords: string): Job[] {
  const jobs: Job[] = [];
  for (const card of html.split('data-cy="listing-cards-components"').slice(1)) {
    const href = card.match(/href="(https:\/\/www\.brightermonday\.co\.ke\/listings\/[^"]+)"/)?.[1];
    const title = decode(
      card.match(/title="([^"]+)"/)?.[1] || card.match(/<p class="text-lg[^"]*">([^<]+)<\/p>/)?.[1] || "",
    );
    const postedAt =
      parsePosted(card.match(/(\d+\s+(?:minute|hour|day|week|month)s?\s+ago)/i)?.[1] ?? "") ||
      (/>\s*New\s*</.test(card) ? parsePosted("today") : null);
    if (!href || !title || !withinWeek(postedAt)) continue;
    const company =
      decode(card.match(/<p class="text-sm text-blue-700[^"]*">\s*([^<]+)\s*<\/p>/)?.[1] ?? "") ||
      "Kenya employer";
    const location =
      decode(card.match(/rounded bg-brand-secondary-100[^>]*>\s*([^<]+)\s*<\/span>/)?.[1] ?? "Kenya") ||
      "Kenya";
    jobs.push(
      makeJob(
        {
          title,
          company,
          location: /kenya/i.test(location) ? location : `${location}, Kenya`,
          source: "BrighterMonday",
          url: href,
          description: `${company} · ${location}`,
          postedAt: postedAt ?? scannedAt,
          scannedAt,
        },
        keywords,
      ),
    );
  }
  return jobs;
}

function parseMyJobMag(html: string, scannedAt: string, keywords: string): Job[] {
  const jobs: Job[] = [];
  for (const block of html.split('class="job-list-li"').slice(1)) {
    const href = block.match(/href="(\/job\/[^"]+)"/)?.[1];
    const titleRaw = block.match(/<h2>\s*<a href="\/job\/[^"]+">([^<]+)<\/a>/)?.[1];
    const postedAt = parsePosted(block.match(/id="job-date">([^<]+)/)?.[1] ?? "");
    if (!href || !titleRaw || !withinWeek(postedAt)) continue;
    const title = strip(titleRaw).replace(/\s+at\s+.+$/i, "").trim() || strip(titleRaw);
    const company =
      block.match(/alt="([^"]+)"/)?.[1]?.replace(/\s+logo$/i, "").trim() ||
      strip(titleRaw).split(/\s+at\s+/i)[1] ||
      "Kenya employer";
    const description = strip(block.match(/class="job-desc">([\s\S]*?)<\/li>/)?.[1] ?? "").slice(0, 420);
    const url = new URL(href, "https://www.myjobmag.co.ke").toString();
    jobs.push(
      makeJob(
        {
          title,
          company,
          location: "Kenya",
          source: "MyJobMag",
          url,
          description: description || `${title} listed on MyJobMag Kenya.`,
          postedAt: postedAt ?? scannedAt,
          scannedAt,
        },
        keywords,
      ),
    );
  }
  return jobs;
}

function parseFuzu(html: string, scannedAt: string, keywords: string): Job[] {
  const jobs: Job[] = [];
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)) {
    try {
      const data = JSON.parse(m[1]) as {
        "@type"?: string;
        itemListElement?: Array<{ name?: string; url?: string; datePosted?: string }>;
      };
      if (data["@type"] !== "ItemList") continue;
      for (const item of data.itemListElement ?? []) {
        if (!item.name || !item.url || !/\/kenya\//i.test(item.url)) continue;
        const postedAt = parsePosted(item.datePosted ?? "");
        if (!withinWeek(postedAt)) continue;
        jobs.push(
          makeJob(
            {
              title: item.name,
              company: "Fuzu Kenya",
              location: "Kenya",
              source: "Fuzu",
              url: item.url,
              description: `${item.name} listed on Fuzu Kenya.`,
              postedAt: postedAt ?? new Date().toISOString(),
              scannedAt,
            },
            keywords,
          ),
        );
      }
    } catch {
      // ignore
    }
  }
  return jobs;
}

function parseLinkedIn(html: string, scannedAt: string, keywords: string): Job[] {
  const jobs: Job[] = [];
  for (const card of html.split("job-search-card").slice(1)) {
    const href = card.match(/href="(https:\/\/[a-z.]*linkedin\.com\/jobs\/view\/[^"?]+)/)?.[1];
    const title = decode(card.match(/base-search-card__title[^>]*>([\s\S]*?)<\/h3>/)?.[1] ?? "");
    const company = decode(card.match(/base-search-card__subtitle[^>]*>([\s\S]*?)<\/h4>/)?.[1] ?? "Employer");
    const location = decode(card.match(/job-search-card__location[^>]*>([\s\S]*?)<\/span>/)?.[1] ?? "Kenya");
    const postedAt =
      parsePosted(card.match(/job-search-card__listdate[^>]*datetime="([^"]+)"/)?.[1] ?? "") ||
      parsePosted(card.match(/job-search-card__listdate[\s\S]{0,400}?<\/time>/)?.[0] ?? "");
    if (!href || !title || !withinWeek(postedAt)) continue;
    jobs.push(
      makeJob(
        {
          title,
          company,
          location,
          source: "LinkedIn",
          url: cleanUrl(href),
          description: `${company} · ${location}`,
          postedAt: postedAt ?? scannedAt,
          scannedAt,
        },
        keywords,
      ),
    );
  }
  return jobs;
}

function parseDuckDuckGo(html: string, scannedAt: string, keywords: string): Job[] {
  const jobs: Job[] = [];
  const anchors = [
    ...html.matchAll(/class="result__a"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g),
  ];
  for (const m of anchors) {
    const url = cleanUrl(decodeURIComponent(m[1]));
    const title = decode(m[2]);
    if (!title || !url.startsWith("http")) continue;
    const postedAt = parsePosted(title);
    if (!withinWeek(postedAt)) continue;
    if (!/job|career|linkedin|greenhouse|lever|workable|vacancy|hiring|brightermonday|myjobmag/i.test(`${url} ${title}`)) {
      continue;
    }
    if (/wikipedia|youtube|facebook\.com\/login|duckduckgo/i.test(url)) continue;
    let host = "web";
    try {
      host = new URL(url).hostname.replace(/^www\./, "");
    } catch {
      continue;
    }
    jobs.push(
      makeJob(
        {
          title: title.replace(/\s*[|\-–].{0,50}$/, "").trim() || title,
          company: host,
          location: KE_PLACE.test(title) ? "Kenya" : "Kenya (search)",
          source: sourceFromUrl(url).source,
          url,
          description: title,
          postedAt: postedAt ?? scannedAt,
          scannedAt,
        },
        keywords,
      ),
    );
  }
  return jobs;
}

const PRIMARY_URLS = [
  "https://www.brightermonday.co.ke/jobs?q=IT+support",
  "https://www.brightermonday.co.ke/jobs?q=ICT",
  "https://www.myjobmag.co.ke/jobs-by-field/it-telecoms",
  "https://www.myjobmag.co.ke/search/jobs?q=IT+support",
  "https://www.fuzu.com/kenya/jobs?q=ICT",
];

const SECONDARY_URLS = [
  "https://www.linkedin.com/jobs/search?keywords=IT%20Support&location=Kenya&f_TPR=r604800",
  "https://www.linkedin.com/jobs/search?keywords=ICT%20Officer&location=Kenya&f_TPR=r604800",
  "https://html.duckduckgo.com/html/?q=IT%20support%20jobs%20Nairobi%20Kenya%20site%3Abrightermonday.co.ke",
];

function parsePage(url: string, html: string, scannedAt: string, keywords: string): Job[] {
  try {
    if (url.includes("brightermonday")) return parseBrighterMonday(html, scannedAt, keywords);
    if (url.includes("myjobmag")) return parseMyJobMag(html, scannedAt, keywords);
    if (url.includes("fuzu")) return parseFuzu(html, scannedAt, keywords);
    if (url.includes("linkedin.com/jobs")) return parseLinkedIn(html, scannedAt, keywords);
    if (url.includes("duckduckgo.com")) return parseDuckDuckGo(html, scannedAt, keywords);
  } catch {
    return [];
  }
  return [];
}

export async function collectJobs(keywords: string): Promise<Job[]> {
  const scannedAt = new Date().toISOString();
  const found: Job[] = [];
  const started = Date.now();
  const remaining = () => SCAN_BUDGET_MS - (Date.now() - started);

  async function runUrls(urls: string[]) {
    const ms = Math.min(FETCH_MS, Math.max(0, remaining() - 200));
    if (ms < 400) return;
    const pages = await Promise.all(urls.map((url) => fetchText(url, ms)));
    pages.forEach((html, i) => {
      if (!html) return;
      found.push(...parsePage(urls[i], html, scannedAt, keywords));
    });
  }

  await runUrls(PRIMARY_URLS);
  if (remaining() > 900) await runUrls(SECONDARY_URLS);

  const byId = new Map<string, Job>();
  for (const job of found) {
    if (!IT_HINT.test(job.title)) continue;
    if (!isKenyaJob(job)) continue;
    if (!withinWeek(job.postedAt)) continue;
    const prev = byId.get(job.id);
    if (!prev || job.score > prev.score) byId.set(job.id, job);
  }

  return [...byId.values()].sort((a, b) => b.score - a.score);
}
