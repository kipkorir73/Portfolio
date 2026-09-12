import { statsFrom } from "./stats";
import { readGmailAuth, readStore } from "./store";

export async function getDeskPayload() {
  const store = await readStore();
  const auth = await readGmailAuth();
  if (auth?.email && !store.settings.emailConnected) {
    store.settings.emailConnected = true;
    store.settings.connectedEmail = auth.email;
  }
  return {
    store,
    stats: statsFrom(store),
    gmailReady: true,
  };
}
