import express from "express";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, "db.json");
const UPLOADS_DIR = path.join(__dirname, "uploads");

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => cb(null, `profile_${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage });

function readDb() {
  const db = JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
  // Ensure settings exists
  if (!db.settings) {
    db.settings = {
      brandColor: "#7b2cff",
      brandColorLight: "#f5f0ff",
      yearsExperience: 5,
      identitiesCreated: 150,
      artsCreated: 500
    };
    writeDb(db);
  }
  return db;
}

function writeDb(data: any) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use("/uploads", express.static(UPLOADS_DIR));

  // --- API Routes ---

  // Middleware to ensure we handle errors and return JSON
  const apiErrorHandler = (err: any, req: any, res: any, next: any) => {
    console.error(`[API ERROR] ${req.method} ${req.url}:`, err);
    res.status(500).json({ error: "Internal Server Error", details: err.message });
  };

  // Settings
  app.get("/api/settings", (req, res) => {
    try {
      const db = readDb();
      res.json(db.settings);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to load settings" });
    }
  });

  app.put("/api/settings", (req, res) => {
    try {
      const { brandColor, brandColorLight, yearsExperience, identitiesCreated, artsCreated, pin } = req.body;
      const db = readDb();
      if (String(pin) !== String(db.admin.pin)) return res.status(403).json({ error: "Invalid PIN" });

      db.settings = { 
        brandColor: brandColor ?? db.settings.brandColor, 
        brandColorLight: brandColorLight ?? db.settings.brandColorLight,
        yearsExperience: yearsExperience ?? db.settings.yearsExperience,
        identitiesCreated: identitiesCreated ?? db.settings.identitiesCreated,
        artsCreated: artsCreated ?? db.settings.artsCreated
      };
      writeDb(db);
      res.json(db.settings);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to update settings" });
    }
  });

  // Portfolio
  app.get("/api/portfolio", (req, res) => {
    try {
      const db = readDb();
      res.json(db.portfolio);
    } catch (err: any) {
      console.error("Error reading portfolio:", err);
      res.status(500).json({ error: "Failed to load portfolio" });
    }
  });

  app.post("/api/portfolio", (req, res) => {
    try {
      const { title, description, images, category } = req.body;
      const rawPin = req.body.pin;
      const pin = typeof rawPin === 'string' ? rawPin.trim() : rawPin;
      const db = readDb();
      if (String(pin) !== String(db.admin.pin)) return res.status(403).json({ error: "Invalid PIN" });

      const newProject = {
        id: Date.now().toString(),
        title,
        description,
        images: images || [],
        category
      };
      db.portfolio.push(newProject);
      writeDb(db);
      res.json(newProject);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to create project" });
    }
  });

  // Multiple Uploads
  app.post("/api/upload-multiple", upload.array("images", 10), (req, res) => {
    try {
      const rawPin = req.body.pin;
      const pin = typeof rawPin === 'string' ? rawPin.trim() : rawPin;
      const db = readDb();
      if (String(pin) !== String(db.admin.pin)) return res.status(403).json({ error: "Invalid PIN" });
      if (!req.files || (req.files as any).length === 0) return res.status(400).json({ error: "No files uploaded" });

      const imageUrls = (req.files as any).map((file: any) => `/uploads/${file.filename}`);
      res.json({ imageUrls });
    } catch (err: any) {
      res.status(500).json({ error: "Upload failed" });
    }
  });

  app.delete("/api/portfolio/:id", (req, res) => {
    try {
      const adminPin = req.headers["x-admin-pin"];
      const bodyPin = req.body ? req.body.pin : undefined;
      const rawPin = adminPin || bodyPin;

      const pin = typeof rawPin === 'string' ? rawPin.trim() : rawPin;
      const { id } = req.params;
      console.log(`[DELETE PORTFOLIO] Attempting id=${id}, provided_pin=${pin}`);
      const db = readDb();
      
      if (String(pin) !== String(db.admin.pin)) {
        console.warn(`[DELETE PORTFOLIO] Unauthorized attempt with PIN ${pin}`);
        return res.status(403).json({ error: "Invalid PIN" });
      }

      const initialLength = db.portfolio.length;
      db.portfolio = db.portfolio.filter((p: any) => String(p.id) !== String(id));
      
      if (initialLength === db.portfolio.length) {
        console.warn(`[DELETE PORTFOLIO] Item ${id} not found in DB`);
        return res.status(404).json({ error: "Project not found" });
      }

      console.log(`[DELETE PORTFOLIO] Successfully deleted ${id}`);
      writeDb(db);
      res.json({ success: true });
    } catch (err: any) {
      console.error("[DELETE PORTFOLIO] Error:", err);
      res.status(500).json({ error: "Failed to delete project", details: err.message });
    }
  });

  // Services
  app.get("/api/services", (req, res) => {
    try {
      const db = readDb();
      res.json(db.services);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to load services" });
    }
  });

  app.post("/api/services", (req, res) => {
    try {
      const { title, description, iconName, pin } = req.body;
      const db = readDb();
      if (pin !== db.admin.pin) return res.status(403).json({ error: "Invalid PIN" });

      const newService = {
        id: Date.now().toString(),
        title,
        description,
        iconName
      };
      db.services.push(newService);
      writeDb(db);
      res.json(newService);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to create service" });
    }
  });

  app.delete("/api/services/:id", (req, res) => {
    try {
      const adminPin = req.headers["x-admin-pin"];
      const bodyPin = req.body ? req.body.pin : undefined;
      const rawPin = adminPin || bodyPin;

      const pin = typeof rawPin === 'string' ? rawPin.trim() : rawPin;
      const { id } = req.params;
      console.log(`[DELETE SERVICE] Attempting id=${id}, provided_pin=${pin}`);
      const db = readDb();
      
      if (String(pin) !== String(db.admin.pin)) {
        console.warn(`[DELETE SERVICE] Unauthorized attempt with PIN ${pin}`);
        return res.status(403).json({ error: "Invalid PIN" });
      }

      const initialLength = db.services.length;
      db.services = db.services.filter((s: any) => String(s.id) !== String(id));
      
      if (initialLength === db.services.length) {
        console.warn(`[DELETE SERVICE] Service ${id} not found in DB`);
        return res.status(404).json({ error: "Service not found" });
      }

      console.log(`[DELETE SERVICE] Successfully deleted ${id}`);
      writeDb(db);
      res.json({ success: true });
    } catch (err: any) {
      console.error("[DELETE SERVICE] Error:", err);
      res.status(500).json({ error: "Failed to delete service", details: err.message });
    }
  });

  // Contact
  app.get("/api/contact", (req, res) => {
    try {
      const db = readDb();
      res.json(db.contact);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to load contact" });
    }
  });

  app.put("/api/contact", (req, res) => {
    try {
      const { whatsapp, instagram, email, about, profileImageUrl, linkedin, twitter, facebook, github, gitlab, pin } = req.body;
      const db = readDb();
      if (pin !== db.admin.pin) return res.status(403).json({ error: "Invalid PIN" });

      db.contact = { 
        whatsapp, 
        instagram, 
        email, 
        about, 
        profileImageUrl: profileImageUrl || db.contact.profileImageUrl,
        linkedin,
        twitter,
        facebook,
        github,
        gitlab
      };
      writeDb(db);
      res.json(db.contact);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to update contact" });
    }
  });

  // Profile Upload
  app.post("/api/upload-profile", upload.single("profile"), (req, res) => {
    try {
      const { pin } = req.body;
      const db = readDb();
      if (pin !== db.admin.pin) return res.status(403).json({ error: "Invalid PIN" });
      if (!req.file) return res.status(400).json({ error: "No file uploaded" });

      const imageUrl = `/uploads/${req.file.filename}`;
      db.contact.profileImageUrl = imageUrl;
      writeDb(db);
      res.json({ imageUrl });
    } catch (err: any) {
      res.status(500).json({ error: "Upload failed" });
    }
  });

  // Auth
  app.post("/api/login", (req, res) => {
    try {
      const rawPin = req.body.pin;
      const pin = typeof rawPin === 'string' ? rawPin.trim() : rawPin;
      const db = readDb();
      if (String(pin) === String(db.admin.pin)) {
        res.json({ success: true });
      } else {
        res.status(401).json({ error: "Invalid PIN" });
      }
    } catch (err: any) {
      res.status(500).json({ error: "Login failed" });
    }
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
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
