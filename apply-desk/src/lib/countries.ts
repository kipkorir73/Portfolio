import type { Job } from "./types";

export type CountryOption = {
  code: string;
  name: string;
  region: string;
  aliases: string[];
  indeedHost: string;
  indeedLoc: string;
  careerjet?: string;
  linkedin: string;
};

function C(
  code: string,
  name: string,
  region: string,
  aliases: string[] = [],
  extra: Partial<Pick<CountryOption, "indeedHost" | "indeedLoc" | "careerjet" | "linkedin">> = {},
): CountryOption {
  return {
    code,
    name,
    region,
    aliases: [...new Set([name.toLowerCase(), ...aliases.map((a) => a.toLowerCase())])],
    indeedHost: extra.indeedHost ?? "www.indeed.com",
    indeedLoc: extra.indeedLoc ?? name,
    careerjet: extra.careerjet,
    linkedin: extra.linkedin ?? name,
  };
}

export const COUNTRIES: CountryOption[] = [
  C("worldwide", "Worldwide (all countries + remote)", "Worldwide", ["worldwide", "remote", "global"], {
    indeedLoc: "Remote",
    careerjet: "www.careerjet.com",
    linkedin: "Worldwide",
  }),

  C("dz", "Algeria", "Africa", ["algiers"]),
  C("ao", "Angola", "Africa", ["luanda"]),
  C("bj", "Benin", "Africa", ["cotonou"]),
  C("bw", "Botswana", "Africa", ["gaborone"]),
  C("bf", "Burkina Faso", "Africa", ["ouagadougou"]),
  C("bi", "Burundi", "Africa", ["bujumbura", "gitega"]),
  C("cm", "Cameroon", "Africa", ["yaounde", "yaoundé", "douala"]),
  C("cf", "Central African Republic", "Africa", ["bangui"]),
  C("cv", "Cabo Verde", "Africa", ["cape verde", "praia"]),
  C("td", "Chad", "Africa", ["n'djamena", "ndjamena"]),
  C("km", "Comoros", "Africa", ["moroni"]),
  C("cg", "Congo-Brazzaville", "Africa", ["republic of the congo", "brazzaville"]),
  C("cd", "DR Congo", "Africa", ["democratic republic of the congo", "kinshasa", "lubumbashi"]),
  C("ci", "Côte d'Ivoire", "Africa", ["ivory coast", "abidjan", "yamoussoukro"]),
  C("dj", "Djibouti", "Africa", ["djibouti city"]),
  C("eg", "Egypt", "Africa", ["cairo", "alexandria", "giza"], { indeedHost: "eg.indeed.com" }),
  C("gq", "Equatorial Guinea", "Africa", ["malabo"]),
  C("er", "Eritrea", "Africa", ["asmara"]),
  C("sz", "Eswatini", "Africa", ["swaziland", "mbabane"]),
  C("et", "Ethiopia", "Africa", ["addis ababa"]),
  C("ga", "Gabon", "Africa", ["libreville"]),
  C("gm", "Gambia", "Africa", ["banjul"]),
  C("gh", "Ghana", "Africa", ["accra", "kumasi"], { indeedHost: "gh.indeed.com" }),
  C("gn", "Guinea", "Africa", ["conakry"]),
  C("gw", "Guinea-Bissau", "Africa", ["bissau"]),
  C("ke", "Kenya", "Africa", ["nairobi", "mombasa", "kisumu", "nakuru", "eldoret", "thika", "kiambu", "machakos", "nyeri", "kitale", "kakamega", "meru", "kisii", "malindi", "kilifi", "kajiado", "kericho", "ke.indeed", "brightermonday", "myjobmag", "fuzu"], {
    indeedHost: "ke.indeed.com",
    careerjet: "www.careerjet.co.ke",
  }),
  C("ls", "Lesotho", "Africa", ["maseru"]),
  C("lr", "Liberia", "Africa", ["monrovia"]),
  C("ly", "Libya", "Africa", ["tripoli", "benghazi"]),
  C("mg", "Madagascar", "Africa", ["antananarivo"]),
  C("mw", "Malawi", "Africa", ["lilongwe", "blantyre"]),
  C("ml", "Mali", "Africa", ["bamako"]),
  C("mr", "Mauritania", "Africa", ["nouakchott"]),
  C("mu", "Mauritius", "Africa", ["port louis"]),
  C("ma", "Morocco", "Africa", ["casablanca", "rabat", "marrakesh"], { indeedHost: "ma.indeed.com" }),
  C("mz", "Mozambique", "Africa", ["maputo"]),
  C("na", "Namibia", "Africa", ["windhoek"]),
  C("ne", "Niger", "Africa", ["niamey"]),
  C("ng", "Nigeria", "Africa", ["lagos", "abuja", "port harcourt", "ibadan", "kano"], { indeedHost: "ng.indeed.com" }),
  C("rw", "Rwanda", "Africa", ["kigali"]),
  C("st", "Sao Tome and Principe", "Africa", ["são tomé", "sao tome"]),
  C("sn", "Senegal", "Africa", ["dakar"]),
  C("sc", "Seychelles", "Africa", ["victoria"]),
  C("sl", "Sierra Leone", "Africa", ["freetown"]),
  C("so", "Somalia", "Africa", ["mogadishu", "hargeisa"]),
  C("za", "South Africa", "Africa", ["johannesburg", "cape town", "durban", "pretoria", "gauteng"], {
    indeedHost: "za.indeed.com",
    careerjet: "www.careerjet.co.za",
  }),
  C("ss", "South Sudan", "Africa", ["juba"]),
  C("sd", "Sudan", "Africa", ["khartoum"]),
  C("tz", "Tanzania", "Africa", ["dar es salaam", "arusha", "dodoma", "mwanza"]),
  C("tg", "Togo", "Africa", ["lome", "lomé"]),
  C("tn", "Tunisia", "Africa", ["tunis"]),
  C("ug", "Uganda", "Africa", ["kampala", "entebbe", "gulu"]),
  C("zm", "Zambia", "Africa", ["lusaka", "ndola"]),
  C("zw", "Zimbabwe", "Africa", ["harare", "bulawayo"]),

  C("bh", "Bahrain", "Middle East", ["manama"]),
  C("iq", "Iraq", "Middle East", ["baghdad", "erbil"]),
  C("il", "Israel", "Middle East", ["tel aviv", "jerusalem"]),
  C("jo", "Jordan", "Middle East", ["amman"]),
  C("kw", "Kuwait", "Middle East", ["kuwait city"]),
  C("lb", "Lebanon", "Middle East", ["beirut"]),
  C("om", "Oman", "Middle East", ["muscat"]),
  C("ps", "Palestine", "Middle East", ["ramallah", "gaza"]),
  C("qa", "Qatar", "Middle East", ["doha"], { indeedHost: "qa.indeed.com" }),
  C("sa", "Saudi Arabia", "Middle East", ["riyadh", "jeddah", "dammam", "neom"], { indeedHost: "sa.indeed.com" }),
  C("tr", "Turkey", "Middle East", ["istanbul", "ankara"], { indeedHost: "tr.indeed.com" }),
  C("ae", "United Arab Emirates", "Middle East", ["uae", "dubai", "abu dhabi", "sharjah", "ajman"], {
    indeedHost: "www.indeed.ae",
    linkedin: "United Arab Emirates",
  }),
  C("ye", "Yemen", "Middle East", ["sana'a", "sanaa", "aden"]),

  C("at", "Austria", "Europe", ["vienna"]),
  C("be", "Belgium", "Europe", ["brussels", "antwerp"]),
  C("bg", "Bulgaria", "Europe", ["sofia"]),
  C("hr", "Croatia", "Europe", ["zagreb"]),
  C("cz", "Czechia", "Europe", ["czech republic", "prague"]),
  C("dk", "Denmark", "Europe", ["copenhagen"]),
  C("ee", "Estonia", "Europe", ["tallinn"]),
  C("fi", "Finland", "Europe", ["helsinki"]),
  C("fr", "France", "Europe", ["paris", "lyon", "marseille"], { indeedHost: "www.indeed.fr" }),
  C("de", "Germany", "Europe", ["berlin", "munich", "hamburg", "frankfurt"], { indeedHost: "de.indeed.com" }),
  C("gr", "Greece", "Europe", ["athens"]),
  C("hu", "Hungary", "Europe", ["budapest"]),
  C("is", "Iceland", "Europe", ["reykjavik"]),
  C("ie", "Ireland", "Europe", ["dublin", "cork"], { indeedHost: "ie.indeed.com" }),
  C("it", "Italy", "Europe", ["rome", "milan"], { indeedHost: "it.indeed.com" }),
  C("lv", "Latvia", "Europe", ["riga"]),
  C("lt", "Lithuania", "Europe", ["vilnius"]),
  C("lu", "Luxembourg", "Europe", ["luxembourg city"]),
  C("mt", "Malta", "Europe", ["valletta"]),
  C("nl", "Netherlands", "Europe", ["amsterdam", "rotterdam", "holland"], { indeedHost: "nl.indeed.com" }),
  C("no", "Norway", "Europe", ["oslo"]),
  C("pl", "Poland", "Europe", ["warsaw", "krakow", "kraków"], { indeedHost: "pl.indeed.com" }),
  C("pt", "Portugal", "Europe", ["lisbon", "porto"]),
  C("ro", "Romania", "Europe", ["bucharest"]),
  C("rs", "Serbia", "Europe", ["belgrade"]),
  C("sk", "Slovakia", "Europe", ["bratislava"]),
  C("si", "Slovenia", "Europe", ["ljubljana"]),
  C("es", "Spain", "Europe", ["madrid", "barcelona"], { indeedHost: "es.indeed.com" }),
  C("se", "Sweden", "Europe", ["stockholm"], { indeedHost: "se.indeed.com" }),
  C("ch", "Switzerland", "Europe", ["zurich", "geneva"]),
  C("al", "Albania", "Europe", ["tirana"]),
  C("am", "Armenia", "Europe", ["yerevan"]),
  C("ba", "Bosnia and Herzegovina", "Europe", ["sarajevo"]),
  C("cy", "Cyprus", "Europe", ["nicosia", "limassol"]),
  C("ge", "Georgia", "Europe", ["tbilisi"]),
  C("xk", "Kosovo", "Europe", ["pristina", "prishtina"]),
  C("md", "Moldova", "Europe", ["chisinau"]),
  C("me", "Montenegro", "Europe", ["podgorica"]),
  C("mk", "North Macedonia", "Europe", ["skopje"]),
  C("ua", "Ukraine", "Europe", ["kyiv", "kiev"]),
  C("gb", "United Kingdom", "Europe", ["uk", "england", "scotland", "wales", "london", "manchester", "birmingham", "indeed.co.uk"], {
    indeedHost: "www.indeed.co.uk",
    careerjet: "www.careerjet.co.uk",
    linkedin: "United Kingdom",
  }),

  C("ar", "Argentina", "Americas", ["buenos aires"]),
  C("bo", "Bolivia", "Americas", ["la paz"]),
  C("br", "Brazil", "Americas", ["são paulo", "sao paulo", "rio de janeiro"], { indeedHost: "www.indeed.com.br" }),
  C("ca", "Canada", "Americas", ["toronto", "vancouver", "montreal", "ottawa", "calgary"], { indeedHost: "ca.indeed.com" }),
  C("cl", "Chile", "Americas", ["santiago"]),
  C("co", "Colombia", "Americas", ["bogota", "bogotá", "medellin"]),
  C("cr", "Costa Rica", "Americas", ["san jose"]),
  C("do", "Dominican Republic", "Americas", ["santo domingo"]),
  C("ec", "Ecuador", "Americas", ["quito", "guayaquil"]),
  C("gt", "Guatemala", "Americas", ["guatemala city"]),
  C("sv", "El Salvador", "Americas", ["san salvador"]),
  C("hn", "Honduras", "Americas", ["tegucigalpa"]),
  C("ht", "Haiti", "Americas", ["port-au-prince"]),
  C("jm", "Jamaica", "Americas", ["kingston"]),
  C("ni", "Nicaragua", "Americas", ["managua"]),
  C("py", "Paraguay", "Americas", ["asuncion", "asunción"]),
  C("mx", "Mexico", "Americas", ["mexico city", "guadalajara", "monterrey"], { indeedHost: "mx.indeed.com" }),
  C("pa", "Panama", "Americas", ["panama city"]),
  C("pe", "Peru", "Americas", ["lima"]),
  C("pr", "Puerto Rico", "Americas", ["san juan"]),
  C("tt", "Trinidad and Tobago", "Americas", ["port of spain"]),
  C("us", "United States", "Americas", ["usa", "united states of america", "new york", "california", "texas", "florida", "illinois", "washington", "remote - us"], {
    indeedHost: "www.indeed.com",
    linkedin: "United States",
  }),
  C("uy", "Uruguay", "Americas", ["montevideo"]),
  C("ve", "Venezuela", "Americas", ["caracas"]),

  C("af", "Afghanistan", "Asia-Pacific", ["kabul"]),
  C("au", "Australia", "Asia-Pacific", ["sydney", "melbourne", "brisbane", "perth"], {
    indeedHost: "au.indeed.com",
    careerjet: "www.careerjet.com.au",
  }),
  C("bd", "Bangladesh", "Asia-Pacific", ["dhaka"]),
  C("kh", "Cambodia", "Asia-Pacific", ["phnom penh"]),
  C("cn", "China", "Asia-Pacific", ["beijing", "shanghai", "shenzhen"]),
  C("hk", "Hong Kong", "Asia-Pacific", ["hong kong sar"]),
  C("in", "India", "Asia-Pacific", ["bengaluru", "bangalore", "hyderabad", "mumbai", "delhi", "chennai", "pune", "noida"], { indeedHost: "in.indeed.com" }),
  C("id", "Indonesia", "Asia-Pacific", ["jakarta", "surabaya"], { indeedHost: "id.indeed.com" }),
  C("jp", "Japan", "Asia-Pacific", ["tokyo", "osaka"], { indeedHost: "jp.indeed.com" }),
  C("kz", "Kazakhstan", "Asia-Pacific", ["almaty", "astana"]),
  C("kr", "South Korea", "Asia-Pacific", ["seoul", "korea"]),
  C("la", "Laos", "Asia-Pacific", ["vientiane"]),
  C("mn", "Mongolia", "Asia-Pacific", ["ulaanbaatar"]),
  C("fj", "Fiji", "Asia-Pacific", ["suva"]),
  C("pg", "Papua New Guinea", "Asia-Pacific", ["port moresby"]),
  C("my", "Malaysia", "Asia-Pacific", ["kuala lumpur", "penang"], { indeedHost: "my.indeed.com" }),
  C("mm", "Myanmar", "Asia-Pacific", ["yangon", "naypyidaw"]),
  C("np", "Nepal", "Asia-Pacific", ["kathmandu"]),
  C("nz", "New Zealand", "Asia-Pacific", ["auckland", "wellington"], { indeedHost: "nz.indeed.com" }),
  C("pk", "Pakistan", "Asia-Pacific", ["karachi", "lahore", "islamabad"]),
  C("ph", "Philippines", "Asia-Pacific", ["manila", "cebu", "quezon city"], { indeedHost: "ph.indeed.com" }),
  C("sg", "Singapore", "Asia-Pacific", ["singapore"]),
  C("lk", "Sri Lanka", "Asia-Pacific", ["colombo"]),
  C("tw", "Taiwan", "Asia-Pacific", ["taipei"]),
  C("th", "Thailand", "Asia-Pacific", ["bangkok"]),
  C("uz", "Uzbekistan", "Asia-Pacific", ["tashkent"]),
  C("vn", "Vietnam", "Asia-Pacific", ["hanoi", "ho chi minh", "saigon"]),
];

export const COUNTRY_REGIONS = ["Worldwide", "Africa", "Middle East", "Europe", "Americas", "Asia-Pacific"];

export function countryLabel(code: string | null | undefined) {
  return COUNTRIES.find((c) => c.code === code)?.name ?? "Worldwide (all countries + remote)";
}

export function jobMatchesCountry(
  job: Pick<Job, "location" | "url" | "source" | "title" | "description" | "tags">,
  country: string,
) {
  if (!country || country === "worldwide") return true;
  const spec = COUNTRIES.find((c) => c.code === country);
  if (!spec) return true;
  const blob = `${job.location} ${job.url} ${job.source} ${job.title} ${job.description} ${job.tags.join(" ")}`.toLowerCase();
  if (/\b(remote|worldwide|anywhere|work from home|distributed|global|hiring worldwide)\b/i.test(blob)) return true;
  return spec.aliases.some((alias) => blob.includes(alias));
}

/** LinkedIn / Indeed `location` or `l` query: where the employer is hiring. */
export function hiringLocationFromUrl(url: string) {
  try {
    const params = new URL(url).searchParams;
    return (params.get("location") || params.get("l") || "").trim();
  } catch {
    return "";
  }
}

export function countryNameFromHost(url: string) {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "").toLowerCase();
    const spec = COUNTRIES.find((c) => {
      if (c.code === "worldwide") return false;
      const indeed = c.indeedHost.replace(/^www\./, "").toLowerCase();
      if (indeed && host === indeed) return true;
      const jet = c.careerjet?.replace(/^www\./, "").toLowerCase();
      return Boolean(jet && host === jet);
    });
    return spec?.name ?? null;
  } catch {
    return null;
  }
}

function linkedinJobsUrl(keywords: string, location: string, remote = false) {
  const params = new URLSearchParams({
    keywords,
    location,
    f_TPR: "r604800",
    origin: "JOB_SEARCH_PAGE_JOB_FILTER",
  });
  if (remote) params.set("f_WT", "2");
  return `https://www.linkedin.com/jobs/search?${params.toString()}`;
}

function titleCasePlace(value: string) {
  return value
    .split(/[\s-]+/)
    .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : part))
    .join(" ");
}

function cityAliases(spec: CountryOption) {
  const skip =
    /indeed|brightermonday|myjobmag|fuzu|careerjet|\.|united states of america|remote - us|ivory coast|cape verde|czech republic/;
  const name = spec.name.toLowerCase();
  return spec.aliases.filter((alias) => {
    if (skip.test(alias) || alias === name) return false;
    if (["uae", "uk", "usa", "korea", "holland"].includes(alias)) return false;
    return alias.length >= 4;
  });
}

function linkedinHiringPlaces(spec: CountryOption) {
  const cities = cityAliases(spec)
    .slice(0, 2)
    .map((city) => `${titleCasePlace(city)}, ${spec.linkedin}`);
  return [...new Set([spec.linkedin, ...cities])];
}

const WORLD_LINKEDIN_PLACES = [
  "Worldwide",
  "Kenya",
  "Nairobi, Kenya",
  "Nigeria",
  "Lagos, Nigeria",
  "Ghana",
  "South Africa",
  "Egypt",
  "Ethiopia",
  "Tanzania",
  "Uganda",
  "Rwanda",
  "Morocco",
  "United Arab Emirates",
  "Dubai, United Arab Emirates",
  "Saudi Arabia",
  "United Kingdom",
  "Germany",
  "Ireland",
  "Netherlands",
  "United States",
  "Canada",
  "India",
  "Philippines",
  "Singapore",
  "Australia",
];

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
  ...WORLD_LINKEDIN_PLACES.map((place) =>
    linkedinJobsUrl("IT Support", place, place === "Worldwide"),
  ),
  linkedinJobsUrl("Help Desk", "Worldwide", true),
  linkedinJobsUrl("Office Assistant", "Worldwide", true),
  "https://www.brightermonday.co.ke/jobs?q=IT+support",
  "https://www.myjobmag.co.ke/jobs-by-field/it-telecoms",
  "https://www.fuzu.com/kenya/jobs?q=ICT",
  "https://html.duckduckgo.com/html/?q=IT%20support%20OR%20helpdesk%20jobs%20hiring%20location",
];

const REMOTE_RSS = [
  "https://weworkremotely.com/categories/remote-customer-support-jobs.rss",
  "https://weworkremotely.com/categories/remote-programming-jobs.rss",
  "https://remoteok.com/remote-jobs.rss",
];

const QUERIES = ["IT+support", "help+desk", "office+assistant", "data+entry", "customer+service"];

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
  const places = linkedinHiringPlaces(spec);
  const html = [
    ...places.map((place) => linkedinJobsUrl("IT Support", place, false)),
    linkedinJobsUrl("Help Desk", spec.linkedin, false),
    linkedinJobsUrl("Office Assistant", spec.linkedin, false),
    linkedinJobsUrl("IT Support", spec.linkedin, true),
    `https://html.duckduckgo.com/html/?q=${encodeURIComponent(`${spec.name} IT support OR helpdesk OR office assistant jobs site:linkedin.com`)}`,
  ];
  if (country === "ke") {
    html.push(
      "https://www.brightermonday.co.ke/jobs?q=IT+support",
      "https://www.brightermonday.co.ke/jobs?q=office+assistant",
      "https://www.myjobmag.co.ke/jobs-by-field/it-telecoms",
      "https://www.myjobmag.co.ke/jobs-by-field/admin",
      "https://www.fuzu.com/kenya/jobs?q=ICT",
    );
  }
  return { json: JSON_URLS, rss, html };
}
