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

  app.use(vite.middlewares);

  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
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
