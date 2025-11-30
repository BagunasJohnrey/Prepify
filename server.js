import express from "express";
import cors from "cors";
import pg from "pg";
import multer from "multer";
import dotenv from "dotenv";
import { createRequire } from "module";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

dotenv.config();

const require = createRequire(import.meta.url);
const PDFParser = require("pdf2json");

const app = express();
const PORT = process.env.PORT || 3000;
const { Pool } = pg;
const JWT_SECRET = process.env.JWT_SECRET || "prepify_secure_secret";

// --- SMART FALLBACK MODELS ---
// If the first one fails (429 Rate Limit), the code will automatically try the next one.
const FREE_MODELS = [
  "google/gemini-2.0-flash-exp:free",           // Fast, but often busy
  "google/gemini-2.5-flash-lite-preview-09-2025",       // Good alternative
  "meta-llama/llama-3.3-70b-instruct:free",     // Very stable backup
  "deepseek/deepseek-r1-distill-llama-70b:free",
  "openai/gpt-oss-20b:free" // Another strong backup
];

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

// --- HELPER: Parse PDF ---
const parsePDFBuffer = (buffer) => {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser(this, 1);
    pdfParser.on("pdfParser_dataError", (errData) => reject(errData.parserError));
    pdfParser.on("pdfParser_dataReady", () => resolve(pdfParser.getRawTextContent()));
    pdfParser.parseBuffer(buffer);
  });
};

// --- HELPER: Calculate Hearts ---
const calculateHearts = (user) => {
  const MAX_HEARTS = 3;
  const REGEN_TIME_MS = 2 * 60 * 1000; // 2 minutes

  let { hearts, last_heart_update } = user;
  if (hearts >= MAX_HEARTS) return { hearts, last_heart_update: new Date() };

  const now = new Date();
  const lastUpdate = new Date(last_heart_update);
  const diff = now - lastUpdate;

  if (diff >= REGEN_TIME_MS) {
    const regained = Math.floor(diff / REGEN_TIME_MS);
    hearts = Math.min(MAX_HEARTS, hearts + regained);
    last_heart_update = now; 
  }
  return { hearts, last_heart_update };
};

// ==========================================
//               AUTH ROUTES
// ==========================================

app.post("/api/auth/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    // Default role is 'user'
    const result = await pool.query(
      "INSERT INTO users (username, password_hash, role) VALUES ($1, $2, 'user') RETURNING id, username",
      [username, hash]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: "Username likely already exists." });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
    if (result.rows.length === 0) return res.status(400).json({ error: "User not found" });

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(400).json({ error: "Invalid password" });

    const stats = calculateHearts(user);
    if (stats.hearts !== user.hearts) {
        await pool.query("UPDATE users SET hearts = $1, last_heart_update = $2 WHERE id = $3", 
          [stats.hearts, stats.last_heart_update, user.id]);
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET);
    
    res.json({ 
        token, 
        user: { 
            id: user.id, 
            username: user.username, 
            hearts: stats.hearts,
            role: user.role
        } 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/auth/me", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [decoded.id]);
    const user = result.rows[0];

    const stats = calculateHearts(user);
    
    if (stats.hearts !== user.hearts) {
       await pool.query("UPDATE users SET hearts = $1, last_heart_update = $2 WHERE id = $3", 
         [stats.hearts, stats.last_heart_update, user.id]);
    }

    res.json({ ...user, hearts: stats.hearts });
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
});

app.post("/api/user/lose-heart", async (req, res) => {
    const { userId } = req.body;
    try {
        await pool.query(
          "UPDATE users SET hearts = GREATEST(0, hearts - 1), last_heart_update = NOW() WHERE id = $1", 
          [userId]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
//               QUIZ ROUTES
// ==========================================

app.get("/api/quizzes", async (req, res) => {
  const { category, program } = req.query;
  try {
    let query = "SELECT id, title, category, program, items_count, created_at FROM quizzes WHERE category = $1";
    let params = [category];

    if (program && program !== "null" && program !== "") {
      query += " AND program = $2";
      params.push(program);
    }
    
    query += " ORDER BY created_at DESC";
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/quiz/:id", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM quizzes WHERE id = $1", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/quiz/:id", async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        
        const userRes = await pool.query("SELECT role FROM users WHERE id = $1", [decoded.id]);
        if (userRes.rows.length === 0 || userRes.rows[0].role !== 'admin') {
            return res.status(403).json({ error: "Access Denied: Admins Only" });
        }

        // Cleanup results first
        await pool.query("DELETE FROM results WHERE quiz_id = $1", [req.params.id]);
        await pool.query("DELETE FROM quizzes WHERE id = $1", [req.params.id]);

        res.json({ success: true });
    } catch (err) {
        console.error("Delete Error:", err);
        res.status(500).json({ error: "Failed to delete quiz" });
    }
});

// --- ROBUST GENERATE ROUTE ---
app.post("/api/generate", upload.single("pdfFile"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No PDF uploaded" });
  
  const { category, program, customTitle, numQuestions } = req.body;
  const questionLimit = numQuestions || 10;

  try {
    console.log("1. Parsing PDF...");
    const text = await parsePDFBuffer(req.file.buffer);
    
    console.log(`>> Extracted ${text.length} chars.`);
    if (text.length < 50) {
      throw new Error("Not enough text extracted. The PDF might be scanned images.");
    }

    const truncatedText = text.substring(0, 20000); 

    const prompt = `
      Create a strictly valid JSON exam based on the text below.
      Target: ${category} ${program}.
      Count: ${questionLimit} questions.
      
      RULES:
      1. For Multiple Choice questions, you MUST provide 4 options (A, B, C, D).
      2. For True/False questions, only provide 2 options (True, False).
      3. The "answer" field must be the EXACT string of the correct option.
      4. Return ONLY the JSON array. Do not use markdown blocks.

      JSON Structure:
      [
        {
          "question": "Question text?",
          "options": ["A. Option 1", "B. Option 2", "C. Option 3", "D. Option 4"], 
          "answer": "A. Option 1", 
          "explanation": "..."
        }
      ]

      Text:
      ${truncatedText}
    `;

    console.log("2. Sending to OpenRouter (Attempting models)...");
    
    let questions = null;
    let lastError = null;

    // --- FALLBACK LOOP ---
    for (const model of FREE_MODELS) {
        try {
            console.log(`>> Trying model: ${model}...`);
            
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": "http://localhost:3000",
                    "X-Title": "Prepify App"
                },
                body: JSON.stringify({
                    model: model,
                    messages: [{ role: "user", content: prompt }]
                })
            });

            if (!response.ok) {
                const errText = await response.text();
                // If rate limited (429) or overloaded (503), throw error to trigger next model
                throw new Error(`Status ${response.status} - ${errText}`);
            }

            const data = await response.json();
            
            if (!data.choices || !data.choices[0]) {
               throw new Error("Invalid structure from API");
            }

            let rawText = data.choices[0].message.content;
            // Robust cleanup for different models
            rawText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
            // Sometimes models add text before the JSON array
            const jsonStartIndex = rawText.indexOf('[');
            const jsonEndIndex = rawText.lastIndexOf(']');
            if (jsonStartIndex !== -1 && jsonEndIndex !== -1) {
                rawText = rawText.substring(jsonStartIndex, jsonEndIndex + 1);
            }

            questions = JSON.parse(rawText);
            console.log(`>> Success with ${model}!`);
            break; // Stop looping, we got data!

        } catch (err) {
            console.warn(`>> Model ${model} failed: ${err.message}`);
            lastError = err;
            // Continue to next model...
        }
    }

    if (!questions) {
        throw new Error("All AI models failed. Please try again later. Last error: " + lastError.message);
    }

    console.log("3. Saving to Database...");
    
    const title = customTitle || `Exam - ${new Date().toLocaleDateString()}`;
    const dbResult = await pool.query(
      "INSERT INTO quizzes (title, category, program, questions, items_count) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [title, category, program, JSON.stringify(questions), questions.length]
    );

    console.log("4. Success!");
    res.json(dbResult.rows[0]);

  } catch (err) {
    console.error("GENERATION ERROR:", err);
    res.status(500).json({ error: "Failed to generate quiz. " + err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Prepify Server running on port ${PORT}`);
});