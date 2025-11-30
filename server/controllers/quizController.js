import { z } from "zod";
import Quiz from "../models/Quiz.js";
import { parsePDFBuffer } from "../utils/pdfParser.js";
import { generateQuizQuestions } from "../utils/aiService.js";

const QuizSchema = z.array(z.object({
  question: z.string(),
  options: z.array(z.string()).length(4),
  answer: z.string(),
  explanation: z.string()
}));

export const getQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.getAll(req.query.course);
    res.json(quizzes);
  } catch (err) {
    console.error("GET Quizzes Error:", err);
    res.status(500).json({ error: err.message });
  }
};

export const getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ error: "Not found" });
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteQuiz = async (req, res) => {
    try {
        await Quiz.delete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        console.error("Delete Error:", err);
        res.status(500).json({ error: "Failed to delete quiz" });
    }
};

export const generateQuiz = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No PDF uploaded" });
  
  const { course, customTitle, numQuestions, difficulty, description } = req.body;
  const questionLimit = numQuestions || 10;

  try {
    console.log("1. Parsing PDF...");
    const text = await parsePDFBuffer(req.file.buffer);
    
    if (text.length < 50) {
      throw new Error("Not enough text extracted. The PDF might be scanned images.");
    }

    const truncatedText = text.length > 25000 
        ? text.substring(0, 25000) 
        : text;

    const prompt = `
      Create a strictly valid JSON exam based on the text below.
      
      CONTEXT:
      - Course Type: ${course}
      - Difficulty: ${difficulty}
      - Description/Focus: ${description || "General coverage"}
      - Count: ${questionLimit} questions.
      
      RULES:
      1. Return ONLY a JSON array. No Markdown blocks (no \`\`\`), no introduction, no conclusion.
      2. Multiple Choice: Must have exactly 4 options.
      3. [IMPORTANT] Do not use "All of the above", "None of the above", or "Both A and B" as options, because the frontend randomizes the order of options.
      4. The "answer" field must MATCH exactly one of the strings in "options".
      5. Provide a short "explanation" for why the answer is correct.

      JSON FORMAT:
      [
        {
          "question": "Question text here?",
          "options": ["Option A", "Option B", "Option C", "Option D"], 
          "answer": "Option A", 
          "explanation": "Because..."
        }
      ]

      TEXT DATA:
      ${truncatedText}
    `;

    console.log("2. Sending to OpenRouter...");
    const questions = await generateQuizQuestions(prompt);

    const validation = QuizSchema.safeParse(questions);
    
    if (!validation.success) {
        console.error("AI Validation Failed:", JSON.stringify(validation.error.format(), null, 2));
        throw new Error("AI generated invalid quiz format. Please try again.");
    }

    console.log("3. Saving to Database...");
    const title = customTitle || `Exam - ${new Date().toLocaleDateString()}`;
    
    const newQuiz = await Quiz.create(
        title, 
        course, 
        difficulty, 
        description, 
        JSON.stringify(questions), 
        questions.length
    );

    console.log("4. Success!");
    res.json(newQuiz);

  } catch (err) {
    console.error("GENERATION ERROR:", err);
    res.status(500).json({ error: "Failed to generate quiz. " + err.message });
  }
};