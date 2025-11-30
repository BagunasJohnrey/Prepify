import express from "express";
import * as authController from "../controllers/authController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/me", verifyToken, authController.getMe);
router.post("/lose-heart", authController.loseHeart); // Note: might want verifyToken here too?

export default router;