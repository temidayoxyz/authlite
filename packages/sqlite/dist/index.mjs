// src/index.ts
import Database from "better-sqlite3";
import { nanoid } from "nanoid";
var SQLiteAdapter = class {
  db;
  constructor(dbPath) {
    if (typeof dbPath === "string") {
      this.db = new Database(dbPath);
    } else {
      this.db = dbPath;
    }
  }
  async initialize() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        email_verified INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        token_hash TEXT NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_sessions_token_hash ON sessions(token_hash);
    `);
  }
  async createUser(email, passwordHash) {
    const id = nanoid();
    const now = /* @__PURE__ */ new Date();
    this.db.prepare(
      "INSERT INTO users (id, email, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?)"
    ).run(id, email, passwordHash, now.toISOString(), now.toISOString());
    return {
      id,
      email,
      passwordHash,
      emailVerified: false,
      createdAt: now,
      updatedAt: now
    };
  }
  async getUserByEmail(email) {
    const row = this.db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    return row ? this.mapUser(row) : null;
  }
  async getUserById(id) {
    const row = this.db.prepare("SELECT * FROM users WHERE id = ?").get(id);
    return row ? this.mapUser(row) : null;
  }
  async createSession(userId, tokenHash, expiresAt) {
    const id = nanoid();
    const now = /* @__PURE__ */ new Date();
    this.db.prepare(
      "INSERT INTO sessions (id, user_id, token_hash, expires_at, created_at) VALUES (?, ?, ?, ?, ?)"
    ).run(id, userId, tokenHash, expiresAt.toISOString(), now.toISOString());
    return {
      id,
      userId,
      tokenHash,
      expiresAt,
      createdAt: now
    };
  }
  async getSessionByTokenHash(tokenHash) {
    const row = this.db.prepare("SELECT * FROM sessions WHERE token_hash = ?").get(tokenHash);
    return row ? this.mapSession(row) : null;
  }
  async deleteSession(id) {
    this.db.prepare("DELETE FROM sessions WHERE id = ?").run(id);
  }
  async deleteUserSessions(userId) {
    this.db.prepare("DELETE FROM sessions WHERE user_id = ?").run(userId);
  }
  mapUser(row) {
    return {
      id: row.id,
      email: row.email,
      passwordHash: row.password_hash,
      emailVerified: row.email_verified === 1,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }
  mapSession(row) {
    return {
      id: row.id,
      userId: row.user_id,
      tokenHash: row.token_hash,
      expiresAt: new Date(row.expires_at),
      createdAt: new Date(row.created_at)
    };
  }
};
export {
  SQLiteAdapter
};
