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

/* ===================== USERS ===================== */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").default("customer").notNull(), // customer | seller | admin
  isAdmin: boolean("is_admin").default(false).notNull(), // Admin flag for easier checking
});

/* ===================== SHOPS ===================== */
export const shops = pgTable("shops", {
  id: serial("id").primaryKey(),
  // shop owner (seller)
  ownerId: integer("owner_id").notNull(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  description: text("description"),
  address: text("address"), // Shahdol local areas
  phone: text("phone").notNull(), // Phone number
  mobile: text("mobile").notNull(), // Keep for backward compatibility
  image: text("image"), // Cloudinary URL ke liye

  rating: doublePrecision("rating").default(0),
  reviewCount: integer("review_count").default(0),
  avgRating: doublePrecision("avg_rating").default(0),

  isFeatured: boolean("is_featured").default(false),
  approved: boolean("approved").default(true),
  isVerified: boolean("is_verified").default(false), // Admin verification

  createdAt: timestamp("created_at").defaultNow(),
});

/* ===================== PRODUCTS ===================== */
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  shopId: integer("shop_id").notNull(),
  sellerId: integer("seller_id").notNull(), // Direct reference to seller (user id)
  name: text("name").notNull(),
  price: text("price").notNull(),
  imageUrl: text("image_url"), // Cloudinary/Image upload support ke liye
  category: text("category").notNull(), // Product category
  description: text("description"),
  status: text("status").default("pending").notNull(), // pending | approved | rejected
  createdAt: timestamp("created_at").defaultNow(),
});

/* ===================== OFFERS & NEWS ===================== */
export const offers = pgTable("offers", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

/* ===================== ZOD SCHEMAS ===================== */

/* USER */
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

/* SHOP */
export const insertShopSchema = createInsertSchema(shops).omit({
  id: true,
  rating: true,
  reviewCount: true,
  avgRating: true,
  approved: true,
  isVerified: true,
  createdAt: true,
});

export type InsertShop = z.infer<typeof insertShopSchema>;
export type Shop = typeof shops.$inferSelect;

/* PRODUCT ✅ FIXED EXPORT */
export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
});

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

/* OFFER */
export const insertOfferSchema = createInsertSchema(offers).omit({
  id: true,
  createdAt: true,
});

export type InsertOffer = z.infer<typeof insertOfferSchema>;
export type Offer = typeof offers.$inferSelect;
