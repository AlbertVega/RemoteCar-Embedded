import Database from "better-sqlite3";
import { config } from "./config.js";
import { hashPassword } from "./security.js";
import fs from "node:fs";
import path from "node:path";

const dir = path.dirname(config.dbPath);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

export const db = new Database(config.dbPath);

// ==================== Definición del tipo User ====================
export interface User {
  id: number;
  username: string;
  password_hash: string;
  role: "user" | "admin";
  created_at: string;
}

// ==================== Creación de tabla ====================
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

// ==================== Semilla usuario admin ====================
const row = db.prepare("SELECT 1 FROM users WHERE username = ?").get(config.adminUser || "admin");
if (!row) {
  const adminUser = config.adminUser || "admin";
  const adminPass = config.adminPassword || cryptoRandom();
  const hash = hashPassword(adminPass);
  db.prepare("INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)").run(adminUser, hash, "admin");
  console.log(`[seed] Usuario admin creado: ${adminUser} (contraseña temporal: ${adminPass})`);
}

function cryptoRandom() {
  return Math.random().toString(36).slice(-10);
}

// ==================== API de usuarios ====================
export const Users = {
  findByUsername(username: string): User | undefined {
    return db.prepare("SELECT * FROM users WHERE username = ?").get(username) as User | undefined;
  },

  create(username: string, password: string, role: "user" | "admin" = "user"): void {
    const hash = hashPassword(password);
    db.prepare("INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)").run(username, hash, role);
  },

  list(): Omit<User, "password_hash">[] {
    return db.prepare("SELECT id, username, role, created_at FROM users ORDER BY id DESC").all() as Omit<User, "password_hash">[];
  }
};
