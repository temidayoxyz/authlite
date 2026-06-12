"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  SQLiteAdapter: () => SQLiteAdapter
});
module.exports = __toCommonJS(index_exports);
var import_better_sqlite3 = __toESM(require("better-sqlite3"));
var import_nanoid = require("nanoid");
var SQLiteAdapter = class {
  db;
  constructor(dbPath) {
    if (typeof dbPath === "string") {
      this.db = new import_better_sqlite3.default(dbPath);
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
    const id = (0, import_nanoid.nanoid)();
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
    const id = (0, import_nanoid.nanoid)();
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  SQLiteAdapter
});
