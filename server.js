// server.js
import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import multer from "multer";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const quizzesDir = path.join(__dirname, "quizzes");
if (!fs.existsSync(quizzesDir)) fs.mkdirSync(quizzesDir);

// Multer setup (store in memory)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// 🧩 Get all quiz filenames
app.get("/api/quizzes", (req, res) => {
  const files = fs.readdirSync(quizzesDir).filter(f => f.endsWith(".json"));
  res.json(files);
});

// 🧠 Get quiz content
app.get("/api/quiz/:name", (req, res) => {
  const filePath = path.join(quizzesDir, req.params.name);
  if (!fs.existsSync(filePath))
    return res.status(404).json({ error: "Quiz not found" });

  const quiz = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  res.json(quiz);
});

// 📤 Upload new quiz file
app.post("/api/upload", upload.single("quizFile"), (req, res) => {
  try {
    const fileContent = req.file.buffer.toString("utf-8");
    const quizData = JSON.parse(fileContent);

    // Validate format
    if (!quizData.title || !Array.isArray(quizData.questions))
      return res.status(400).json({ error: "Invalid quiz format" });

    // Generate filename from title
    const fileName = quizData.title.toLowerCase().replace(/\s+/g, "-") + ".json";
    const filePath = path.join(quizzesDir, fileName);

    fs.writeFileSync(filePath, JSON.stringify(quizData, null, 2));
    res.json({ message: "Quiz uploaded successfully!", fileName });
  } catch (err) {
    res.status(400).json({ error: "Invalid JSON or upload failed." });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
