import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Proxy API for GAS
  app.all("/api/gas", async (req, res) => {
    const gasUrl = process.env.VITE_GAS_API_URL;
    if (!gasUrl) {
      return res.status(500).json({ error: "VITE_GAS_API_URL not configured" });
    }

    try {
      // GAS requires redirects and often behaves better with params only in URL for GET
      // and body for POST. Redundant params usually cause issues.
      const config: any = {
        method: req.method,
        url: gasUrl,
        headers: {
          "Content-Type": "application/json",
        },
        maxRedirects: 5,
        validateStatus: (status: number) => status >= 200 && status < 400, // Handle redirects? Axios usually does it.
      };

      if (req.method === "GET") {
        config.params = req.query;
      } else {
        config.data = req.body;
        // Some GAS actions prefer action in query even for POST
        if (req.query.action) {
          config.params = { action: req.query.action };
        }
      }

      const response = await axios(config);
      res.json(response.data);
    } catch (error: any) {
      const status = error.response?.status || 500;
      const message = error.response?.data || error.message;
      console.error("GAS Proxy Error:", status, message);
      res.status(status).json({ 
        error: "Failed to communicate with Google Apps Script",
        details: message 
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
