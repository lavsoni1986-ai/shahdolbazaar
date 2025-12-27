import { createServer as createViteServer } from "vite";
import type { Express } from "express";
import type { Server } from "http";
import path, { dirname } from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// ✅ ES MODULES FIX: __dirname manually banana padta hai
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function setupVite(app: Express, server: Server) {
  const vite = await createViteServer({
    server: {
      middlewareMode: true,
      hmr: { server },
    },
    appType: "custom",
  });

  // CRITICAL: Skip Vite middleware for API routes
  app.use((req, res, next) => {
    if (req.path.startsWith("/api/")) {
      console.log("⏭️ [VITE] Skipping Vite middleware for API route:", req.path);
      return next(); // Skip Vite, go to next middleware (API routes)
    }
    // For non-API routes, use Vite middleware
    vite.middlewares(req, res, next);
  });

  // IMPORTANT: Only serve HTML for non-API routes
  // API routes should be handled by routes.ts BEFORE this middleware
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    
    // Skip API routes - they should be handled by routes.ts
    if (url.startsWith("/api/")) {
      console.log("⚠️ [VITE] API route intercepted by Vite middleware:", url);
      return next(); // Let it fall through to API routes
    }
    
    try {
      // Ab ye line bina error ke chalegi
      const clientTemplate = path.resolve(
        __dirname,
        "..",
        "client",
        "index.html",
      );
      let template = fs.readFileSync(clientTemplate, "utf-8");

      template = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(template);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}
