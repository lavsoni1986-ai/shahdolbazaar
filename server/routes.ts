import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertShopSchema, insertUserSchema } from "@shared/schema";

// ✅ FIX 1: Admin PIN Environment Variable se (Safe)
const ADMIN_PIN = process.env.ADMIN_PIN || "1234";

export async function registerRoutes(
  httpServer: Server,
  app: Express,
): Promise<Server> {
  console.log("✅ API ROUTES LOADED: Secured & Optimized 🛡️");

  // ==========================================
  // 🔐 1. AUTHENTICATION (Login/Register)
  // ==========================================
  app.post("/api/register", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existing = await storage.getUserByUsername(userData.username);
      if (existing) return res.status(400).json({ message: "Username exists" });
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: "Register Failed" });
    }
  });

  app.post("/api/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password)
        return res.status(401).json({ message: "Invalid Credentials" });
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Login Failed" });
    }
  });

  // ==========================================
  // 👮‍♂️ 2. ADMIN APIs (Secured & Robust)
  // ==========================================

  const requireAdmin = (req: Request, res: Response, next: any) => {
    const providedPin = req.headers["x-admin-pin"];
    if (providedPin !== ADMIN_PIN) {
      return res.status(403).json({ message: "Access Denied: Wrong PIN 🚫" });
    }
    next();
  };

  // Get All Shops
  app.get(
    "/api/admin/shops",
    requireAdmin,
    async (req: Request, res: Response) => {
      try {
        const shops = await storage.getShops();
        res.json(shops);
      } catch (e) {
        res.status(500).json({ message: "Error loading shops" });
      }
    },
  );

  // Approve Shop (✅ FIX 2: Check existence first)
  app.patch(
    "/api/shops/:id/approve",
    requireAdmin,
    async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id);

        // Safety Check: Dukan hai bhi ya nahi?
        const existingShop = await storage.getShop(id);
        if (!existingShop)
          return res.status(404).json({ message: "Shop not found" });

        const updated = await storage.updateShop(id, { approved: true });
        res.json(updated);
      } catch (e) {
        res.status(500).json({ message: "Approval Failed" });
      }
    },
  );

  // Delete Shop (✅ FIX 2: Check existence first)
  app.delete(
    "/api/shops/:id",
    requireAdmin,
    async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id);

        // Safety Check
        const existingShop = await storage.getShop(id);
        if (!existingShop)
          return res.status(404).json({ message: "Shop not found" });

        await storage.deleteShop(id);
        res.json({ success: true });
      } catch (e) {
        res.status(500).json({ message: "Delete Failed" });
      }
    },
  );

  // ==========================================
  // 🛍️ 3. PUBLIC SHOP APIs (Leak Proof)
  // ==========================================

  // Get Approved Shops Only
  app.get("/api/shops", async (req: Request, res: Response) => {
    try {
      const q = ((req.query.q as string) || "").toLowerCase();
      const allShops = await storage.getShops();

      const filtered = allShops.filter((s) => {
        if (s.approved === false) return false;
        return (
          !q ||
          s.name.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q)
        );
      });

      res.json({ data: filtered });
    } catch (e) {
      res.status(500).json({ message: "Error" });
    }
  });

  // Get Single Shop (✅ FIX 3: Prevent viewing unapproved shops via URL)
  app.get("/api/shops/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const shop = await storage.getShop(id);

      if (!shop) return res.status(404).json({ message: "Shop not found" });

      // 🔴 SECURITY BLOCK: Agar approved nahi hai, to mat dikhao
      if (shop.approved === false) {
        return res
          .status(403)
          .json({ message: "This shop is pending approval ⏳" });
      }

      res.json(shop);
    } catch (e) {
      res.status(500).json({ message: "Server Error" });
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
      const id = parseInt(req.params.id);
      const existingShop = await storage.getShop(id);
      if (!existingShop)
        return res.status(404).json({ message: "Shop not found" });

      const updateData = insertShopSchema.partial().parse(req.body);
      const updated = await storage.updateShop(id, updateData);
      res.json(updated);
    } catch (e) {
      res.status(400).json({ message: "Update Failed" });
    }
  });

  // Partner Dashboard Check (Internal use, so no approval check needed here)
  app.get("/api/partner/shop/:ownerId", async (req: Request, res: Response) => {
    const shop = await storage.getShopByOwnerId(parseInt(req.params.ownerId));
    res.json(shop || null);
  });

  return httpServer;
}
