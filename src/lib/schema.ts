import { sqliteTable, text, integer, index, uniqueIndex } from "drizzle-orm/sqlite-core";

export const users = sqliteTable(
  "users",
  {
    id: text("id").primaryKey(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    handle: text("handle").notNull(),
    passwordHash: text("password_hash").notNull(),
    role: text("role").notNull().default("seller"), // seller|admin
  },
  (t) => ({
    handleUq: uniqueIndex("users_handle_uq").on(t.handle),
  })
);

export const offers = sqliteTable(
  "offers",
  {
    id: text("id").primaryKey(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),

    sellerId: text("seller_id").notNull().references(() => users.id),
    status: text("status").notNull().default("submitted"), // submitted|accepted|rejected|paid|deleted

    // seller payload
    payoutChain: text("payout_chain").notNull(), // solana|ethereum
    payoutAddr: text("payout_addr").notNull(),
    amountM: integer("amount_m").notNull(),
    priceUsdCents: integer("price_usd_cents").notNull(),

    // chat access
    sellerToken: text("seller_token").notNull(),
  },
  (t) => ({
    sellerIdx: index("offers_seller_idx").on(t.sellerId),
    addrIdx: index("offers_payout_addr_idx").on(t.payoutAddr),
  })
);

export const messages = sqliteTable(
  "messages",
  {
    id: text("id").primaryKey(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    offerId: text("offer_id").notNull().references(() => offers.id),
    from: text("from").notNull(), // seller|admin
    text: text("text").notNull(),
  },
  (t) => ({
    offerIdx: index("messages_offer_idx").on(t.offerId),
  })
);
