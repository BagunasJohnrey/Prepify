import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes); // Prefixes /api/auth to all auth routes
app.use("/api", quizRoutes);      // Prefixes /api to all quiz routes (e.g. /api/quizzes)

// Note: In your original server.js, the user routes were:
// /api/auth/... -> Matches authRoutes
// /api/user/lose-heart -> Matches authRoutes (if you mount it there)
// /api/quizzes -> Matches quizRoutes

app.listen(PORT, () => {
  console.log(`🚀 Prepify Server running on port ${PORT}`);
});