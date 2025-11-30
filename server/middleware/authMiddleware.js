import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || "prepify_secure_secret";

export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Attach user info to request
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

export const verifyAdmin = (req, res, next) => {
    // Requires verifyToken to run first
    // Note: In your original code you queried the DB to check role. 
    // If the role is in the token, we can check req.user.role directly.
    // If you prefer strict DB check, you can invoke User model here.
    if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: "Access Denied: Admins Only" });
    }
    next();
};