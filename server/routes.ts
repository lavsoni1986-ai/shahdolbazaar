import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertShopSchema, insertUserSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express,
): Promise<Server> {
  console.log(
    "✅ API ROUTES LOADED: Auth + Shops + Partner Check + Security Fixes",
  );

  // ==========================================
  // 🔐 1. AUTHENTICATION APIs
  // ==========================================

  // REGISTER
  app.post("/api/register", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existing = await storage.getUserByUsername(userData.username);
      if (existing) {
        return res.status(400).json({ message: "Username already exists" });
      }
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error) {
      console.error("Register Error:", error);
      res.status(400).json({ message: "Registration Failed" });
    }
  });

  // LOGIN
  app.post("/api/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);

      if (!user || user.password !== password) {
        return res
          .status(401)
          .json({ message: "Invalid username or password" });
      }
      res.json(user);
    } catch (error) {
      console.error("Login Error:", error);
      res.status(500).json({ message: "Login Failed" });
    }
  });

  // ==========================================
  // 🛍️ 2. SHOP APIs
  // ==========================================

  // Get All Shops (Public)
  app.get("/api/shops", async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 9;
      const q = ((req.query.q as string) || "").toLowerCase();
      const category = ((req.query.category as string) || "").toLowerCase();

      const allShops = await storage.getShops();

      const filtered = allShops.filter((s) => {
        // ✅ FIX 1: Sirf Approved dukan dikhao (Future Admin Safety)
        if (s.approved === false) return false;

        const matchesQ =
          !q ||
          s.name.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q);
        const matchesCat = !category || s.category.toLowerCase() === category;
        return matchesQ && matchesCat;
      });

      const paginated = filtered.slice((page - 1) * limit, page * limit);
      res.json({
        data: paginated,
        pagination: {
          page,
          limit,
          total: filtered.length,
          totalPages: Math.ceil(filtered.length / limit),
        },
      });
    } catch (e) {
      res.status(500).json({ message: "Error" });
    }
  });

  // Get Single Shop
  app.get("/api/shops/:id", async (req: Request, res: Response) => {
    const shop = await storage.getShop(parseInt(req.params.id));
    if (!shop) return res.status(404).json({ message: "Not Found" });
    res.json(shop);
  });

  // Check Partner Shop (By Owner ID)
  app.get("/api/partner/shop/:ownerId", async (req: Request, res: Response) => {
    try {
      const ownerId = parseInt(req.params.ownerId);
      if (isNaN(ownerId)) return res.json(null);
      const shop = await storage.getShopByOwnerId(ownerId);
      if (!shop) return res.json(null);
      res.json(shop);
    } catch (e) {
      res.status(500).json({ message: "Error" });
    }
  });

  // Create Shop
  app.post("/api/shops", async (req: Request, res: Response) => {
    try {
      const shopData = insertShopSchema.parse(req.body);
      const newShop = await storage.createShop(shopData);
      res.json(newShop);
    } catch (e) {
      res.status(400).json({ message: "Invalid Data" });
    }
  });

  // Update Shop
  app.patch("/api/shops/:id", async (req: Request, res: Response) => {
    try {
      const updateData = insertShopSchema.partial().parse(req.body);
      const updated = await storage.updateShop(
        parseInt(req.params.id),
        updateData,
      );

      // ✅ FIX 2: Null Check (Agar shop nahi mili to crash mat hone do)
      if (!updated) {
        return res.status(404).json({ message: "Shop not found" });
      }

      res.json(updated);
    } catch (e) {
      res.status(400).json({ message: "Update Failed" });
    }
  });

  return httpServer;
}
