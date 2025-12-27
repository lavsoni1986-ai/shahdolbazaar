import {
  users,
  shops,
  products,
  offers,
  type User,
  type InsertUser,
  type Shop,
  type InsertShop,
  type Product,
  type InsertProduct,
  type Offer,
  type InsertOffer,
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

// Yeh interface batata hai ki storage mein kaun-kaun se functions honge
export interface IStorage {
  // User functions
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, update: Partial<User>): Promise<User>;

  // Shop functions
  getShops(): Promise<Shop[]>;
  getShop(id: number): Promise<Shop | undefined>;
  getShopByOwnerId(ownerId: number): Promise<Shop | undefined>;
  createShop(shop: InsertShop): Promise<Shop>;
  updateShop(id: number, shop: Partial<InsertShop>): Promise<Shop>;
  deleteShop(id: number): Promise<void>;

  // Product functions (Naye Functions 🔥)
  getProductsByShopId(shopId: number): Promise<Product[]>;
  getAllProducts(): Promise<Product[]>; // Get all products from approved shops
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, update: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: number): Promise<void>;

  // Offer functions
  getOffers(): Promise<Offer[]>;
  getOffer(id: number): Promise<Offer | undefined>;
  createOffer(offer: InsertOffer): Promise<Offer>;
  updateOffer(id: number, update: Partial<InsertOffer>): Promise<Offer>;
  deleteOffer(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, update: Partial<User>): Promise<User> {
    const [user] = await db.update(users).set(update).where(eq(users.id, id)).returning();
    return user;
  }

  async getShops(): Promise<Shop[]> {
    return await db.select().from(shops);
  }

  async getShop(id: number): Promise<Shop | undefined> {
    const [shop] = await db.select().from(shops).where(eq(shops.id, id));
    return shop;
  }

  async getShopByOwnerId(ownerId: number): Promise<Shop | undefined> {
    const [shop] = await db.select().from(shops).where(eq(shops.ownerId, ownerId));
    return shop;
  }

  async createShop(insertShop: InsertShop): Promise<Shop> {
    const [shop] = await db.insert(shops).values(insertShop).returning();
    return shop;
  }

  async updateShop(id: number, update: Partial<InsertShop>): Promise<Shop> {
    const [shop] = await db.update(shops).set(update).where(eq(shops.id, id)).returning();
    return shop;
  }

  async deleteShop(id: number): Promise<void> {
    await db.delete(shops).where(eq(shops.id, id));
  }

  async getProductsByShopId(shopId: number): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.shopId, shopId));
  }

  async getAllProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(insertProduct).returning();
    return product;
  }

  async updateProduct(id: number, update: Partial<InsertProduct>): Promise<Product> {
    const [product] = await db.update(products).set(update).where(eq(products.id, id)).returning();
    return product;
  }

  async deleteProduct(id: number): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  async getOffers(): Promise<Offer[]> {
    return await db.select().from(offers);
  }

  async getOffer(id: number): Promise<Offer | undefined> {
    const [offer] = await db.select().from(offers).where(eq(offers.id, id));
    return offer;
  }

  async createOffer(insertOffer: InsertOffer): Promise<Offer> {
    const [offer] = await db.insert(offers).values(insertOffer).returning();
    return offer;
  }

  async updateOffer(id: number, update: Partial<InsertOffer>): Promise<Offer> {
    const [offer] = await db.update(offers).set(update).where(eq(offers.id, id)).returning();
    return offer;
  }

  async deleteOffer(id: number): Promise<void> {
    await db.delete(offers).where(eq(offers.id, id));
  }
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private shops: Map<number, Shop>;
  private products: Map<number, Product>; // Products ke liye map
  private offers: Map<number, Offer>;
  private currentIds: { [key: string]: number };

  constructor() {
    this.users = new Map();
    this.shops = new Map();
    this.products = new Map();
    this.offers = new Map();
    this.currentIds = { users: 1, shops: 1, products: 1, offers: 1 };
    
    // Initialize sample data if database is empty
    this.initializeSampleData();
  }

  // Initialize sample data if database is empty
  private initializeSampleData(): void {
    // Force clean start for sample data to ensure all 4 products are present
    this.users.clear();
    this.shops.clear();
    this.products.clear();
    this.offers.clear();
    
    // Create admin user
    const adminUser: User = {
      id: 1,
      username: "admin",
      password: "admin123",
      role: "admin",
      isAdmin: true,
    };
    this.users.set(1, adminUser);
    
    // Create sample user for shop owner
    const sampleUser: User = {
      id: 2,
      username: "prarthana",
      password: "prarthana123",
      role: "seller",
      isAdmin: false,
    };
    this.users.set(2, sampleUser);
    this.currentIds.users = 3;

    // --- ADDING 4 REAL SHOPS ---

    // 1. Shahdol Medical Store
    this.shops.set(1, {
      id: 1,
      ownerId: 2,
      name: "Shahdol Medical Store",
      category: "Medical",
      description: "All types of medicines and healthcare products",
      address: "Hospital Road, Shahdol",
      phone: "919999999991",
      mobile: "919999999991",
      image: "https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&q=80&w=800",
      rating: null, reviewCount: null, avgRating: null, isFeatured: true, approved: true, isVerified: true, createdAt: new Date(),
    });

    // 2. New Bazaar Kirana
    this.shops.set(2, {
      id: 2,
      ownerId: 2,
      name: "New Bazaar Kirana",
      category: "Grocery",
      description: "Fresh groceries and daily essentials",
      address: "New Bazaar, Shahdol",
      phone: "919999999992",
      mobile: "919999999992",
      image: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&q=80&w=800",
      rating: null, reviewCount: null, avgRating: null, isFeatured: true, approved: true, isVerified: true, createdAt: new Date(),
    });

    // 3. Sohagpur Chat House
    this.shops.set(3, {
      id: 3,
      ownerId: 2,
      name: "Sohagpur Chat House",
      category: "Restaurants",
      description: "Delicious local chat and snacks",
      address: "Sohagpur, Shahdol",
      phone: "919999999993",
      mobile: "919999999993",
      image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800",
      rating: null, reviewCount: null, avgRating: null, isFeatured: true, approved: true, isVerified: true, createdAt: new Date(),
    });

    // 4. Prarthana Skin Clinic
    this.shops.set(4, {
      id: 4,
      ownerId: 2,
      name: "Prarthana Skin Clinic",
      category: "Beauty & Personal Care",
      description: "Premium skin care products and treatments",
      address: "Main Market, Shahdol",
      phone: "919876543210",
      mobile: "919876543210",
      image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&q=80&w=800",
      rating: null, reviewCount: null, avgRating: null, isFeatured: false, approved: true, isVerified: true, createdAt: new Date(),
    });
    this.currentIds.shops = 5;

    // --- ADDING 4 REAL PRODUCTS ---

    // 1. First Aid Kit
    this.products.set(1, {
      id: 1, shopId: 1, sellerId: 2,
      name: "First Aid Kit",
      price: "250",
      imageUrl: "https://images.unsplash.com/photo-1603398938378-e54eab446ddd?auto=format&fit=crop&q=80&w=800",
      category: "Medical",
      description: "Complete first aid kit for emergencies",
      createdAt: new Date(),
    });

    // 2. Aashirvaad Atta 5kg
    this.products.set(2, {
      id: 2, shopId: 2, sellerId: 2,
      name: "Aashirvaad Atta 5kg",
      price: "210",
      imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=800",
      category: "Grocery",
      description: "Premium quality wheat flour",
      createdAt: new Date(),
    });

    // 3. Special Paneer Tikka
    this.products.set(3, {
      id: 3, shopId: 3, sellerId: 2,
      name: "Special Paneer Tikka",
      price: "180",
      imageUrl: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&q=80&w=800",
      category: "Restaurants",
      description: "Grilled cottage cheese with spices",
      createdAt: new Date(),
    });

    // 4. Vitamin C Face Pack
    this.products.set(4, {
      id: 4, shopId: 4, sellerId: 2,
      name: "Vitamin C Face Pack",
      price: "499",
      imageUrl: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&q=80&w=800",
      category: "Beauty & Personal Care",
      description: "Brightening face pack with Vitamin C for glowing skin",
      createdAt: new Date(),
    });
    this.currentIds.products = 5;
    
    // Create sample offers
    this.offers.set(1, {
      id: 1,
      content: "शहडोल में आज का मौसम: हल्की ठंड के साथ तापमान 17°C रहेगा।",
      isActive: true,
      createdAt: new Date(),
    });
    this.offers.set(2, {
      id: 2,
      content: "कल विराटेश्वर मंदिर में विशेष आरती और भंडारा दोपहर 12 बजे से।",
      isActive: true,
      createdAt: new Date(),
    });
    this.offers.set(3, {
      id: 3,
      content: "शहडोल बाज़ार में ताज़ा फल और सब्जियों की नई आवक शुरू - देखें किराना सेक्शन।",
      isActive: true,
      createdAt: new Date(),
    });
    this.offers.set(4, {
      id: 4,
      content: "नगर पालिका सूचना: बुढ़ार रोड पर पाइपलाइन मरम्मत के कारण आज जल आपूर्ति बाधित रह सकती है।",
      isActive: true,
      createdAt: new Date(),
    });
    this.currentIds.offers = 5;
  }

  // --- USER METHODS ---
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((u) => u.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentIds.users++;
    const user: User = { 
      ...insertUser, 
      id, 
      role: insertUser.role || "customer",
      isAdmin: insertUser.isAdmin ?? false, // Ensure isAdmin is always boolean
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, update: Partial<User>): Promise<User> {
    const existing = await this.getUser(id);
    if (!existing) throw new Error("User not found");
    const updated = { ...existing, ...update };
    this.users.set(id, updated);
    return updated;
  }

  // --- SHOP METHODS ---
  async getShops(): Promise<Shop[]> {
    return Array.from(this.shops.values());
  }

  async getShop(id: number): Promise<Shop | undefined> {
    return this.shops.get(id);
  }

  async getShopByOwnerId(ownerId: number): Promise<Shop | undefined> {
    return Array.from(this.shops.values()).find((s) => s.ownerId === ownerId);
  }

  async createShop(insertShop: InsertShop): Promise<Shop> {
    const id = this.currentIds.shops++;
    const shop: Shop = {
      ...insertShop,
      id,
      approved: true, // Auto-approval enabled (temporary)
      description: insertShop.description || null,
      address: insertShop.address || null,
      image: insertShop.image || null,
      isFeatured: insertShop.isFeatured ?? false,
      rating: null,
      reviewCount: null,
      avgRating: null,
      isVerified: false,
      createdAt: new Date(),
    };
    this.shops.set(id, shop);
    return shop;
  }

  async updateShop(id: number, update: Partial<InsertShop>): Promise<Shop> {
    const existing = await this.getShop(id);
    if (!existing) throw new Error("Shop not found");
    const updated = { ...existing, ...update };
    this.shops.set(id, updated);
    return updated;
  }

  async deleteShop(id: number): Promise<void> {
    this.shops.delete(id);
  }

  // --- PRODUCT METHODS (Add/Delete/Get) ---

  async getProductsByShopId(shopId: number): Promise<Product[]> {
    // Sirf wahi products return karega jo us shop ID ke hain
    return Array.from(this.products.values()).filter(
      (p) => p.shopId === shopId,
    );
  }

  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProduct(id: number): Promise<Product | undefined> {
    // Ensure id is a number
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    return this.products.get(numericId);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.currentIds.products++;
    const product: Product = {
      ...insertProduct,
      id,
      description: insertProduct.description || null,
      imageUrl: insertProduct.imageUrl || null,
      createdAt: new Date(),
    };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: number, update: Partial<InsertProduct>): Promise<Product> {
    const existing = await this.getProduct(id);
    if (!existing) throw new Error("Product not found");
    const updated = { ...existing, ...update };
    this.products.set(id, updated);
    return updated;
  }

  async deleteProduct(id: number): Promise<void> {
    const exists = this.products.has(id);
    if (!exists) throw new Error("Product not found");
    this.products.delete(id);
  }

  // --- OFFER METHODS ---
  async getOffers(): Promise<Offer[]> {
    return Array.from(this.offers.values());
  }

  async getOffer(id: number): Promise<Offer | undefined> {
    return this.offers.get(id);
  }

  async createOffer(insertOffer: InsertOffer): Promise<Offer> {
    const id = this.currentIds.offers++;
    const offer: Offer = {
      ...insertOffer,
      id,
      isActive: insertOffer.isActive ?? true,
      createdAt: new Date(),
    };
    this.offers.set(id, offer);
    return offer;
  }

  async updateOffer(id: number, update: Partial<InsertOffer>): Promise<Offer> {
    const existing = await this.getOffer(id);
    if (!existing) throw new Error("Offer not found");
    const updated = { ...existing, ...update };
    this.offers.set(id, updated);
    return updated;
  }

  async deleteOffer(id: number): Promise<void> {
    const exists = this.offers.has(id);
    if (!exists) throw new Error("Offer not found");
    this.offers.delete(id);
  }
}

export const storage = process.env.DATABASE_URL ? new DatabaseStorage() : new MemStorage();
