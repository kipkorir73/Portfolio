import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import type { Store } from "./types";

const DATA_DIR =
  process.env.NODE_ENV === "production" || process.env.NETLIFY
    ? join("/tmp", "apply-desk")
    : join(process.cwd(), "data");
const FILE = join(DATA_DIR, "store.json");

let memory: Store | null = null;

function seed(): Store {
  return {
    settings: {
      autoApplyEmail: false,
      dailyCap: 6,
      minScore: 22,
      keywords: "IT support, helpdesk, systems administrator, network, Nairobi, ICT",
      emailConnected: false,
      connectedEmail: null,
      lastScanAt: null,
      lastApplyAt: null,
    },
    jobs: [],
    applications: [],
    inbox: [],
  };
}

export function readStore(): Store {
  if (memory) return memory;
  try {
    if (existsSync(FILE)) {
      memory = JSON.parse(readFileSync(FILE, "utf8")) as Store;
      return memory;
    }
  } catch {
    // fall through to seed
  }
  const initial = seed();
  writeStore(initial);
  return initial;
}

export function writeStore(store: Store) {
  memory = store;
  try {
    mkdirSync(DATA_DIR, { recursive: true });
    writeFileSync(FILE, JSON.stringify(store, null, 2));
  } catch {
    // Netlify functions can be read-only outside /tmp; memory still works for this instance.
  }
}

export function mutateStore(fn: (store: Store) => void): Store {
  const store = readStore();
  fn(store);
  writeStore(store);
  return store;
}
