import { guessChannel, scoreText } from "./match";
import type { Channel, Job } from "./types";

const UA =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const KE_PLACE =
  /\b(kenya|nairobi|mombasa|kisumu|nakuru|eldoret|thika|kiambu|machakos|nyeri|kitale|kakamega|meru|kisii|malindi|kilifi|kajiado|embu)\b/i;

const IT_HINT =
  /\b(ict|it support|it officer|it assistant|it specialist|it manager|help ?desk|service desk|sysadmin|systems? admin|network admin|network engineer|support engineer|technical support|desktop (support|technician)|information technology|information systems|infrastructure manager|technician|noc support)\b/i;

const TITLES = [
  "IT Support",
  "IT Assistant",
  "ICT Officer",
  "Help Desk",
  "Systems Administrator",
  "Desktop Technician",
  "Network Administrator",
];

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

async function fetchText(url: string) {
  const res = await fetch(url, {
    headers: {
      "user-agent": UA,
      accept: "text/html,application/xhtml+xml",
      "accept-language": "en-US,en;q=0.9",
    },
    cache: "no-store",
    signal: AbortSignal.timeout(12000),
  });
  if (!res.ok) throw new Error(`${url} ${res.status}`);
  return res.text();
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
    if (!href || !title) continue;
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
          postedAt: scannedAt,
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
    if (!href || !titleRaw) continue;
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
          postedAt: scannedAt,
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
        itemListElement?: Array<{ name?: string; url?: string }>;
      };
      if (data["@type"] !== "ItemList") continue;
      for (const item of data.itemListElement ?? []) {
        if (!item.name || !item.url || !/\/kenya\//i.test(item.url)) continue;
        jobs.push(
          makeJob(
            {
              title: item.name,
              company: "Fuzu Kenya",
              location: "Kenya",
              source: "Fuzu",
              url: item.url,
              description: `${item.name} listed on Fuzu Kenya.`,
              postedAt: scannedAt,
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
    if (!href || !title) continue;
    jobs.push(
      makeJob(
        {
          title,
          company,
          location,
          source: "LinkedIn",
          url: cleanUrl(href),
          description: `${company} · ${location}`,
          postedAt: scannedAt,
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
          postedAt: scannedAt,
          scannedAt,
        },
        keywords,
      ),
    );
  }
  return jobs;
}

const BOARD_URLS = [
  "https://www.brightermonday.co.ke/jobs?q=ICT",
  "https://www.brightermonday.co.ke/jobs?q=IT+support",
  "https://www.brightermonday.co.ke/jobs?q=IT+assistant",
  "https://www.brightermonday.co.ke/jobs?q=helpdesk",
  "https://www.brightermonday.co.ke/jobs?q=systems+administrator",
  "https://www.myjobmag.co.ke/search/jobs?q=IT+support",
  "https://www.myjobmag.co.ke/search/jobs?q=IT+assistant",
  "https://www.myjobmag.co.ke/search/jobs?q=ICT",
  "https://www.myjobmag.co.ke/search/jobs?q=helpdesk",
  "https://www.myjobmag.co.ke/jobs-by-field/it-telecoms",
  "https://www.fuzu.com/kenya/jobs?q=ICT",
];

function linkedInUrls() {
  return TITLES.map(
    (title) =>
      `https://www.linkedin.com/jobs/search?keywords=${encodeURIComponent(title)}&location=${encodeURIComponent("Kenya")}&f_TPR=r2592000`,
  );
}

function ddgUrls() {
  return TITLES.map(
    (title) =>
      `https://html.duckduckgo.com/html/?q=${encodeURIComponent(`${title} jobs Nairobi Kenya (LinkedIn OR careers OR greenhouse)`)}`,
  );
}

export async function collectJobs(keywords: string): Promise<Job[]> {
  const scannedAt = new Date().toISOString();
  const found: Job[] = [];
  const urls = [...BOARD_URLS, ...linkedInUrls(), ...ddgUrls()];
  const pages = await Promise.allSettled(urls.map((url) => fetchText(url)));

  pages.forEach((result, i) => {
    if (result.status !== "fulfilled") return;
    const url = urls[i];
    const html = result.value;
    try {
      if (url.includes("brightermonday")) found.push(...parseBrighterMonday(html, scannedAt, keywords));
      else if (url.includes("myjobmag")) found.push(...parseMyJobMag(html, scannedAt, keywords));
      else if (url.includes("fuzu")) found.push(...parseFuzu(html, scannedAt, keywords));
      else if (url.includes("linkedin.com/jobs")) found.push(...parseLinkedIn(html, scannedAt, keywords));
      else if (url.includes("duckduckgo.com")) found.push(...parseDuckDuckGo(html, scannedAt, keywords));
    } catch {
      // one source failing should not kill the scan
    }
  });

  const byId = new Map<string, Job>();
  for (const job of found) {
    if (!IT_HINT.test(job.title)) continue;
    if (!isKenyaJob(job)) continue;
    const prev = byId.get(job.id);
    if (!prev || job.score > prev.score) byId.set(job.id, job);
  }

  return [...byId.values()].sort((a, b) => b.score - a.score);
}
