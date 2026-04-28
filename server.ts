import express from "express";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

let logClients: { id: number; res: express.Response }[] = [];
const originalLog = console.log;
const originalWarn = console.warn;
const originalError = console.error;

function broadcastLog(type: string, args: any[]) {
  try {
    const message = args.map(arg => {
      if (arg instanceof Error) {
        return `${arg.message}\n${arg.stack || ''}`;
      }
      if (typeof arg === 'object' && arg !== null) {
        try { return JSON.stringify(arg, null, 2); } catch(e) { return String(arg); }
      }
      return String(arg);
    }).join(' ');
    
    const data = JSON.stringify({ type, message, timestamp: new Date().toISOString() });
    if (logClients.length > 0) {
      originalLog(`[BROADCAST] Sending log to ${logClients.length} clients`);
    }
    logClients.forEach(client => {
      try {
        client.res.write(`data: ${data}\n\n`);
      } catch (err) {
        // Client likely disconnected
      }
    });
  } catch (err) {
    // Avoid recursion
  }
}

console.log = (...args) => {
  originalLog(...args);
  broadcastLog('log', args);
};
console.warn = (...args) => {
  originalWarn(...args);
  broadcastLog('warn', args);
};
console.error = (...args) => {
  originalError(...args);
  broadcastLog('error', args);
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOADS_DIR = path.join(__dirname, "uploads");

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => cb(null, `profile_${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage });

// Supabase Client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("CRITICAL ERROR: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing.");
  console.error("Please set these environment variables in your hosting provider (ZimaOS, Docker, etc.)");
}

const supabase = createClient(
  supabaseUrl || "https://placeholder-url.supabase.co", 
  supabaseKey || "placeholder-key"
);

// Check connection and tables on startup
(async () => {
  console.log("[SUPABASE] Checking connection...");
  try {
    const { error: portfolioError } = await supabase.from("portfolio").select("id", { count: "estimated", head: true });
    if (portfolioError) {
      console.warn("[SUPABASE] 'portfolio' table check error:", portfolioError.message);
    } else {
      console.log("[SUPABASE] 'portfolio' table is accessible.");
    }
  } catch (err) {
    console.error("[SUPABASE] Startup check critical failure:", err);
  }
})();

async function getAdminPin() {
  const { data, error } = await supabase.from("admin").select("pin").eq("id", 1).single();
  if (error || !data) return "W9x#vL2k@M6pQ*R4"; // Fallback securely generated 16-char password
  return data.pin;
}

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || "3019", 10);

  app.use(express.json());
  app.use("/uploads", express.static(UPLOADS_DIR));
  app.use("/upload", express.static(UPLOADS_DIR)); // Alias for old links

  // --- API Routes ---

  const apiErrorHandler = (err: any, req: any, res: any, next: any) => {
    console.error(`[API ERROR] ${req.method} ${req.url}:`, err);
    res.status(500).json({ error: "Internal Server Error", details: err.message });
  };

  // Settings
  app.get("/api/settings", async (req, res) => {
    try {
      const { data, error } = await supabase.from("settings").select("*").eq("id", 1).single();
      const settingsData = data || {};
      res.json({
        brandColor: settingsData.brand_color || "#7b2cff",
        brandColorLight: settingsData.brand_color_light || "#f5f0ff",
        yearsExperience: settingsData.years_experience || 0,
        identitiesCreated: settingsData.identities_created || 0,
        artsCreated: settingsData.arts_created || 0
      });
    } catch (err: any) {
      console.error("[API] Failed to fetch settings:", err);
      // Return defaults even on error
      res.json({
        brandColor: "#7b2cff",
        brandColorLight: "#f5f0ff",
        yearsExperience: 5,
        identitiesCreated: 150,
        artsCreated: 500
      });
    }
  });

  app.put("/api/settings", async (req, res) => {
    try {
      const { brandColor, brandColorLight, yearsExperience, identitiesCreated, artsCreated, pin } = req.body;
      const actualPin = await getAdminPin();
      if (String(pin) !== String(actualPin)) return res.status(403).json({ error: "Invalid PIN" });

      const { data, error } = await supabase
        .from("settings")
        .update({
          brand_color: brandColor,
          brand_color_light: brandColorLight,
          years_experience: yearsExperience,
          identities_created: identitiesCreated,
          arts_created: artsCreated,
          updated_at: new Date()
        })
        .eq("id", 1)
        .select()
        .single();

      if (error) throw error;
      res.json({
        brandColor: data.brand_color,
        brandColorLight: data.brand_color_light,
        yearsExperience: data.years_experience,
        identitiesCreated: data.identities_created,
        artsCreated: data.arts_created
      });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to update settings" });
    }
  });

  // Portfolio
  app.get("/api/portfolio", async (req, res) => {
    try {
      const { data, error } = await supabase.from("portfolio").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      res.json((data || []).map(p => ({
        ...p,
        id: String(p.id)
      })));
    } catch (err: any) {
      console.error("[API] Failed to load portfolio:", err);
      res.status(500).json({ error: "Failed to load portfolio", details: err.message });
    }
  });

  app.post("/api/portfolio", async (req, res) => {
    try {
      const { title, description, images, category, pin } = req.body;
      console.log(`[CREATE PROJECT] Attempting to create: "${title}" in category: "${category}"`);
      
      const actualPin = await getAdminPin();
      if (String(pin) !== String(actualPin)) {
        console.warn(`[CREATE PROJECT] PIN mismatch. Received: ${pin}`);
        return res.status(403).json({ error: "Invalid PIN" });
      }

      if (!title) return res.status(400).json({ error: "Title is required" });

      const { data, error } = await supabase
        .from("portfolio")
        .insert([{ 
          title, 
          description, 
          images: images || [], 
          category: category || "Identidade visual" 
        }])
        .select()
        .single();

      if (error) {
        console.error("[SUPABASE ERROR] Create project insert failure:", error);
        return res.status(400).json({ error: "Database rejected insertion", details: error.message });
      }

      console.log(`[CREATE PROJECT] Success. New Project ID: ${data.id}`);
      res.json({ ...data, id: String(data.id) });
    } catch (err: any) {
      console.error("[API ERROR] Create project critical failure:", err);
      res.status(500).json({ error: "Failed to create project", details: err.message });
    }
  });

  app.post("/api/upload-multiple", upload.array("images", 10), async (req, res) => {
    try {
      const rawPin = req.body.pin;
      const actualPin = await getAdminPin();
      if (String(rawPin) !== String(actualPin)) return res.status(403).json({ error: "Invalid PIN" });
      if (!req.files || (req.files as any).length === 0) return res.status(400).json({ error: "No files uploaded" });

      const imageUrls = (req.files as any).map((file: any) => `/uploads/${file.filename}`);
      res.json({ imageUrls });
    } catch (err: any) {
      res.status(500).json({ error: "Upload failed" });
    }
  });

  app.delete("/api/portfolio/:id", async (req, res) => {
    try {
      const adminPin = req.headers["x-admin-pin"];
      const rawPin = adminPin;
      const actualPin = await getAdminPin();

      console.log(`[DELETE PORTFOLIO] Attempt for ID: ${req.params.id}`);
      const receivedPin = String(rawPin || "").trim();
      const expectedPin = String(actualPin || "").trim();
      
      console.log(`[DELETE PORTFOLIO] Auth: Received [${receivedPin}], Expected [${expectedPin}]`);

      if (receivedPin !== expectedPin) {
        console.warn(`[DELETE PORTFOLIO] Access Denied: PIN mismatch.`);
        return res.status(403).json({ error: "Invalid PIN. Please check your credentials." });
      }

      const idToDelete = req.params.id;
      console.log(`[DELETE PORTFOLIO] Executing Supabase delete for ID: ${idToDelete}`);
      
      const { data, error } = await supabase
        .from("portfolio")
        .delete()
        .eq("id", idToDelete)
        .select();

      if (error) {
        console.error("[SUPABASE ERROR] Delete operation failed:", error);
        return res.status(400).json({ error: "Database error during deletion", details: error.message });
      }

      let deletedRows = data?.length || 0;
      console.log(`[DELETE PORTFOLIO] String match result: ${deletedRows} rows`);
      
      // If no rows deleted and ID is numeric, try numeric match
      if (deletedRows === 0 && !isNaN(Number(idToDelete))) {
        const numericId = Number(idToDelete);
        console.log(`[DELETE PORTFOLIO] Retrying with Numeric ID: ${numericId}`);
        const { data: numData, error: numError } = await supabase
          .from("portfolio")
          .delete()
          .eq("id", numericId)
          .select();
        
        if (!numError && numData && numData.length > 0) {
          deletedRows = numData.length;
          console.log(`[DELETE PORTFOLIO] Success with numeric match.`);
        } else if (numError) {
          console.error("[SUPABASE ERROR] Numeric delete failed:", numError);
        }
      }

      console.log(`[DELETE PORTFOLIO] Final Result: ${deletedRows} rows affected.`);
      res.json({ success: true, count: deletedRows });
    } catch (err: any) {
      console.error("[API ERROR] Delete project critical failure:", err);
      res.status(500).json({ error: "Failed to delete project", details: err.message });
    }
  });

  // Services
  app.get("/api/services", async (req, res) => {
    try {
      const { data, error } = await supabase.from("services").select("*").order("created_at", { ascending: true });
      if (error) throw error;
      res.json((data || []).map(s => ({ ...s, id: String(s.id), iconName: s.icon_name })));
    } catch (err: any) {
      console.error("[API] Failed to load services:", err);
      res.status(500).json({ error: "Failed to load services", details: err.message });
    }
  });

  app.post("/api/services", async (req, res) => {
    try {
      const { title, description, iconName, pin } = req.body;
      const actualPin = await getAdminPin();
      if (String(pin) !== String(actualPin)) return res.status(403).json({ error: "Invalid PIN" });

      const { data, error } = await supabase
        .from("services")
        .insert([{ title, description, icon_name: iconName }])
        .select()
        .single();

      if (error) throw error;
      res.json({ ...data, id: String(data.id), iconName: data.icon_name });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to create service" });
    }
  });

  app.delete("/api/services/:id", async (req, res) => {
    try {
      const adminPin = req.headers["x-admin-pin"];
      const rawPin = adminPin;
      const actualPin = await getAdminPin();

      console.log(`[DELETE SERVICE] ID: ${req.params.id}`);
      const receivedPin = String(rawPin || "").trim();
      const expectedPin = String(actualPin || "").trim();

      if (receivedPin !== expectedPin) {
        console.warn(`[DELETE SERVICE] Unauthorized attempt: PIN mismatch.`);
        return res.status(403).json({ error: "Invalid PIN" });
      }

      const { data, error } = await supabase
        .from("services")
        .delete()
        .eq("id", req.params.id)
        .select();

      if (error) {
        console.error("[SUPABASE ERROR] Delete service failed:", error);
        return res.status(400).json({ error: "Database error during deletion", details: error.message });
      }

      let deletedRows = data?.length || 0;

      if (deletedRows === 0 && !isNaN(Number(req.params.id))) {
        const { data: numData, error: numError } = await supabase
          .from("services")
          .delete()
          .eq("id", Number(req.params.id))
          .select();
        
        if (!numError && numData && numData.length > 0) {
          deletedRows = numData.length;
        }
      }

      console.log(`[DELETE SERVICE] Success. Rows affected: ${deletedRows}`);
      res.json({ success: true, count: deletedRows });
    } catch (err: any) {
      console.error("[API ERROR] Delete service critical failure:", err);
      res.status(500).json({ error: "Failed to delete service", details: err.message });
    }
  });

  // Contact
  app.get("/api/contact", async (req, res) => {
    try {
      const { data, error } = await supabase.from("contact").select("*").eq("id", 1).single();
      const contactData = data || {};
      res.json({
        whatsapp: contactData.whatsapp || "",
        instagram: contactData.instagram || "",
        email: contactData.email || "",
        about: contactData.about || "",
        profileImageUrl: contactData.profile_image_url || "",
        linkedin: contactData.linkedin || "",
        twitter: contactData.twitter || "",
        facebook: contactData.facebook || "",
        github: contactData.github || "",
        gitlab: contactData.gitlab || ""
      });
    } catch (err: any) {
      console.error("[API] Failed to load contact:", err);
      res.json({
        whatsapp: "",
        instagram: "",
        email: "",
        about: "",
        profileImageUrl: "",
        linkedin: "",
        twitter: "",
        facebook: "",
        github: "",
        gitlab: ""
      });
    }
  });

  app.put("/api/contact", async (req, res) => {
    try {
      const { whatsapp, instagram, email, about, profileImageUrl, linkedin, twitter, facebook, github, gitlab, pin } = req.body;
      const actualPin = await getAdminPin();
      if (String(pin) !== String(actualPin)) return res.status(403).json({ error: "Invalid PIN" });

      const { data, error } = await supabase
        .from("contact")
        .update({
          whatsapp,
          instagram,
          email,
          about,
          profile_image_url: profileImageUrl,
          linkedin,
          twitter,
          facebook,
          github,
          gitlab,
          updated_at: new Date()
        })
        .eq("id", 1)
        .select()
        .single();

      if (error) throw error;
      res.json({
        whatsapp: data.whatsapp,
        instagram: data.instagram,
        email: data.email,
        about: data.about,
        profileImageUrl: data.profile_image_url,
        linkedin: data.linkedin,
        twitter: data.twitter,
        facebook: data.facebook,
        github: data.github,
        gitlab: data.gitlab
      });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to update contact" });
    }
  });

  // Profile Upload
  app.post("/api/upload-profile", upload.single("profile"), async (req, res) => {
    try {
      const { pin } = req.body;
      const actualPin = await getAdminPin();
      if (String(pin) !== String(actualPin)) return res.status(403).json({ error: "Invalid PIN" });
      if (!req.file) return res.status(400).json({ error: "No file uploaded" });

      const imageUrl = `/uploads/${req.file.filename}`;
      
      const { error } = await supabase
        .from("contact")
        .update({ profile_image_url: imageUrl, updated_at: new Date() })
        .eq("id", 1);

      if (error) throw error;
      res.json({ imageUrl });
    } catch (err: any) {
      res.status(500).json({ error: "Upload failed" });
    }
  });

  // Auth
  app.post("/api/login", async (req, res) => {
    try {
      const { pin } = req.body;
      const actualPin = await getAdminPin();
      if (String(pin) === String(actualPin)) {
        res.json({ success: true });
      } else {
        res.status(401).json({ error: "Invalid PIN" });
      }
    } catch (err: any) {
      console.error("[API] Login critical failure:", err);
      res.status(500).json({ error: "Login failed", details: err.message });
    }
  });

  app.get("/api/logs/stream", (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable Nginx buffering
    res.flushHeaders();

    const client = { id: Date.now(), res };
    logClients.push(client);

    // Initial message to confirm connection
    res.write(`data: ${JSON.stringify({ type: 'system', message: 'SSE Connection Established', timestamp: new Date().toISOString() })}\n\n`);

    // Heartbeat every 15 seconds to keep Cloud Run / Proxy connection alive
    const heartbeat = setInterval(() => {
      res.write(': heartbeat\n\n');
    }, 15000);

    req.on('close', () => {
      clearInterval(heartbeat);
      logClients = logClients.filter(c => c.id !== client.id);
    });
  });

  app.get("/api/logs/test", (req, res) => {
    console.log("Test log from /api/logs/test at " + new Date().toLocaleTimeString());
    res.json({ success: true, message: "Logged test message" });
  });

  app.use("/api/*", apiErrorHandler);

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "dist");
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    } else {
      app.get("*", (req, res) => {
        res.send("<h1>Aviso do Servidor</h1><p>Diretório 'dist' não encontrado. Certifique-se de que o build foi executado corretamente.</p>");
      });
    }
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
