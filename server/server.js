import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit"; 
import authRoutes from "./routes/authRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: ["http://localhost:5173", "https://prepify-exam-simulator.vercel.app/"], 
  credentials: true
}));


const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: "Too many requests from this IP, please try again later."
});
app.use("/api", limiter);

const generateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: "Generation limit reached. Please try again later."
});
app.use("/api/generate", generateLimiter);

app.use(express.json());

// Routes
app.use("/api/auth", authRoutes); 
app.use("/api", quizRoutes);      

app.listen(PORT, () => {
  console.log(`🚀 Prepify Server running on port ${PORT}`);
});