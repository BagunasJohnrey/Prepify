import express from "express";
import cors from "cors";
import pg from "pg";
import multer from "multer";
import dotenv from "dotenv";
import { createRequire } from "module";

dotenv.config();

// --- PDF PARSER SETUP ---
const require = createRequire(import.meta.url);
const PDFParser = require("pdf2json");
// ------------------------

const app = express();
const PORT = process.env.PORT || 3000;
const { Pool } = pg;

// Database Connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

// --- HELPER: Parse PDF Buffer ---
const parsePDFBuffer = (buffer) => {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser(this, 1);
    pdfParser.on("pdfParser_dataError", (errData) => reject(errData.parserError));
    pdfParser.on("pdfParser_dataReady", () => {
      resolve(pdfParser.getRawTextContent());
    });
    pdfParser.parseBuffer(buffer);
  });
};

// --- ROUTES ---

app.get("/api/quizzes", async (req, res) => {
  const { category, program } = req.query;
  try {
    let query = "SELECT id, title, category, program, created_at FROM quizzes WHERE category = $1";
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

// --- NEW: GENERATE ROUTE (Using OpenRouter) ---
app.post("/api/generate", upload.single("pdfFile"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No PDF uploaded" });
  const { category, program } = req.body;

  try {
    console.log("1. Parsing PDF...");
    const text = await parsePDFBuffer(req.file.buffer);
    
    if (!text || text.length < 50) {
      throw new Error("Not enough text extracted from PDF.");
    }

    const truncatedText = text.substring(0, 15000); // Larger limit for OpenRouter models

    console.log("2. Sending to OpenRouter...");

    const prompt = `
      You are a teacher. Create a JSON exam based on the text provided.
      Target Audience: ${category} ${program ? '- ' + program : ''}.
      
      Requirements:
      - 10 Questions total.
      - Mix of Multiple Choice and True/False.
      - Output strictly valid JSON. DO NOT use markdown code blocks (no \`\`\`json).
      
      JSON Structure:
      [
        {
          "question": "Question text?",
          "options": ["Option A", "Option B", "Option C", "Option D"], 
          "answer": "Option A", 
          "explanation": "Why this answer is correct."
        }
      ]
      (For True/False, options should be ["True", "False"]).
      
      Text to analyze:
      ${truncatedText}
    `;

    // Fetch call to OpenRouter
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": "http://localhost:3000", // Required by OpenRouter
        "X-Title": "Prepify App",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        // You can change this to "google/gemini-2.5-flash-lite-preview-09-2025" if it becomes available
        model: "google/gemini-2.5-flash-lite-preview-09-2025", 
        messages: [
          {
            role: "user",
            content: prompt // Sending plain text prompt
          }
        ]
      })
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`OpenRouter API Error: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    
    // Extract Content
    let rawText = data.choices[0].message.content;
    
    // Clean up if the model adds markdown formatting
    rawText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    
    const questions = JSON.parse(rawText);

    console.log("3. Saving to Database...");
    const title = `Exam: ${program || category} - ${new Date().toLocaleDateString()}`;
    const dbResult = await pool.query(
      "INSERT INTO quizzes (title, category, program, questions) VALUES ($1, $2, $3, $4) RETURNING *",
      [title, category, program, JSON.stringify(questions)]
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