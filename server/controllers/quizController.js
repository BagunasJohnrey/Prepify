import Quiz from "../models/Quiz.js";
import { parsePDFBuffer } from "../utils/pdfParser.js";
import { generateQuizQuestions } from "../utils/aiService.js";

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
        // Double check admin role via DB in middleware or here if strictly needed
        // Assuming verifyAdmin middleware handled the role check
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
    
    console.log(`>> Extracted ${text.length} chars.`);
    if (text.length < 50) {
      throw new Error("Not enough text extracted. The PDF might be scanned images.");
    }

    const truncatedText = text.substring(0, 25000); 

    const prompt = `
      Create a strictly valid JSON exam based on the text below.
      
      CONTEXT:
      - Course Type: ${course}
      - Difficulty: ${difficulty}
      - Description/Focus: ${description || "General coverage"}
      - Count: ${questionLimit} questions.
      
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

    console.log("2. Sending to OpenRouter...");
    const questions = await generateQuizQuestions(prompt);

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