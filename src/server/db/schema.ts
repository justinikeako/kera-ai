import { relations } from "drizzle-orm";
import {
  boolean,
  datetime,
  mysqlTable,
  mysqlTableCreator,
  text,
  timestamp,
  int,
  double,
  varchar,
} from "drizzle-orm/mysql-core";

export const createTable = mysqlTableCreator((name) => `kera-ai_${name}`);

// ─── scans ─────────────────────────────────────────────────────────────────
export const scans = createTable("scans", {
  id: int("id").primaryKey().autoincrement(),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => user.id),
  createdAt: datetime("created_at"),
  // Classification results
  hairType: varchar("hair_type", { length: 10 }), // 3A / 3B / 3C / 4A / 4B / 4C
  porosity: varchar("porosity", { length: 20 }),
  texture: varchar("texture", { length: 20 }),
  curlPattern: varchar("curl_pattern", { length: 100 }),
  scalpScore: int("scalp_score"), // 1–10
  scalpCondition: varchar("scalp_condition", { length: 50 }),
  scalpObservations: text("scalp_observations"),
  // Raw AI response stored for debugging
  rawGptResponse: text("raw_gpt_response"),
  mlModelPrediction: varchar("ml_model_prediction", { length: 10 }), // What the CNN predicted
  mlConfidence: double("ml_confidence"),
  // Image reference (store path or Azure Blob URL)
  imageUrl: varchar("image_url", { length: 500 }),
});

// ─── sellers ───────────────────────────────────────────────────────────────
export const sellers = createTable("sellers", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  location: varchar("location", { length: 255 }), // Kingston / MoBay / Spanish Town / Online
  instagramUrl: varchar("instagram_url", { length: 500 }),
  websiteUrl: varchar("website_url", { length: 500 }),
  phone: varchar("phone", { length: 50 }),
  verified: boolean("verified").default(false),
  createdAt: datetime("created_at"),
});

// ─── products ──────────────────────────────────────────────────────────────
export const products = createTable("products", {
  id: int("id").primaryKey().autoincrement(),
  sellerId: int("seller_id").references(() => sellers.id),
  name: varchar("name", { length: 255 }).notNull(),
  brand: varchar("brand", { length: 255 }),
  category: varchar("category", { length: 100 }), // Shampoo / Conditioner / Oil / Styler
  suitableHairTypes: varchar("suitable_hair_types", { length: 100 }), // "4A,4B,4C"
  suitablePorosity: varchar("suitable_porosity", { length: 50 }), // "Low,Medium"
  avoidHairTypes: varchar("avoid_hair_types", { length: 100 }),
  priceJmd: double("price_jmd"),
  inStock: boolean("in_stock").default(true),
  amazonUrl: varchar("amazon_url", { length: 500 }),
  localAvailable: boolean("local_available").default(false),
  createdAt: datetime("created_at"),
  updatedAt: datetime("updated_at"),
});

export const user = mysqlTable("users", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: text("name").notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: boolean("email_verified")
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),

  // Stored hair profile (populated after first scan)
  hairType: varchar("hair_type", { length: 10 }), // e.g. "4B"
  porosity: varchar("porosity", { length: 20 }), // Low / Medium / High
  scalpCondition: varchar("scalp_condition", { length: 50 }), // Dry / Oily / Healthy etc.
  texture: varchar("texture", { length: 20 }), // fine / medium / coarse

  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = mysqlTable("session", {
  id: varchar("id", { length: 36 }).primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = mysqlTable("account", {
  id: varchar("id", { length: 36 }).primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = mysqlTable("verification", {
  id: varchar("id", { length: 36 }).primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").$defaultFn(
    () => /* @__PURE__ */ new Date(),
  ),
  updatedAt: timestamp("updated_at").$defaultFn(
    () => /* @__PURE__ */ new Date(),
  ),
});

export const usersRelations = relations(user, ({ many }) => ({
  accounts: many(account),
  sessions: many(session),
}));

export const accountsRelations = relations(account, ({ one }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] }),
}));

export const sessionsRelations = relations(session, ({ one }) => ({
  user: one(user, { fields: [session.userId], references: [user.id] }),
}));

export const scansRelations = relations(scans, ({ one }) => ({
  user: one(user, { fields: [scans.userId], references: [user.id] }),
}));

export const sellersRelations = relations(sellers, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one }) => ({
  seller: one(sellers, {
    fields: [products.sellerId],
    references: [sellers.id],
  }),
}));
