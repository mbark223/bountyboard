import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { pool } from "./db";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";
import magicLinkRoutes from "./auth/magicLinkRoutes";

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

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

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    log("Initializing server...");
    
    // Test database connection
    if (pool) {
      try {
        await pool.query("SELECT NOW()");
        log("Database connection successful");
      } catch (dbError) {
        log(`Database connection warning: ${dbError}`, "warn");
        log("Continuing without database - will retry on requests", "warn");
      }
    } else {
      log("Database not configured - running without database", "warn");
    }

    // Setup Replit Auth (must be before other routes)
    await setupAuth(app);
    registerAuthRoutes(app);
    log("Authentication configured");

    // Add magic link authentication routes
    app.use("/api", magicLinkRoutes);
    log("Magic link authentication routes configured");

    await registerRoutes(httpServer, app);
    log("Routes registered");

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      log(`Error: ${message}`, "error");
      res.status(status).json({ message });
    });

    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    if (process.env.NODE_ENV === "production") {
      serveStatic(app);
      log("Serving static files");
    } else {
      const { setupVite } = await import("./vite");
      await setupVite(httpServer, app);
      log("Vite development server configured");
    }

    // ALWAYS serve the app on the port specified in the environment variable PORT
    // Other ports are firewalled. Default to 5000 if not specified.
    // this serves both the API and the client.
    // It is the only port that is not firewalled.
    const port = parseInt(process.env.PORT || "5000", 10);
    
    await new Promise<void>((resolve, reject) => {
      const server = httpServer.listen(
        {
          port,
          host: "0.0.0.0",
          reusePort: true,
        },
        () => {
          log(`Server successfully started on port ${port}`);
          resolve();
        },
      );
      
      server.on("error", (err) => {
        log(`Failed to start server: ${err}`, "error");
        reject(err);
      });
    });
  } catch (error) {
    log(`Fatal error during startup: ${error}`, "error");
    console.error(error);
    process.exit(1);
  }
})();

// Handle uncaught errors
process.on("uncaughtException", (error) => {
  log(`Uncaught exception: ${error}`, "error");
  console.error(error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  log(`Unhandled rejection at ${promise}: ${reason}`, "error");
  console.error(reason);
  process.exit(1);
});
