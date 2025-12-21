import {
  pgTable,
  text,
  serial,
  integer,
  boolean,
  timestamp,
  doublePrecision,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// --- USERS TABLE ---
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").default("partner").notNull(), // 'admin' or 'partner'
});

// --- SHOPS TABLE ---
export const shops = pgTable("shops", {
  id: serial("id").primaryKey(),
  // ✅ NEW: Ye batayega ki dukan ka maalik kaun hai
  ownerId: integer("owner_id"),

  name: text("name").notNull(),
  category: text("category").notNull(),
  description: text("description"),
  address: text("address"),
  mobile: text("mobile").notNull(),
  image: text("image"),

  rating: doublePrecision("rating").default(0),
  reviewCount: integer("review_count").default(0),
  avgRating: doublePrecision("avg_rating").default(0),

  isFeatured: boolean("is_featured").default(false),
  approved: boolean("approved").default(true),
});

// --- SCHEMAS (Validation ke liye) ---

// ✅ FIX: .omit({ id: true }) joda gaya.
// Ab Zod validation ID nahi mangega (kyunki database wo khud banata hai)
export const insertUserSchema = createInsertSchema(users).omit({ id: true });

export const insertShopSchema = createInsertSchema(shops).omit({
  id: true,
  rating: true,
  reviewCount: true,
  avgRating: true,
  approved: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertShop = z.infer<typeof insertShopSchema>;
export type Shop = typeof shops.$inferSelect;
