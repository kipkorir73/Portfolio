import { statsFrom } from "./stats";
import { readStore } from "./store";

export function getDeskPayload() {
  const store = readStore();
  return { store, stats: statsFrom(store) };
}
