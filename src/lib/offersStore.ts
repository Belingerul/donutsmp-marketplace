import { promises as fs } from "fs";
import path from "path";

export type OfferStatus = "submitted" | "rejected";

export type OfferRow = {
  id: string;
  sellerToken: string; // secret link token for seller chat

  createdAt: string;
  updatedAt: string;
  status: OfferStatus;

  // simplified seller payload
  description: string;
  priceUsd: number;

  payoutChain: "solana" | "ethereum";
  payoutAddr: string;

  // admin-only notes (internal)
  adminNote?: string | null;
};

const DATA_DIR = path.join(process.cwd(), "data");
const OFFERS_JSON = path.join(DATA_DIR, "offers.json");
const OFFERS_JSONL = path.join(DATA_DIR, "offers.jsonl");

async function fileExists(p: string) {
  try {
    await fs.stat(p);
    return true;
  } catch {
    return false;
  }
}

export async function loadOffers(): Promise<OfferRow[]> {
  await fs.mkdir(DATA_DIR, { recursive: true });

  // Preferred format: JSON array
  if (await fileExists(OFFERS_JSON)) {
    const raw = await fs.readFile(OFFERS_JSON, "utf8");
    const arr = JSON.parse(raw) as OfferRow[];
    return Array.isArray(arr) ? arr : [];
  }

  // Back-compat: jsonl (append-only). Convert once.
  if (await fileExists(OFFERS_JSONL)) {
    const raw = await fs.readFile(OFFERS_JSONL, "utf8");
    const rows = raw
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => JSON.parse(l) as Record<string, unknown>);

    const now = new Date().toISOString();
    const offers: OfferRow[] = rows
      .filter((r) => typeof r.id === "string")
      .map((r) => {
        const statusRaw = r.status;
        const status: OfferStatus =
          statusRaw === "rejected" ||
          statusRaw === "submitted"
            ? statusRaw
            : "submitted";

        const chainRaw = r.payoutChain;
        const payoutChain: "solana" | "ethereum" =
          chainRaw === "ethereum" ? "ethereum" : "solana";

        const legacyDesc = [
          typeof r.itemName === "string" ? String(r.itemName) : "",
          typeof r.amount === "string" ? String(r.amount) : "",
          typeof r.game === "string" ? String(r.game) : "",
        ]
          .filter(Boolean)
          .join(" • ");

        return {
          id: String(r.id),
          sellerToken: typeof r.sellerToken === "string" ? r.sellerToken : "",
          createdAt: typeof r.createdAt === "string" ? r.createdAt : now,
          updatedAt: typeof r.updatedAt === "string" ? r.updatedAt : (typeof r.createdAt === "string" ? r.createdAt : now),
          status,
          description:
            typeof r.description === "string" && r.description.trim()
              ? String(r.description)
              : legacyDesc || "(legacy offer)",
          priceUsd: typeof r.priceUsd === "number" ? r.priceUsd : Number(r.priceUsd || 0),
          payoutChain,
          payoutAddr: typeof r.payoutAddr === "string" ? r.payoutAddr : "",
          adminNote: typeof r.adminNote === "string" ? r.adminNote : null,
        };
      });

    await saveOffers(offers);
    return offers;
  }

  return [];
}

export async function saveOffers(offers: OfferRow[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(OFFERS_JSON, JSON.stringify(offers, null, 2), "utf8");
}

export async function addOffer(offer: OfferRow): Promise<void> {
  const offers = await loadOffers();
  offers.push(offer);
  await saveOffers(offers);
}

export async function findActiveOfferByPayoutAddr(payoutAddr: string): Promise<OfferRow | null> {
  const offers = await loadOffers();
  const found = offers.find((o) => o.payoutAddr === payoutAddr);
  return found || null;
}

export async function getOffer(id: string): Promise<OfferRow | null> {
  const offers = await loadOffers();
  return offers.find((o) => o.id === id) || null;
}

export async function updateOffer(
  id: string,
  patch: Partial<Pick<OfferRow, "status" | "adminNote">>
): Promise<OfferRow | null> {
  const offers = await loadOffers();
  const idx = offers.findIndex((o) => o.id === id);
  if (idx === -1) return null;

  const cur = offers[idx];
  const next: OfferRow = {
    ...cur,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  offers[idx] = next;
  await saveOffers(offers);
  return next;
}

export async function deleteOffer(id: string): Promise<boolean> {
  const offers = await loadOffers();
  const before = offers.length;
  const after = offers.filter((o) => o.id !== id);
  if (after.length === before) return false;
  await saveOffers(after);
  return true;
}
