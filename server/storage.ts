import {
  users,
  shops,
  type User,
  type InsertUser,
  type Shop,
  type InsertShop,
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  createShop(shop: InsertShop): Promise<Shop>;
  getShop(id: number): Promise<Shop | undefined>;
  getShopByOwnerId(ownerId: number): Promise<Shop | undefined>;
  getShops(): Promise<Shop[]>;
  updateShop(id: number, shop: Partial<InsertShop>): Promise<Shop>;
  deleteShop(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // USER METHODS
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // SHOP METHODS
  async createShop(insertShop: InsertShop): Promise<Shop> {
    const [shop] = await db.insert(shops).values(insertShop).returning();
    return shop;
  }

  async getShop(id: number): Promise<Shop | undefined> {
    const [shop] = await db.select().from(shops).where(eq(shops.id, id));
    return shop;
  }

  async getShopByOwnerId(ownerId: number): Promise<Shop | undefined> {
    const [shop] = await db
      .select()
      .from(shops)
      .where(eq(shops.ownerId, ownerId));
    return shop;
  }

  async getShops(): Promise<Shop[]> {
    return await db.select().from(shops);
  }

  // ✅ FIX 1: Robust Update (Crash Proof)
  async updateShop(id: number, shopData: Partial<InsertShop>): Promise<Shop> {
    const [shop] = await db
      .update(shops)
      .set(shopData)
      .where(eq(shops.id, id))
      .returning();

    if (!shop) {
      throw new Error("Shop not found");
    }

    return shop;
  }

  // ✅ FIX 2: Safe Delete (Confirmation)
  async deleteShop(id: number): Promise<void> {
    // Hum 'returning()' use kar rahe hain taaki pata chale kuch delete hua ya nahi
    const [deleted] = await db
      .delete(shops)
      .where(eq(shops.id, id))
      .returning();

    if (!deleted) {
      throw new Error("Shop not found or already deleted");
    }
  }
}

export const storage = new DatabaseStorage();
