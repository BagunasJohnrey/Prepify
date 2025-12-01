import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { calculateHearts } from "../utils/heartSystem.js";
import dotenv from "dotenv";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || "prepify_secure_secret";

export const register = async (req, res) => {
  const { username, password } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    const newUser = await User.create(username, hash);
    res.json(newUser);
  } catch (err) {
    res.status(400).json({ error: "Username likely already exists." });
  }
};

export const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findByUsername(username);
    if (!user) return res.status(400).json({ error: "User not found" });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(400).json({ error: "Invalid password" });

    // Handle heart logic
    const stats = calculateHearts(user);
    if (stats.hearts !== user.hearts) {
        await User.updateHearts(user.id, stats.hearts, stats.last_heart_update);
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET);
    
    res.json({ 
        token, 
        user: { 
            id: user.id, 
            username: user.username, 
            hearts: stats.hearts,
            xp: user.xp || 0,
            last_heart_update: stats.last_heart_update,
            role: user.role
        } 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const stats = calculateHearts(user);
    
    if (stats.hearts !== user.hearts) {
       await User.updateHearts(user.id, stats.hearts, stats.last_heart_update);
    }

    res.json({ 
        ...user, 
        hearts: stats.hearts, 
        last_heart_update: stats.last_heart_update 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const loseHeart = async (req, res) => {
    const { userId } = req.body;
    try {
        await User.decrementHeart(userId);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const addXp = async (req, res) => {
    const { amount } = req.body;
    try {
        await User.addXp(req.user.id, amount);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const buyHeart = async (req, res) => {
    const HEART_COST = 50; // Cost in XP
    try {
        await User.buyHeart(req.user.id, HEART_COST);
        res.json({ success: true });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};