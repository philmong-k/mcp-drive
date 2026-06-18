import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const DATA_FILE_PATH = path.join(process.cwd(), "workspace_data.json");

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse requests
  app.use(express.json());

  // Initialize Gemini AI client
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({
    apiKey: apiKey || "",
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // Live real chat API using Server-side Gemini API or custom Multi-model Routing
  app.post("/api/chat", async (req, res) => {
    try {
      const { contents, systemInstruction, config } = req.body;
      const provider = config?.activeProvider || "gemini";

      // If multi-model custom proxy is selected (OpenRouter or LM Studio)
      if (provider === "openrouter" && config?.openRouterKey) {
        try {
          console.log(`[Proxy] Forwarding chat completed route to OpenRouter: ${config.openRouterModel}`);
          const formattedMessages = contents.map((msg: any) => ({
            role: msg.role === "model" ? "assistant" : "user",
            content: msg.parts?.[0]?.text || ""
          }));

          const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${config.openRouterKey}`,
              "HTTP-Referer": "https://ai.studio",
              "X-Title": "Antigravity IDE Cockpit"
            },
            body: JSON.stringify({
              model: config.openRouterModel || "anthropic/claude-3.5-sonnet",
              messages: [
                { role: "system", content: systemInstruction || "You are Antigravity IDE AI Agent." },
                ...formattedMessages
              ],
              temperature: config.temperature ?? 0.7
            })
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`OpenRouter API responded with ${response.status}: ${errorText}`);
          }

          const data = await response.json();
          const replyText = data.choices?.[0]?.message?.content;
          if (replyText) {
            return res.json({ text: replyText });
          }
          throw new Error("No response text found in OpenRouter return payload");
        } catch (orError: any) {
          console.warn("OpenRouter fetch failed, falling back to Gemini:", orError);
          // fall through to Gemini!
        }
      } else if (provider === "lmstudio" && config?.lmStudioUrl) {
        try {
          console.log(`[Proxy] Target-routing search stream to local LM Studio Endpoint: ${config.lmStudioUrl}`);
          const formattedMessages = contents.map((msg: any) => ({
            role: msg.role === "model" ? "assistant" : "user",
            content: msg.parts?.[0]?.text || ""
          }));

          const cleanedUrl = config.lmStudioUrl.endsWith("/v1") 
            ? `${config.lmStudioUrl}/chat/completions` 
            : config.lmStudioUrl.endsWith("/chat/completions") 
              ? config.lmStudioUrl 
              : `${config.lmStudioUrl}/v1/chat/completions`;

          const response = await fetch(cleanedUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              messages: [
                { role: "system", content: systemInstruction || "You are Antigravity IDE AI Agent." },
                ...formattedMessages
              ],
              temperature: config.temperature ?? 0.7
            })
          });

          if (!response.ok) {
            throw new Error(`LM Studio responded with status code: ${response.status}`);
          }

          const data = await response.json();
          const replyText = data.choices?.[0]?.message?.content;
          if (replyText) {
            return res.json({ text: replyText });
          }
          throw new Error("No text content returned from local LM Studio");
        } catch (lmError: any) {
          console.warn("LM Studio forward failed, falling back to Gemini:", lmError);
          // fall through to Gemini!
        }
      }

      // Default backend Gemini connection
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
        config: {
          systemInstruction: systemInstruction || "You are Antigravity IDE AI Agent, an elite full-stack system management and MCP-enabled autonomous coding assistant. Respond in Korean (한국어로 상냥하고 전문적으로 대답해 주세요). You have capabilities of terminal control, file CRUD, multi-platform workspace setup, and infrastructure configuration design. Provide clean, actionable advice, bash script snippets, or configuration details.",
        }
      });
      
      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini API error:", error);
      res.status(500).json({ error: error?.message || "Failed to contact Gemini API. Please make sure GEMINI_API_KEY is configured in Settings > Secrets." });
    }
  });

  // Cross-device cloud sync API (PC <-> Mobile Live Sync Hub)
  const SNAPSHOTS_FILE_PATH = path.join(process.cwd(), "workspace_snapshots.json");

  app.get("/api/snapshots", async (req, res) => {
    try {
      if (fs.existsSync(SNAPSHOTS_FILE_PATH)) {
        const fileContent = await fs.promises.readFile(SNAPSHOTS_FILE_PATH, "utf-8");
        res.json(JSON.parse(fileContent));
      } else {
        res.json([]);
      }
    } catch (err) {
      console.error("Failed to read snapshots DB:", err);
      res.status(500).json({ error: "Failed to load snapshots list" });
    }
  });

  app.post("/api/snapshots", async (req, res) => {
    try {
      const snap = req.body;
      let currentSnaps = [];
      if (fs.existsSync(SNAPSHOTS_FILE_PATH)) {
        const fileContent = await fs.promises.readFile(SNAPSHOTS_FILE_PATH, "utf-8");
        try {
          currentSnaps = JSON.parse(fileContent);
        } catch {
          currentSnaps = [];
        }
      }
      currentSnaps.unshift(snap); // Newest on top
      await fs.promises.writeFile(SNAPSHOTS_FILE_PATH, JSON.stringify(currentSnaps, null, 2), "utf-8");
      res.json({ success: true, count: currentSnaps.length });
    } catch (err) {
      console.error("Failed to append snapshot:", err);
      res.status(500).json({ error: "Failed to persist checkpoint snapshot" });
    }
  });

  app.delete("/api/snapshots/:id", async (req, res) => {
    try {
      const { id } = req.params;
      let currentSnaps = [];
      if (fs.existsSync(SNAPSHOTS_FILE_PATH)) {
        const fileContent = await fs.promises.readFile(SNAPSHOTS_FILE_PATH, "utf-8");
        try {
          currentSnaps = JSON.parse(fileContent);
        } catch {
          currentSnaps = [];
        }
      }
      currentSnaps = currentSnaps.filter((s: any) => s.id !== id);
      await fs.promises.writeFile(SNAPSHOTS_FILE_PATH, JSON.stringify(currentSnaps, null, 2), "utf-8");
      res.json({ success: true, count: currentSnaps.length });
    } catch (err) {
      console.error("Failed to delete snapshot:", err);
      res.status(500).json({ error: "Failed to delete checkpoint snapshot" });
    }
  });

  app.put("/api/snapshots/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { title, payload } = req.body;
      let currentSnaps = [];
      if (fs.existsSync(SNAPSHOTS_FILE_PATH)) {
        const fileContent = await fs.promises.readFile(SNAPSHOTS_FILE_PATH, "utf-8");
        try {
          currentSnaps = JSON.parse(fileContent);
        } catch {
          currentSnaps = [];
        }
      }
      
      const snapIndex = currentSnaps.findIndex((s: any) => s.id === id);
      if (snapIndex !== -1) {
        if (title !== undefined) currentSnaps[snapIndex].title = title;
        if (payload !== undefined) {
          currentSnaps[snapIndex].payload = payload;
          currentSnaps[snapIndex].timestamp = new Date().toISOString(); // Update timestamp on content overwrite
        }
        await fs.promises.writeFile(SNAPSHOTS_FILE_PATH, JSON.stringify(currentSnaps, null, 2), "utf-8");
        res.json({ success: true, snapshot: currentSnaps[snapIndex] });
      } else {
        res.status(404).json({ error: "Snapshot not found" });
      }
    } catch (err) {
      console.error("Failed to update snapshot:", err);
      res.status(500).json({ error: "Failed to update checkpoint snapshot" });
    }
  });

  app.get("/api/sync", async (req, res) => {
    try {
      if (fs.existsSync(DATA_FILE_PATH)) {
        const fileContent = await fs.promises.readFile(DATA_FILE_PATH, "utf-8");
        res.json(JSON.parse(fileContent));
      } else {
        res.json({}); // Exclude payload if empty
      }
    } catch (err: any) {
      console.error("Failed to read sync data:", err);
      res.status(500).json({ error: "Failed to read database state" });
    }
  });

  app.post("/api/sync", async (req, res) => {
    try {
      const payload = req.body;
      await fs.promises.writeFile(DATA_FILE_PATH, JSON.stringify(payload, null, 2), "utf-8");
      res.json({ success: true, updated: new Date().toISOString() });
    } catch (err: any) {
      console.error("Failed to write sync data:", err);
      res.status(500).json({ error: "Failed to save state to server database" });
    }
  });

  // Vite middleware for development or serving assets in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
