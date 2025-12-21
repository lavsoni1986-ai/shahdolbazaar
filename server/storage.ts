import {
  users,
  shops,
  type User,
  type InsertUser,
  type Shop,
  type InsertShop,
} from "@shared/schema";
import { db } from "./db"; // Database connection
import { eq } from "drizzle-orm";

// 1. INTERFACE UPDATE (Ye batata hai ki kya-kya functions hone chahiye)
export interface IStorage {
  // User Methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Shop Methods
  getShops(): Promise<Shop[]>;
  getShop(id: number): Promise<Shop | undefined>;
  createShop(shop: InsertShop): Promise<Shop>;

  // ✅ YE 2 METHODS MISSING THE (Ab jod diye hain)
  getShopByOwnerId(ownerId: number): Promise<Shop | undefined>;
  updateShop(id: number, shop: Partial<InsertShop>): Promise<Shop>;
}

// 2. IMPLEMENTATION (Asli Logic)
export class DatabaseStorage implements IStorage {
  // --- USER LOGIC ---
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

  // --- SHOP LOGIC ---
  async getShops(): Promise<Shop[]> {
    return await db.select().from(shops).orderBy(shops.id);
  }

  async getShop(id: number): Promise<Shop | undefined> {
    const [shop] = await db.select().from(shops).where(eq(shops.id, id));
    return shop;
  }

  async createShop(insertShop: InsertShop): Promise<Shop> {
    const [shop] = await db.insert(shops).values(insertShop).returning();
    return shop;
  }

  // ✅ MISSING FUNCTION 1: User ID se Dukan dhoondna
  async getShopByOwnerId(ownerId: number): Promise<Shop | undefined> {
    const [shop] = await db
      .select()
      .from(shops)
      .where(eq(shops.ownerId, ownerId));
    return shop;
  }

  // ✅ MISSING FUNCTION 2: Dukan Update karna
  async updateShop(id: number, shopData: Partial<InsertShop>): Promise<Shop> {
    const [updatedShop] = await db
      .update(shops)
      .set(shopData)
      .where(eq(shops.id, id))
      .returning();
    return updatedShop;
  }
}

// Export Instance
export const storage = new DatabaseStorage();
