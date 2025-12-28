import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import { registerRoutes } from "./routes";
import { setupVite } from "./vite";
import { serveStatic } from "./static";
import { createServer } from "http";

const app = express();

// ✅ CORS FIX: Allow requests from the Netlify live site
app.use(cors({
  origin: ["https://shahdol-bazaar-live.netlify.app", "http://localhost:5173", "http://localhost:5000"],
  credentials: true
}));

const httpServer = createServer(app);

// CRITICAL: Request logging middleware - AFTER route registration
app.use((req, res, next) => {
  if (req.path.startsWith("/api/")) {
    console.log("🔵 [REQUEST] Incoming API request:", req.method, req.path, req.originalUrl);
  }
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Logging Middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }
      console.log(logLine);
    }
  });

  next();
});

(async () => {
  // ✅ CRITICAL: Register API routes FIRST, before any other middleware
  console.log("🔵 [INDEX] ========================================");
  console.log("🔵 [INDEX] Step 1: Registering API routes FIRST...");
  await registerRoutes(httpServer, app);
  console.log("✅ [INDEX] API routes registered successfully");
  console.log("🔵 [INDEX] ========================================");

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.setHeader("Content-Type", "application/json");
    res.status(status).json({ message });
    console.error(err);
  });

  // ✅ CORRECT ORDER: API routes registered, now add Vite/Static (which skip /api routes)
  console.log("🔵 [INDEX] Step 2: Setting up Vite/Static middleware...");
  if (app.get("env") === "development") {
    await setupVite(app, httpServer);
    console.log("✅ [INDEX] Vite middleware setup complete");
  } else {
    serveStatic(app);
    console.log("✅ [INDEX] Static file serving setup complete");
  }

  const PORT = 5000;
  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`✅ Test endpoint: http://localhost:${PORT}/api/test`);
    console.log(`✅ Products endpoint: http://localhost:${PORT}/api/products/all`);
    console.log(`✅ Debug endpoint: http://localhost:${PORT}/api/debug/products`);
  });
})();
