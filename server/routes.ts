import type { Express, Request, Response } from "express";
import { writeFileSync } from "fs";
import { type Server } from "http";
import { storage } from "./storage";
import { fromZodError } from "zod-validation-error";
import {
  insertShopSchema,
  insertUserSchema,
  insertProductSchema,
  insertOfferSchema,
} from "@shared/schema";

// Admin PIN (Environment variable recommended for production)
const ADMIN_PIN = process.env.ADMIN_PIN || "1234";

export async function registerRoutes(
  httpServer: Server,
  app: Express,
): Promise<Server> {
  // Simple in-memory metrics (visitors)
  const metrics = {
    visitors: 0,
  };

  console.log("🔵 [ROUTES] ========================================");
  console.log("🔵 [ROUTES] Starting route registration...");
  console.log("✅ API ROUTES LOADED: Secured & Optimized 🛡️");
  console.log("✅ [ROUTES] Registering API routes BEFORE static file serving");
  
  // Test endpoint to verify routing works - REGISTER FIRST
  app.get("/api/test", (req: Request, res: Response) => {
    return res.json({ 
      message: "API routing is working!", 
      timestamp: new Date().toISOString(),
    });
  });
  console.log("✅ [ROUTES] /api/test route registered");
  
  // Also register a simple health check
  app.get("/api/health", (req: Request, res: Response) => {
    res.setHeader("Content-Type", "application/json");
    return res.json({ status: "ok", timestamp: new Date().toISOString() });
  });
  console.log("✅ [ROUTES] /api/health route registered");

  // ==========================================
  // 🛡️ MIDDLEWARES (initialized early)
  // ==========================================
  // Partner Auth Middleware
  const requireAuth = (req: Request, res: Response, next: any) => {
    const userId = req.headers["x-user-id"];
    if (!userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Please login first 🔐" });
    }
    (req as any).userId = Number(userId);
    next();
  };

  // Admin Auth Middleware - Check role instead of PIN
  const requireAdmin = async (req: Request, res: Response, next: any) => {
    try {
      const userId = (req as any).userId;
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      const isAdmin = user.isAdmin || user.role === "admin";
      if (!isAdmin) {
        return res.status(403).json({ message: "Admin access required 🚫" });
      }
      next();
    } catch (error) {
      return res.status(500).json({ message: "Admin check failed" });
    }
  };

  // Metrics endpoints: record visitor
  app.post('/api/metrics/visit', async (req: Request, res: Response) => {
    try {
      metrics.visitors += 1;
      return res.json({ visitors: metrics.visitors });
    } catch (e) {
      return res.status(500).json({ message: 'Failed to record visit' });
    }
  });

  // Admin stats endpoint (requires admin)
  app.get('/api/admin/stats', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const allProducts = await storage.getAllProducts();
      return res.json({ visitors: metrics.visitors, totalProducts: allProducts.length });
    } catch (e) {
      return res.status(500).json({ message: 'Failed to fetch stats' });
    }
  });

  // ==========================================
  // 🛡️ MIDDLEWARES
  // ==========================================
  // (moved earlier) Middleware definitions are initialized at top of registerRoutes

  // ==========================================
  // 🔐 1. USER AUTH ROUTES
  // ==========================================
  app.post("/api/register", async (req: Request, res: Response) => {
    try {
      res.setHeader("Content-Type", "application/json");
      const userData = insertUserSchema.parse(req.body);
      const existing = await storage.getUserByUsername(userData.username);
      if (existing) {
        return res.status(400).json({ message: "Username exists" });
      }

      const user = await storage.createUser(userData);
      return res.json(user);
    } catch (error) {
      res.setHeader("Content-Type", "application/json");
      return res.status(400).json({ message: "Register Failed" });
    }
  });

  app.post("/api/login", async (req: Request, res: Response) => {
    try {
      res.setHeader("Content-Type", "application/json");
      const { username, password } = req.body;
      
      console.log("🔵 [LOGIN] Login attempt for username:", username);
      console.log("🔵 [LOGIN] Password provided (length):", password?.length || 0);
      
      if (!username || !password) {
        console.log("❌ [LOGIN] Missing username or password");
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user) {
        console.log("❌ [LOGIN] User not found:", username);
        return res.status(401).json({ message: "Invalid Credentials" });
      }
      
      console.log("✅ [LOGIN] User found:", user.id, user.username);
      console.log("🔵 [LOGIN] Stored password (length):", user.password?.length || 0);
      console.log("🔵 [LOGIN] Password match:", user.password === password);
      
      if (user.password !== password) {
        console.log("❌ [LOGIN] Password mismatch for user:", username);
        return res.status(401).json({ message: "Invalid Credentials" });
      }
      
      // FORCE ADMIN SESSION: Explicitly set isAdmin and role for admin user
      if (username.toLowerCase() === "admin" || user.role === "admin" || user.isAdmin) {
        console.log("🔵 [LOGIN] Admin user detected - forcing admin session");
        
        // Update in storage FIRST to ensure consistency
        const updatedUser = await storage.updateUser(user.id, { role: "admin", isAdmin: true });
        
        // Create admin user object with guaranteed admin flags
        const adminUser = {
          id: updatedUser.id,
          username: updatedUser.username,
          password: updatedUser.password, // Include for completeness
          role: "admin" as const,
          isAdmin: true,
        };
        
        console.log("✅ [LOGIN] Admin session saved to storage and forced in response");
        console.log("✅ [LOGIN] Admin user data:", JSON.stringify({ id: adminUser.id, username: adminUser.username, role: adminUser.role, isAdmin: adminUser.isAdmin }, null, 2));
        
        // Return admin user with explicit flags
        return res.json(adminUser);
      }
      
      console.log("✅ [LOGIN] User authenticated:", user.id, user.username, "Role:", user.role, "isAdmin:", user.isAdmin);
      console.log("✅ [LOGIN] Returning user data:", JSON.stringify({ id: user.id, username: user.username, role: user.role, isAdmin: user.isAdmin }, null, 2));
      
      return res.json(user);
    } catch (error: any) {
      console.error("❌ [LOGIN] Error:", error);
      console.error("❌ [LOGIN] Error stack:", error.stack);
      res.setHeader("Content-Type", "application/json");
      return res.status(500).json({ message: error.message || "Login Failed" });
    }
  });

  // ==========================================
  // 🛍️ 2. SECURE SHOP APIs
  // ==========================================

  // Public: Get all approved shops (or all shops for admin)
  app.get("/api/shops", async (req: Request, res: Response) => {
    try {
      res.setHeader("Content-Type", "application/json");
      const q = ((req.query.q as string) || "").toLowerCase();
      const userId = req.headers["x-user-id"];
      
      // Check if user is admin
      let isAdmin = false;
      if (userId) {
        const user = await storage.getUser(Number(userId));
        isAdmin = user?.isAdmin || user?.role === "admin";
      }
      
      const allShops = await storage.getShops();
      
      // If admin, return all shops; otherwise only approved shops
      const filtered = allShops.filter(
        (s) => (isAdmin || s.approved !== false) && (!q || s.name.toLowerCase().includes(q)),
      );
      return res.json({ data: filtered });
    } catch (e) {
      res.setHeader("Content-Type", "application/json");
      return res.status(500).json({ message: "Error fetching shops" });
    }
  });

  // Public: Get single shop by ID
  app.get("/api/shops/:id", async (req: Request, res: Response) => {
    try {
      res.setHeader("Content-Type", "application/json");
      const id = parseInt(req.params.id);
      const shop = await storage.getShop(id);
      if (!shop) {
        return res.status(404).json({ message: "Shop not found" });
      }
      return res.json(shop);
    } catch (e) {
      res.setHeader("Content-Type", "application/json");
      return res.status(500).json({ message: "Error fetching shop" });
    }
  });

  // Debug endpoint: Check all products and their shop associations
  app.get("/api/debug/products-shops", async (req: Request, res: Response) => {
    res.setHeader("Content-Type", "application/json");
    try {
      const allProducts = await storage.getAllProducts();
      const allShops = await storage.getShops();
      
      const debugInfo = {
        totalProducts: allProducts.length,
        totalShops: allShops.length,
        products: allProducts.map((p) => {
          const shop = allShops.find((s) => s.id === p.shopId);
          return {
            productId: p.id,
            productName: p.name,
            productShopId: p.shopId,
            shopExists: !!shop,
            shopName: shop?.name || "NOT FOUND",
            shopOwnerId: shop?.ownerId,
          };
        }),
        shops: allShops.map((s) => ({
          shopId: s.id,
          shopName: s.name,
          ownerId: s.ownerId,
          productCount: allProducts.filter((p) => p.shopId === s.id).length,
        })),
      };
      
      console.log("🔍 [DEBUG] Products-Shops Association:", JSON.stringify(debugInfo, null, 2));
      return res.json(debugInfo);
    } catch (e: any) {
      console.error("❌ [DEBUG] Error:", e);
      res.setHeader("Content-Type", "application/json");
      return res.status(500).json({ message: e.message });
    }
  });

  // Private: Get Partner's Own Shop
  app.get(
    "/api/partner/shop",
    requireAuth,
    async (req: Request, res: Response) => {
      res.setHeader("Content-Type", "application/json");
      const userId = (req as any).userId;
      console.log("🔵 [SHOP API] GET /api/partner/shop - userId:", userId);
      
      const shop = await storage.getShopByOwnerId(userId);
      console.log("🔵 [SHOP API] Shop found:", shop ? `ID: ${shop.id}, Name: ${shop.name}` : "null");
      
      if (shop) {
        console.log("🔵 [SHOP API] Shop details:", JSON.stringify(shop, null, 2));
        // Verify all fields are present
        const shopData = {
          id: shop.id,
          name: shop.name,
          category: shop.category,
          phone: shop.phone,
          mobile: shop.mobile,
          address: shop.address,
          description: shop.description,
          image: shop.image,
          ownerId: shop.ownerId,
          approved: shop.approved,
          isVerified: shop.isVerified,
          createdAt: shop.createdAt,
        };
        console.log("🔵 [SHOP API] Returning shop data:", JSON.stringify(shopData, null, 2));
        return res.json(shopData);
      } else {
        console.log("⚠️ [SHOP API] No shop found for userId:", userId);
        // Check if user exists
        const user = await storage.getUser(userId);
        console.log("🔵 [SHOP API] User exists:", user ? `ID: ${user.id}, Username: ${user.username}, Role: ${user.role}` : "NOT FOUND");
        return res.json(null);
      }
    },
  );

  // Auto-create default shop for seller if missing
  app.post(
    "/api/partner/shop/create-default",
    requireAuth,
    async (req: Request, res: Response) => {
      try {
        res.setHeader("Content-Type", "application/json");
        const userId = (req as any).userId;
        console.log("🔵 [SHOP CREATE] Received request for userId:", userId);
        
        // Check if shop already exists
        const existingShop = await storage.getShopByOwnerId(userId);
        if (existingShop) {
          console.log("✅ [SHOP CREATE] Shop already exists:", existingShop.id);
          return res.json(existingShop);
        }

        // Get user info
        const user = await storage.getUser(userId);
        if (!user) {
          console.error("❌ [SHOP CREATE] User not found:", userId);
          return res.status(404).json({ message: "User not found" });
        }

        console.log("🔄 [SHOP CREATE] Creating default shop for user:", user.username);

        // Create default shop
        const defaultShopData = {
          ownerId: userId,
          name: `${user.username}'s Shop`,
          category: "Other",
          phone: "0000000000",
          mobile: "0000000000",
          address: "Shahdol",
          description: "Shop details pending",
          image: null,
        };

        const validatedData = insertShopSchema.parse(defaultShopData);
        const newShop = await storage.createShop(validatedData);
        console.log("✅ [SHOP CREATE] Shop created successfully:", newShop.id, newShop.name);
        
        // Ensure user role is seller
        await storage.updateUser(userId, { role: "seller" });
        console.log("✅ [SHOP CREATE] User role updated to seller");
        
        return res.json(newShop);
      } catch (e: any) {
        console.error("❌ [SHOP CREATE] Error:", e);
        res.setHeader("Content-Type", "application/json");
        return res.status(400).json({ message: e.message || "Failed to create default shop" });
      }
    },
  );

  // Seller Application Endpoint
  app.post("/api/seller/apply", requireAuth, async (req: Request, res: Response) => {
    try {
      res.setHeader("Content-Type", "application/json");
      const userId = (req as any).userId;
      
      console.log("🔵 [SHOP APPLY] Creating shop for userId:", userId);
      console.log("🔵 [SHOP APPLY] Request body:", JSON.stringify(req.body, null, 2));
      
      // Check if user already has a shop
      const existingShop = await storage.getShopByOwnerId(userId);
      if (existingShop) {
        console.log("⚠️ [SHOP APPLY] Shop already exists for userId:", userId, "Shop ID:", existingShop.id);
        return res.status(400).json({ 
          message: "You already have a shop application. Please wait for admin verification." 
        });
      }

      // Ensure both phone and mobile are set (for backward compatibility)
      const shopData = {
        ...req.body,
        ownerId: userId,
        phone: req.body.phone || req.body.mobile,
        mobile: req.body.mobile || req.body.phone,
      };

      console.log("🔵 [SHOP APPLY] Shop data before validation:", JSON.stringify(shopData, null, 2));
      const validatedData = insertShopSchema.parse(shopData);
      console.log("✅ [SHOP APPLY] Shop data validated successfully");
      
      const newShop = await storage.createShop(validatedData);
      console.log("✅ [SHOP APPLY] Shop created successfully:");
      console.log("  - Shop ID:", newShop.id);
      console.log("  - Shop Name:", newShop.name);
      console.log("  - Owner ID:", newShop.ownerId);
      console.log("  - Category:", newShop.category);
      console.log("  - Full shop data:", JSON.stringify(newShop, null, 2));
      
      // Verify shop was saved correctly
      const verifyShop = await storage.getShop(newShop.id);
      if (!verifyShop) {
        console.error("❌ [SHOP APPLY] CRITICAL: Shop was not saved to database!");
      } else {
        console.log("✅ [SHOP APPLY] Shop verified in database:", verifyShop.id, verifyShop.name);
      }
      
      // Auto-update user role to seller since shop is auto-approved
      const updatedUser = await storage.updateUser(userId, { role: "seller" });
      console.log("✅ [SHOP APPLY] User role updated to seller:", updatedUser.role);
      
      return res.json({ 
        shop: newShop,
        user: updatedUser, // Return updated user so frontend can update localStorage
        message: "Application submitted successfully. Shop is now active!" 
      });
    } catch (e: any) {
      console.error("❌ [SHOP APPLY] Error:", e);
      console.error("❌ [SHOP APPLY] Error stack:", e.stack);
      res.setHeader("Content-Type", "application/json");
      return res.status(400).json({ message: e.message || "Invalid Shop Data" });
    }
  });

  // Create Shop (Associated with Logged-in User)
  app.post("/api/shops", requireAuth, async (req: Request, res: Response) => {
    try {
      res.setHeader("Content-Type", "application/json");
      const userId = (req as any).userId;
      
      console.log("🔵 [SHOP CREATE] Creating shop for userId:", userId);
      console.log("🔵 [SHOP CREATE] Request body:", JSON.stringify(req.body, null, 2));
      
      const shopData = insertShopSchema.parse({ ...req.body, ownerId: userId });
      console.log("✅ [SHOP CREATE] Shop data validated");
      
      const newShop = await storage.createShop(shopData);
      console.log("✅ [SHOP CREATE] Shop created successfully:");
      console.log("  - Shop ID:", newShop.id);
      console.log("  - Shop Name:", newShop.name);
      console.log("  - Owner ID:", newShop.ownerId);
      console.log("  - Full shop data:", JSON.stringify(newShop, null, 2));
      
      // Verify shop was saved correctly
      const verifyShop = await storage.getShop(newShop.id);
      if (!verifyShop) {
        console.error("❌ [SHOP CREATE] CRITICAL: Shop was not saved to database!");
      } else {
        console.log("✅ [SHOP CREATE] Shop verified in database");
      }
      
      return res.json(newShop);
    } catch (e: any) {
      console.error("❌ [SHOP CREATE] Error:", e);
      res.setHeader("Content-Type", "application/json");
      return res.status(400).json({ message: e.message || "Invalid Shop Data" });
    }
  });

  // Update Shop (With Ownership Check or Admin Override)
  app.patch(
    "/api/shops/:id",
    requireAuth,
    async (req: Request, res: Response) => {
      try {
        res.setHeader("Content-Type", "application/json");
        const userId = (req as any).userId;
        const id = parseInt(req.params.id);

        const existingShop = await storage.getShop(id);
        if (!existingShop) {
          return res.status(404).json({ message: "Shop not found" });
        }

        // Check if user is admin
        const user = await storage.getUser(userId);
        const isAdmin = user?.isAdmin || user?.role === "admin";

        // Allow update if user owns the shop OR is admin
        if (existingShop.ownerId !== userId && !isAdmin) {
          return res.status(403).json({ message: "Forbidden: Not your shop" });
        }

        const updateData = insertShopSchema.partial().parse(req.body);
        const updated = await storage.updateShop(id, updateData);
        return res.json(updated);
      } catch (e) {
        res.setHeader("Content-Type", "application/json");
        return res.status(400).json({ message: "Update Failed" });
      }
    },
  );

  // ✅ SECURE DELETE SHOP (Admin Only)
  app.delete(
    "/api/shops/:id",
    requireAuth,
    requireAdmin,
    async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id);
        await storage.deleteShop(id);
        return res.sendStatus(204);
      } catch (e) {
        res.setHeader("Content-Type", "application/json");
        return res.status(500).json({ message: "Delete Failed" });
      }
    },
  );

  // ==========================================
  // 📦 3. SECURE PRODUCT APIs
  // ==========================================

  // Debug endpoint to see all products and shops
  app.get("/api/debug/products", async (req: Request, res: Response) => {
    try {
      res.setHeader("Content-Type", "application/json");
      const allProducts = await storage.getAllProducts();
      const allShops = await storage.getShops();
      return res.json({
        products: allProducts,
        shops: allShops,
        productCount: allProducts.length,
        shopCount: allShops.length,
        message: "Debug: All products and shops",
      });
    } catch (e) {
      console.error("Debug endpoint error:", e);
      res.setHeader("Content-Type", "application/json");
      return res.status(500).json({ message: "Debug error" });
    }
  });

  // Public: Get all products from approved shops (for home page)
  app.get("/api/products/all", async (req: Request, res: Response) => {
    try {
      res.setHeader("Content-Type", "application/json");
      
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 12;
      const q = ((req.query.q as string) || "").toLowerCase();
      const categoryParam = (req.query.category as string) || "";
      const category = categoryParam.toLowerCase();

      const allProducts = await storage.getAllProducts();
      const allShops = await storage.getShops();
      
      const shopMap = new Map<number, typeof allShops[0]>();
      allShops.forEach(s => {
        shopMap.set(s.id, s);
      });
      
      const filtered = allProducts.filter((p) => {
        const matchesQ =
          !q ||
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q));
        
        let matchesCat = true;
        if (category) {
          const shop = shopMap.get(p.shopId);
          const productCatNormalized = (p.category || "").toLowerCase().trim().replace(/\s+/g, " ");
          const categoryNormalized = category.toLowerCase().trim().replace(/\s+/g, " ");
          const productMatch = productCatNormalized.includes(categoryNormalized) || categoryNormalized.includes(productCatNormalized);
          const shopCatNormalized = (shop?.category || "").toLowerCase().trim().replace(/\s+/g, " ");
          const shopMatch = shopCatNormalized.includes(categoryNormalized) || categoryNormalized.includes(shopCatNormalized);
          matchesCat = productMatch || shopMatch;
        }
        
        return matchesQ && matchesCat;
      });

      const paginated = filtered.slice((page - 1) * limit, page * limit);
      
      const response = {
        data: paginated,
        pagination: {
          page,
          limit,
          total: filtered.length,
          totalPages: Math.ceil(filtered.length / limit),
        },
      };
      
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      
      return res.json(response);
    } catch (e) {
      res.setHeader("Content-Type", "application/json");
      return res.status(500).json({ message: "Error fetching products" });
    }
  });

  app.get("/api/products", async (req: Request, res: Response) => {
    res.setHeader("Content-Type", "application/json");
    const shopId = parseInt(req.query.shopId as string);
    console.log("🔵 [PRODUCTS API] GET /api/products - shopId:", shopId);
    
    if (!shopId || isNaN(shopId)) {
      console.log("❌ [PRODUCTS API] Invalid shopId:", req.query.shopId);
      return res.status(400).json({ message: "Shop ID required" });
    }
    
    const productsList = await storage.getProductsByShopId(shopId);
    console.log(`🔵 [PRODUCTS API] Found ${productsList.length} products for shopId: ${shopId}`);
    productsList.forEach((p) => {
      console.log(`  - Product: "${p.name}" (ID: ${p.id}, shopId: ${p.shopId})`);
    });
    
    // Also check if shop exists
    const shop = await storage.getShop(shopId);
    if (!shop) {
      console.log(`⚠️ [PRODUCTS API] Shop ID ${shopId} does not exist in database!`);
    } else {
      console.log(`✅ [PRODUCTS API] Shop exists: "${shop.name}" (ownerId: ${shop.ownerId})`);
    }
    
    return res.json(productsList);
  });

  app.post(
    "/api/products",
    requireAuth,
    async (req: Request, res: Response) => {
      try {
        res.setHeader("Content-Type", "application/json");
        const userId = (req as any).userId;
        const { shopId, name } = req.body;

        console.log("🔵 [PRODUCT CREATE] Creating product:", name);
        console.log("🔵 [PRODUCT CREATE] userId:", userId);
        console.log("🔵 [PRODUCT CREATE] shopId from body:", shopId);
        console.log("🔵 [PRODUCT CREATE] Full request body:", JSON.stringify(req.body, null, 2));

        const shop = await storage.getShop(Number(shopId));
        if (!shop) {
          console.log("❌ [PRODUCT CREATE] Shop not found for shopId:", shopId);
          return res.status(404).json({ message: "Shop not found" });
        }
        
        console.log("✅ [PRODUCT CREATE] Shop found:", shop.name, "(ID:", shop.id, ", ownerId:", shop.ownerId, ")");

        // Allow shop owners or admins to create products
        const reqUser = await storage.getUser(userId);
        const isAdmin = reqUser?.isAdmin || reqUser?.role === 'admin';
        if (shop.ownerId !== userId && !isAdmin) {
          console.log("❌ [PRODUCT CREATE] Ownership check failed - shop.ownerId:", shop.ownerId, "!= userId:", userId, "and not admin");
          return res.status(403).json({ message: "Unauthorized: You don't own this shop" });
        }

        // Auto-inject sellerId from the shop owner if not provided, or use userId
        const bodyWithSeller = { 
          ...req.body, 
          sellerId: req.body.sellerId || shop.ownerId || userId 
        };
        
        const productData = insertProductSchema.parse(bodyWithSeller);
        console.log("✅ [PRODUCT CREATE] Validated product data:", JSON.stringify(productData, null, 2));
        
        const newProduct = await storage.createProduct(productData);
        console.log("✅ [PRODUCT CREATE] Product created successfully:", newProduct.id, newProduct.name, "(shopId:", newProduct.shopId, ")");
        
        return res.json(newProduct);
      } catch (e: any) {
        console.error("❌ [PRODUCT CREATE] Error:", e);
        res.setHeader("Content-Type", "application/json");
        
        // Better error message for Zod validation
        if (e.name === "ZodError") {
          const validationError = fromZodError(e);
          return res.status(400).json({ message: validationError.message });
        }
        
        return res.status(400).json({ message: e.message || "Invalid Product Data" });
      }
    },
  );

  app.get("/api/products/:id", async (req: Request, res: Response) => {
    try {
      res.setHeader("Content-Type", "application/json");
      const productId = parseInt(req.params.id, 10);
      
      if (isNaN(productId)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }

      const product = await storage.getProduct(productId);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      return res.json(product);
    } catch (e: any) {
      res.setHeader("Content-Type", "application/json");
      return res.status(500).json({ message: "Error fetching product" });
    }
  });

  // Update Product (With Ownership Check or Admin Override)
  app.patch(
    "/api/products/:id",
    requireAuth,
    async (req: Request, res: Response) => {
      try {
        res.setHeader("Content-Type", "application/json");
        const userId = (req as any).userId;
        const productId = parseInt(req.params.id);

        const product = await storage.getProduct(productId);
        if (!product) {
          return res.status(404).json({ message: "Product not found" });
        }

        // Check if user is admin
        const user = await storage.getUser(userId);
        const isAdmin = user?.isAdmin || user?.role === "admin";

        // Allow update if user owns the shop OR is admin
        const shop = await storage.getShop(product.shopId);
        if (!shop) {
          return res.status(404).json({ message: "Shop not found" });
        }

        if (shop.ownerId !== userId && !isAdmin) {
          return res.status(403).json({ message: "Unauthorized: You don't own this product's shop" });
        }

        const updateData = insertProductSchema.partial().parse(req.body);
        const updated = await storage.updateProduct(productId, updateData);
        return res.json(updated);
      } catch (e: any) {
        console.error("❌ [PRODUCT UPDATE] Error:", e);
        res.setHeader("Content-Type", "application/json");

        if (e.name === "ZodError") {
          const validationError = fromZodError(e);
          return res.status(400).json({ message: validationError.message });
        }

        return res.status(400).json({ message: e.message || "Update Failed" });
      }
    },
  );

  app.delete(
    "/api/products/:id",
    requireAuth,
    async (req: Request, res: Response) => {
      try {
        const userId = (req as any).userId;
        const productId = parseInt(req.params.id);

        res.setHeader("Content-Type", "application/json");
        const product = await storage.getProduct(productId);
        if (!product) {
          return res.status(404).json({ message: "Product not found" });
        }

        // Check if user is admin
        const user = await storage.getUser(userId);
        const isAdmin = user?.isAdmin || user?.role === "admin";

        const shop = await storage.getShop(product.shopId);
        if (!shop) {
          return res.status(404).json({ message: "Shop not found" });
        }

        // Allow delete if user owns the shop OR is admin
        if (shop.ownerId !== userId && !isAdmin) {
          return res
            .status(403)
            .json({ message: "Unauthorized deletion attempt" });
        }

        await storage.deleteProduct(productId);
        return res.sendStatus(204);
      } catch (e) {
        res.setHeader("Content-Type", "application/json");
        return res.status(500).json({ message: "Delete Failed" });
      }
    },
  );

  // ==========================================
  // 👮‍♂️ 4. ADMIN APIs
  // ==========================================
  app.get(
    "/api/admin/shops",
    requireAuth,
    requireAdmin,
    async (req: Request, res: Response) => {
      res.setHeader("Content-Type", "application/json");
      const shops = await storage.getShops();
      return res.json(shops);
    },
  );

  app.patch(
    "/api/shops/:id/approve",
    requireAuth,
    requireAdmin,
    async (req: Request, res: Response) => {
      res.setHeader("Content-Type", "application/json");
      const id = parseInt(req.params.id);
      const updated = await storage.updateShop(id, { approved: true } as any);
      return res.json(updated);
    },
  );

  // Verify Shop and Update User Role to Seller
  app.patch(
    "/api/shops/:id/verify",
    requireAuth,
    requireAdmin,
    async (req: Request, res: Response) => {
      try {
        res.setHeader("Content-Type", "application/json");
        const id = parseInt(req.params.id);
        const { ownerId } = req.body;

        // Update shop verification status
        const updatedShop = await storage.updateShop(id, { isVerified: true } as any);

        // Update user role to 'seller'
        if (ownerId) {
          await storage.updateUser(Number(ownerId), { role: "seller" });
        }

        return res.json({
          shop: updatedShop,
          message: "Shop verified and user role updated to seller",
        });
      } catch (e: any) {
        res.setHeader("Content-Type", "application/json");
        return res.status(400).json({ message: e.message || "Verification failed" });
      }
    },
  );

  // ==========================================
  // 📰 5. OFFERS & NEWS APIs
  // ==========================================
  app.get("/api/offers", async (req: Request, res: Response) => {
    try {
      res.setHeader("Content-Type", "application/json");
      const allOffers = await storage.getOffers();
      // Only return active offers to public
      const activeOffers = allOffers.filter(o => o.isActive);
      return res.json(activeOffers);
    } catch (e) {
      res.setHeader("Content-Type", "application/json");
      return res.status(500).json({ message: "Error fetching offers" });
    }
  });

  // Admin: Get all offers (including inactive)
  app.get(
    "/api/admin/offers",
    requireAuth,
    requireAdmin,
    async (req: Request, res: Response) => {
      try {
        res.setHeader("Content-Type", "application/json");
        const allOffers = await storage.getOffers();
        return res.json(allOffers);
      } catch (e) {
        res.setHeader("Content-Type", "application/json");
        return res.status(500).json({ message: "Error fetching offers" });
      }
    }
  );

  app.post(
    "/api/offers",
    requireAuth,
    requireAdmin,
    async (req: Request, res: Response) => {
      try {
        res.setHeader("Content-Type", "application/json");
        const offerData = insertOfferSchema.parse(req.body);
        const newOffer = await storage.createOffer(offerData);
        return res.json(newOffer);
      } catch (e: any) {
        res.setHeader("Content-Type", "application/json");
        return res.status(400).json({ message: e.message || "Invalid Offer Data" });
      }
    }
  );

  app.patch(
    "/api/offers/:id",
    requireAuth,
    requireAdmin,
    async (req: Request, res: Response) => {
      try {
        res.setHeader("Content-Type", "application/json");
        const id = parseInt(req.params.id);
        const updateData = insertOfferSchema.partial().parse(req.body);
        const updated = await storage.updateOffer(id, updateData);
        return res.json(updated);
      } catch (e: any) {
        res.setHeader("Content-Type", "application/json");
        return res.status(400).json({ message: e.message || "Update Failed" });
      }
    }
  );

  app.delete(
    "/api/offers/:id",
    requireAuth,
    requireAdmin,
    async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id);
        await storage.deleteOffer(id);
        return res.sendStatus(204);
      } catch (e) {
        res.setHeader("Content-Type", "application/json");
        return res.status(500).json({ message: "Delete Failed" });
      }
    }
  );

  return httpServer;
}
