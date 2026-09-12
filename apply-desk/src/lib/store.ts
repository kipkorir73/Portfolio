import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import type { Store } from "./types";

const DATA_DIR =
  process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME
    ? join("/tmp", "apply-desk")
    : join(process.cwd(), "data");
const FILE = join(DATA_DIR, "store.json");

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
  if (!existsSync(FILE)) {
    const initial = seed();
    writeStore(initial);
    return initial;
  }
  const store = JSON.parse(readFileSync(FILE, "utf8")) as Store;
  let dirty = false;
  if (store.settings.autoApplyEmail) {
    store.settings.autoApplyEmail = false;
    dirty = true;
  }
  if (store.settings.minScore === 40) {
    store.settings.minScore = 22;
    dirty = true;
  }
  if (dirty) writeStore(store);
  return store;
}

export function writeStore(store: Store) {
  mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(FILE, JSON.stringify(store, null, 2));
}

export function mutateStore(fn: (store: Store) => void): Store {
  const store = readStore();
  fn(store);
  writeStore(store);
  return store;
}
