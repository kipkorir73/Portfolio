import type { Job } from "./types";

export type CountryOption = {
  code: string;
  name: string;
  aliases: string[];
  indeedHost: string;
  indeedLoc: string;
  careerjet?: string;
  linkedin: string;
};

export const COUNTRIES: CountryOption[] = [
  { code: "worldwide", name: "Worldwide (all countries + remote)", aliases: [], indeedHost: "www.indeed.com", indeedLoc: "Remote", careerjet: "www.careerjet.com", linkedin: "Worldwide" },
  { code: "ke", name: "Kenya", aliases: ["kenya", "nairobi", "mombasa", "kisumu", "nakuru", "eldoret", "ke.indeed", "brightermonday", "myjobmag", "fuzu", "careerjet.co.ke"], indeedHost: "ke.indeed.com", indeedLoc: "Kenya", careerjet: "www.careerjet.co.ke", linkedin: "Kenya" },
  { code: "ug", name: "Uganda", aliases: ["uganda", "kampala"], indeedHost: "www.indeed.com", indeedLoc: "Uganda", linkedin: "Uganda" },
  { code: "tz", name: "Tanzania", aliases: ["tanzania", "dar es salaam", "arusha"], indeedHost: "www.indeed.com", indeedLoc: "Tanzania", linkedin: "Tanzania" },
  { code: "rw", name: "Rwanda", aliases: ["rwanda", "kigali"], indeedHost: "www.indeed.com", indeedLoc: "Rwanda", linkedin: "Rwanda" },
  { code: "et", name: "Ethiopia", aliases: ["ethiopia", "addis ababa"], indeedHost: "www.indeed.com", indeedLoc: "Ethiopia", linkedin: "Ethiopia" },
  { code: "ng", name: "Nigeria", aliases: ["nigeria", "lagos", "abuja", "ng.indeed"], indeedHost: "ng.indeed.com", indeedLoc: "Nigeria", linkedin: "Nigeria" },
  { code: "gh", name: "Ghana", aliases: ["ghana", "accra"], indeedHost: "gh.indeed.com", indeedLoc: "Ghana", linkedin: "Ghana" },
  { code: "za", name: "South Africa", aliases: ["south africa", "johannesburg", "cape town", "za.indeed"], indeedHost: "za.indeed.com", indeedLoc: "South Africa", careerjet: "www.careerjet.co.za", linkedin: "South Africa" },
  { code: "eg", name: "Egypt", aliases: ["egypt", "cairo"], indeedHost: "eg.indeed.com", indeedLoc: "Egypt", linkedin: "Egypt" },
  { code: "ae", name: "United Arab Emirates", aliases: ["united arab emirates", "uae", "dubai", "abu dhabi", "indeed.ae"], indeedHost: "www.indeed.ae", indeedLoc: "United Arab Emirates", linkedin: "United Arab Emirates" },
  { code: "qa", name: "Qatar", aliases: ["qatar", "doha"], indeedHost: "qa.indeed.com", indeedLoc: "Qatar", linkedin: "Qatar" },
  { code: "sa", name: "Saudi Arabia", aliases: ["saudi", "riyadh", "jeddah"], indeedHost: "sa.indeed.com", indeedLoc: "Saudi Arabia", linkedin: "Saudi Arabia" },
  { code: "gb", name: "United Kingdom", aliases: ["united kingdom", "england", "london", "uk", "indeed.co.uk", "reed.co.uk"], indeedHost: "www.indeed.co.uk", indeedLoc: "United Kingdom", careerjet: "www.careerjet.co.uk", linkedin: "United Kingdom" },
  { code: "ie", name: "Ireland", aliases: ["ireland", "dublin", "ie.indeed"], indeedHost: "ie.indeed.com", indeedLoc: "Ireland", linkedin: "Ireland" },
  { code: "de", name: "Germany", aliases: ["germany", "berlin", "munich", "de.indeed"], indeedHost: "de.indeed.com", indeedLoc: "Germany", linkedin: "Germany" },
  { code: "nl", name: "Netherlands", aliases: ["netherlands", "amsterdam", "holland"], indeedHost: "nl.indeed.com", indeedLoc: "Netherlands", linkedin: "Netherlands" },
  { code: "fr", name: "France", aliases: ["france", "paris", "indeed.fr"], indeedHost: "www.indeed.fr", indeedLoc: "France", linkedin: "France" },
  { code: "es", name: "Spain", aliases: ["spain", "madrid", "barcelona"], indeedHost: "es.indeed.com", indeedLoc: "Spain", linkedin: "Spain" },
  { code: "it", name: "Italy", aliases: ["italy", "rome", "milan"], indeedHost: "it.indeed.com", indeedLoc: "Italy", linkedin: "Italy" },
  { code: "se", name: "Sweden", aliases: ["sweden", "stockholm"], indeedHost: "se.indeed.com", indeedLoc: "Sweden", linkedin: "Sweden" },
  { code: "pl", name: "Poland", aliases: ["poland", "warsaw"], indeedHost: "pl.indeed.com", indeedLoc: "Poland", linkedin: "Poland" },
  { code: "us", name: "United States", aliases: ["united states", "usa", "new york", "texas", "california", "indeed.com"], indeedHost: "www.indeed.com", indeedLoc: "United States", linkedin: "United States" },
  { code: "ca", name: "Canada", aliases: ["canada", "toronto", "vancouver", "ca.indeed"], indeedHost: "ca.indeed.com", indeedLoc: "Canada", linkedin: "Canada" },
  { code: "mx", name: "Mexico", aliases: ["mexico", "mexico city"], indeedHost: "mx.indeed.com", indeedLoc: "Mexico", linkedin: "Mexico" },
  { code: "br", name: "Brazil", aliases: ["brazil", "são paulo", "sao paulo"], indeedHost: "www.indeed.com.br", indeedLoc: "Brazil", linkedin: "Brazil" },
  { code: "in", name: "India", aliases: ["india", "bengaluru", "bangalore", "hyderabad", "in.indeed"], indeedHost: "in.indeed.com", indeedLoc: "India", linkedin: "India" },
  { code: "ph", name: "Philippines", aliases: ["philippines", "manila", "ph.indeed"], indeedHost: "ph.indeed.com", indeedLoc: "Philippines", linkedin: "Philippines" },
  { code: "sg", name: "Singapore", aliases: ["singapore"], indeedHost: "www.indeed.com", indeedLoc: "Singapore", linkedin: "Singapore" },
  { code: "my", name: "Malaysia", aliases: ["malaysia", "kuala lumpur"], indeedHost: "my.indeed.com", indeedLoc: "Malaysia", linkedin: "Malaysia" },
  { code: "id", name: "Indonesia", aliases: ["indonesia", "jakarta"], indeedHost: "id.indeed.com", indeedLoc: "Indonesia", linkedin: "Indonesia" },
  { code: "au", name: "Australia", aliases: ["australia", "sydney", "melbourne", "au.indeed"], indeedHost: "au.indeed.com", indeedLoc: "Australia", careerjet: "www.careerjet.com.au", linkedin: "Australia" },
  { code: "nz", name: "New Zealand", aliases: ["new zealand", "auckland"], indeedHost: "nz.indeed.com", indeedLoc: "New Zealand", linkedin: "New Zealand" },
  { code: "jp", name: "Japan", aliases: ["japan", "tokyo"], indeedHost: "jp.indeed.com", indeedLoc: "Japan", linkedin: "Japan" },
  { code: "pk", name: "Pakistan", aliases: ["pakistan", "karachi", "lahore"], indeedHost: "www.indeed.com", indeedLoc: "Pakistan", linkedin: "Pakistan" },
  { code: "bd", name: "Bangladesh", aliases: ["bangladesh", "dhaka"], indeedHost: "www.indeed.com", indeedLoc: "Bangladesh", linkedin: "Bangladesh" },
];

export function countryLabel(code: string | null | undefined) {
  return COUNTRIES.find((c) => c.code === code)?.name ?? "Worldwide (all countries + remote)";
}

export function jobMatchesCountry(job: Pick<Job, "location" | "url" | "source" | "title" | "description" | "tags">, country: string) {
  if (!country || country === "worldwide") return true;
  const spec = COUNTRIES.find((c) => c.code === country);
  if (!spec) return true;
  const blob = `${job.location} ${job.url} ${job.source} ${job.title} ${job.description} ${job.tags.join(" ")}`.toLowerCase();
  if (/\b(remote|worldwide|anywhere|work from home|distributed|global)\b/i.test(blob)) return true;
  return spec.aliases.some((alias) => blob.includes(alias.toLowerCase()));
}

const QUERIES = ["IT+support", "help+desk", "office+assistant", "data+entry", "customer+service"];

const JSON_URLS = [
  "https://remoteok.com/api",
  "https://remotive.com/api/remote-jobs?search=IT%20support",
  "https://remotive.com/api/remote-jobs?category=customer-support",
  "https://jobicy.com/api/v2/remote-jobs?count=50",
  "https://www.arbeitnow.com/api/job-board-api",
  "https://himalayas.app/jobs/api?limit=40",
  "https://www.workingnomads.com/jobsapi.json",
];

const WORLD_RSS = [
  "https://www.indeed.com/rss?q=IT+support&l=Remote",
  "https://www.indeed.co.uk/rss?q=IT+support&l=Remote",
  "https://ca.indeed.com/rss?q=help+desk&l=Remote",
  "https://au.indeed.com/rss?q=IT+support",
  "https://in.indeed.com/rss?q=IT+support",
  "https://za.indeed.com/rss?q=IT+support",
  "https://ng.indeed.com/rss?q=IT+support",
  "https://ke.indeed.com/rss?q=IT+support&l=Kenya",
  "https://ke.indeed.com/rss?q=office+assistant&l=Kenya",
  "https://www.indeed.ae/rss?q=IT+support",
  "https://ph.indeed.com/rss?q=customer+service",
  "https://www.careerjet.com/search/rss?s=IT+support&l=Remote",
  "https://www.careerjet.co.uk/search/rss?s=help+desk&l=Remote",
  "https://www.careerjet.co.ke/search/rss?s=IT+support&l=Kenya",
  "https://weworkremotely.com/categories/remote-customer-support-jobs.rss",
  "https://weworkremotely.com/categories/remote-programming-jobs.rss",
  "https://remoteok.com/remote-jobs.rss",
];

const WORLD_HTML = [
  "https://www.brightermonday.co.ke/jobs?q=IT+support",
  "https://www.brightermonday.co.ke/jobs?q=office+assistant",
  "https://www.myjobmag.co.ke/jobs-by-field/it-telecoms",
  "https://www.myjobmag.co.ke/jobs-by-field/admin",
  "https://www.fuzu.com/kenya/jobs?q=ICT",
  "https://www.linkedin.com/jobs/search?keywords=IT%20Support&location=Worldwide&f_TPR=r604800&f_WT=2",
  "https://html.duckduckgo.com/html/?q=remote%20IT%20support%20OR%20helpdesk%20OR%20office%20assistant%20jobs",
];

const REMOTE_RSS = [
  "https://weworkremotely.com/categories/remote-customer-support-jobs.rss",
  "https://weworkremotely.com/categories/remote-programming-jobs.rss",
  "https://remoteok.com/remote-jobs.rss",
];

export function urlsForCountry(country: string) {
  if (!country || country === "worldwide") {
    return { json: JSON_URLS, rss: WORLD_RSS, html: WORLD_HTML };
  }
  const spec = COUNTRIES.find((c) => c.code === country) ?? COUNTRIES[0];
  const rss = QUERIES.map(
    (q) => `https://${spec.indeedHost}/rss?q=${q}&l=${encodeURIComponent(spec.indeedLoc)}`,
  );
  if (spec.careerjet) {
    rss.push(`https://${spec.careerjet}/search/rss?s=IT+support&l=${encodeURIComponent(spec.linkedin)}`);
  }
  rss.push(...REMOTE_RSS);
  const html = [
    `https://www.linkedin.com/jobs/search?keywords=${encodeURIComponent("IT Support")}&location=${encodeURIComponent(spec.linkedin)}&f_TPR=r604800`,
    `https://html.duckduckgo.com/html/?q=${encodeURIComponent(`${spec.name} IT support OR helpdesk OR office assistant jobs`)}`,
  ];
  if (country === "ke") {
    html.unshift(
      "https://www.brightermonday.co.ke/jobs?q=IT+support",
      "https://www.brightermonday.co.ke/jobs?q=office+assistant",
      "https://www.myjobmag.co.ke/jobs-by-field/it-telecoms",
      "https://www.myjobmag.co.ke/jobs-by-field/admin",
      "https://www.fuzu.com/kenya/jobs?q=ICT",
    );
  }
  return { json: JSON_URLS, rss, html };
}
