import express from "express";
import { Users, User } from "./db.js";
import { verifyPassword, hashPassword } from "./security.js";  // 👈 importa hashPassword
import jwt from "jsonwebtoken";
import { config } from "./config.js";

const router = express.Router();

// ==================== REGISTRO ====================
router.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Faltan datos" });
  }

  const exists = Users.findByUsername(username);
  if (exists) {
    return res.status(400).json({ error: "Usuario ya existe" });
  }

  const passwordHash = hashPassword(password);
  Users.create(username, passwordHash, "user");

  res.json({ success: true, message: "Usuario registrado" });
});

// ==================== LOGIN ====================
router.post("/login", (req, res) => {
  const { username, password } = req.body;
  const user: User | undefined = Users.findByUsername(username);

  if (!user) {
    return res.status(404).json({ error: "Usuario no existe" });
  }

  if (!verifyPassword(password, user.password_hash)) {
    return res.status(401).json({ error: "Contraseña incorrecta" });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    config.jwtSecret,
    { expiresIn: "1h" }
  );

  res.json({ success: true, token });
});

export default router;
