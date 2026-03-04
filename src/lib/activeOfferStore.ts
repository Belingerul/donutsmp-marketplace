import { promises as fs } from "fs";
import path from "path";

export type ActiveOfferLink = { offerId: string; sellerToken: string };

const DATA_DIR = path.join(process.cwd(), "data");
const MAP_PATH = path.join(DATA_DIR, "active_by_user.json");

async function loadMap(): Promise<Record<string, ActiveOfferLink>> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    const raw = await fs.readFile(MAP_PATH, "utf8");
    const j = JSON.parse(raw) as Record<string, ActiveOfferLink>;
    return j && typeof j === "object" ? j : {};
  } catch {
    return {};
  }
}

async function saveMap(m: Record<string, ActiveOfferLink>) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(MAP_PATH, JSON.stringify(m, null, 2), "utf8");
}

export async function setActiveOffer(handle: string, link: ActiveOfferLink) {
  const m = await loadMap();
  m[handle] = link;
  await saveMap(m);
}

export async function getActiveOffer(handle: string): Promise<ActiveOfferLink | null> {
  const m = await loadMap();
  return m[handle] || null;
}

export async function clearActiveOffer(handle: string) {
  const m = await loadMap();
  if (m[handle]) {
    delete m[handle];
    await saveMap(m);
  }
}

export async function clearActiveOfferByOfferId(offerId: string) {
  const m = await loadMap();
  let changed = false;
  for (const [handle, link] of Object.entries(m)) {
    if (link?.offerId === offerId) {
      delete m[handle];
      changed = true;
    }
  }
  if (changed) await saveMap(m);
}
