import { guessChannel, scoreText } from "./match";
import type { Job } from "./types";

const UA =
  "Mozilla/5.0 (compatible; ApplyDesk/1.0; +https://github.com/kipkorir73/Portfolio)";

const KE_PLACE =
  /\b(kenya|nairobi|mombasa|kisumu|nakuru|eldoret|thika|kiambu|machakos|nyeri|kitale|kakamega|meru|kisii|malindi|kilifi|kajiado|embu|garissa|nyahururu|naivasha)\b/i;

const NOT_KE =
  /\b(berlin|munich|germany|london|united states|new york|india|lagos|accra|kampala only|remote worldwide)\b/i;

const IT_HINT =
  /\b(ict|it support|it officer|it assistant|it specialist|it manager|help ?desk|service desk|sysadmin|systems? admin|network admin|network engineer|support engineer|desktop support|information technology|information systems|infrastructure manager|technician)\b/i;

function idFrom(url: string, title: string) {
  const raw = `${url}|${title}`.toLowerCase();
  let h = 0;
  for (const ch of raw) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return `job-${h.toString(16)}`;
}

function strip(html: string) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&rsquo;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&ndash;/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

function isKenyaJob(job: Pick<Job, "location" | "url" | "source" | "description">) {
  const blob = `${job.location} ${job.url} ${job.source} ${job.description}`;
  if (NOT_KE.test(blob) && !KE_PLACE.test(blob)) return false;
  if (/brightermonday\.co\.ke|myjobmag\.co\.ke|fuzu\.com\/kenya/i.test(job.url)) return true;
  return KE_PLACE.test(blob);
}

function decode(text: string) {
  return strip(text)
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"');
}

async function fetchText(url: string) {
  const res = await fetch(url, {
    headers: { "user-agent": UA, accept: "text/html,application/json" },
    cache: "no-store",
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`${url} ${res.status}`);
  return res.text();
}

function parseBrighterMonday(html: string, scannedAt: string, keywords: string): Job[] {
  const cards = html.split('data-cy="listing-cards-components"').slice(1);
  const jobs: Job[] = [];
  for (const card of cards) {
    const href = card.match(
      /href="(https:\/\/www\.brightermonday\.co\.ke\/listings\/[^"]+)"/,
    )?.[1];
    const title = decode(
      card.match(/title="([^"]+)"/)?.[1] ||
        card.match(/<p class="text-lg[^"]*">([^<]+)<\/p>/)?.[1] ||
        "",
    );
    if (!href || !title) continue;
    const company = decode(
      card.match(/<p class="text-sm text-blue-700[^"]*">\s*([^<]+)\s*<\/p>/)?.[1] ?? "",
    ) || "Kenya employer";
    const location = decode(
      card.match(/rounded bg-brand-secondary-100[^>]*>\s*([^<]+)\s*<\/span>/)?.[1] ?? "Kenya",
    ) || "Kenya";
    const category = decode(
      card.match(/<p class="text-sm text-gray-500[^"]*inline-block">\s*([^<]+)\s*<\/p>/)?.[1] ?? "",
    );
    const description = [company, location, category].filter(Boolean).join(" · ");
    const { score, reasons } = scoreText(title, `${description} Kenya`, keywords);
    jobs.push({
      id: idFrom(href, title),
      title,
      company,
      location: /kenya/i.test(location) ? location : `${location}, Kenya`,
      source: "BrighterMonday",
      url: href,
      applyEmail: null,
      channel: "job_board",
      description,
      tags: ["Kenya", ...reasons].slice(0, 6),
      score,
      reasons,
      postedAt: scannedAt,
      scannedAt,
    });
  }
  return jobs;
}

function parseMyJobMag(html: string, scannedAt: string, keywords: string): Job[] {
  const jobs: Job[] = [];
  const blocks = html.split('class="job-list-li"').slice(1);
  for (const block of blocks) {
    const href = block.match(/href="(\/job\/[^"]+)"/)?.[1];
    const titleRaw = block.match(/<h2>\s*<a href="\/job\/[^"]+">([^<]+)<\/a>/)?.[1];
    if (!href || !titleRaw) continue;
    const title = strip(titleRaw).replace(/\s+at\s+.+$/i, "").trim() || strip(titleRaw);
    const company =
      block.match(/alt="([^"]+)"/)?.[1]?.replace(/\s+logo$/i, "").trim() ||
      strip(titleRaw).split(/\s+at\s+/i)[1] ||
      "Kenya employer";
    const description = strip(block.match(/class="job-desc">([\s\S]*?)<\/li>/)?.[1] ?? "").slice(
      0,
      420,
    );
    const url = new URL(href, "https://www.myjobmag.co.ke").toString();
    const { score, reasons } = scoreText(title, `${description} Kenya Nairobi`, keywords);
    jobs.push({
      id: idFrom(url, title),
      title,
      company,
      location: "Kenya",
      source: "MyJobMag",
      url,
      applyEmail: null,
      channel: "job_board",
      description: description || `${title} listed on MyJobMag Kenya.`,
      tags: ["Kenya", ...reasons].slice(0, 6),
      score,
      reasons,
      postedAt: scannedAt,
      scannedAt,
    });
  }
  return jobs;
}

function parseFuzu(html: string, scannedAt: string, keywords: string): Job[] {
  const jobs: Job[] = [];
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)];
  for (const m of blocks) {
    try {
      const data = JSON.parse(m[1]) as {
        "@type"?: string;
        itemListElement?: Array<{ name?: string; url?: string }>;
      };
      if (data["@type"] !== "ItemList") continue;
      for (const item of data.itemListElement ?? []) {
        if (!item.name || !item.url) continue;
        if (!/\/kenya\//i.test(item.url)) continue;
        const { score, reasons } = scoreText(item.name, "Kenya Nairobi ICT", keywords);
        jobs.push({
          id: idFrom(item.url, item.name),
          title: item.name,
          company: item.url.split("/").pop()?.replace(/-/g, " ") ?? "Kenya employer",
          location: "Kenya",
          source: "Fuzu",
          url: item.url,
          applyEmail: null,
          channel: "job_board",
          description: `${item.name} listed on Fuzu Kenya.`,
          tags: ["Kenya", ...reasons].slice(0, 6),
          score,
          reasons,
          postedAt: scannedAt,
          scannedAt,
        });
      }
    } catch {
      // ignore bad json-ld
    }
  }
  return jobs;
}

const BOARD_URLS = [
  "https://www.brightermonday.co.ke/jobs?q=ICT",
  "https://www.brightermonday.co.ke/jobs?q=IT+support",
  "https://www.brightermonday.co.ke/jobs?q=helpdesk",
  "https://www.brightermonday.co.ke/jobs?q=systems+administrator",
  "https://www.myjobmag.co.ke/search/jobs?q=IT+support",
  "https://www.myjobmag.co.ke/search/jobs?q=ICT",
  "https://www.myjobmag.co.ke/search/jobs?q=helpdesk",
  "https://www.myjobmag.co.ke/jobs-by-field/it-telecoms",
  "https://www.fuzu.com/kenya/jobs?q=ICT",
];

export async function collectJobs(keywords: string): Promise<Job[]> {
  const scannedAt = new Date().toISOString();
  const pages = await Promise.allSettled(BOARD_URLS.map((url) => fetchText(url)));
  const found: Job[] = [];

  pages.forEach((result, i) => {
    if (result.status !== "fulfilled") return;
    const url = BOARD_URLS[i];
    const html = result.value;
    if (url.includes("brightermonday")) found.push(...parseBrighterMonday(html, scannedAt, keywords));
    else if (url.includes("myjobmag")) found.push(...parseMyJobMag(html, scannedAt, keywords));
    else if (url.includes("fuzu")) found.push(...parseFuzu(html, scannedAt, keywords));
  });

  const byId = new Map<string, Job>();
  for (const job of found) {
    if (!isKenyaJob(job)) continue;
    if (!IT_HINT.test(job.title)) continue;
    const prev = byId.get(job.id);
    if (!prev || job.score > prev.score) byId.set(job.id, job);
  }

  return [...byId.values()].sort((a, b) => b.score - a.score);
}
