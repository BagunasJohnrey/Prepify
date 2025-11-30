import pool from "../config/db.js";

export default {
  async create(username, passwordHash) {
    const result = await pool.query(
      "INSERT INTO users (username, password_hash, role) VALUES ($1, $2, 'user') RETURNING id, username",
      [username, passwordHash]
    );
    return result.rows[0];
  },

  async findByUsername(username) {
    const result = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
    return result.rows[0];
  },

  async findById(id) {
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    return result.rows[0];
  },

  async updateHearts(id, hearts, lastHeartUpdate) {
    await pool.query(
      "UPDATE users SET hearts = $1, last_heart_update = $2 WHERE id = $3",
      [hearts, lastHeartUpdate, id]
    );
  },

  async decrementHeart(id) {
    await pool.query(
      "UPDATE users SET hearts = GREATEST(0, hearts - 1), last_heart_update = NOW() WHERE id = $1",
      [id]
    );
  }
};