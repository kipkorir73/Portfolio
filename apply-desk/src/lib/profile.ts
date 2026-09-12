export const PROFILE = {
  name: "Collins Kipkorir",
  title: "IT Assistant | IT Support & Systems Administration",
  location: "Nairobi, Kenya",
  email: "kipkorirc583@gmail.com",
  phone: "+254 743 175 915",
  linkedin: "https://linkedin.com/in/collins-73kipkorir",
  github: "https://github.com/kipkorir73",
  cvPath: "/Collins_Kipkorir_IT_Assistant_CV.pdf",
  summary:
    "Electronics and Computer Engineering graduate with close to 3 years of hands-on IT support: first-line hardware and software troubleshooting, network administration, user accounts, and day-to-day ICT operations. Currently IT Assistant at Barsiele Sunrise Academy (Jan 2025–present).",
  experience: [
    {
      role: "IT Assistant, Bursar & Admissions Coordinator",
      org: "Barsiele Sunrise Academy",
      when: "Jan 2025 – Present",
    },
    {
      role: "Wi-Fi Network Operator",
      org: "Campus Wi-Fi business, Kirinyaga University",
      when: "2022 – 2024",
    },
  ],
  skills: [
    "First-line IT support",
    "Hardware & peripherals",
    "Windows & Linux",
    "LAN/WAN",
    "Ubiquiti",
    "MikroTik",
    "DHCP / NAT / firewall",
    "User accounts & access",
    "Biometric systems",
    "L1 ticketing",
  ],
};

export const LOGIN_EMAIL = PROFILE.email;
export const LOGIN_PASSWORD = process.env.DESK_PASSWORD ?? "sunrise-desk";

export const COVER_LETTER = `Dear Hiring Team,

I am applying for the {{title}} role at {{company}}. I am an Electronics and Computer Engineering graduate currently serving as IT Assistant at Barsiele Sunrise Academy in Nairobi (January 2025–present), covering first-line support, Windows/Linux systems, biometric attendance, user accounts, and the live school network.

Before that I built and operated a 24/7 campus Wi-Fi network for 150+ users (Ubiquiti Loco M5, LiteBeam, MikroTik), with 98% uptime and most issues closed on first contact.

I am based in Nairobi, work well with little supervision, and I am looking for IT support / systems administration work where keeping machines and people online is the job.

CV is attached. I am available for a call on +254 743 175 915.

Collins Kipkorir
${PROFILE.email}
`;
