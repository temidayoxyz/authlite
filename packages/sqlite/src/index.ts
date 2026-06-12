import { AuthAdapter, Session, User } from "@xyzintel/authlite-core";
import Database from "better-sqlite3";
import { nanoid } from "nanoid";

export class SQLiteAdapter implements AuthAdapter {
  private db: Database.Database;

  constructor(dbPath: string | Database.Database) {
    if (typeof dbPath === "string") {
      this.db = new Database(dbPath);
    } else {
      this.db = dbPath;
    }
  }

  async initialize(): Promise<void> {
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

  async createUser(email: string, passwordHash: string): Promise<User> {
    const id = nanoid();
    const now = new Date();
    
    this.db.prepare(
      "INSERT INTO users (id, email, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?)"
    ).run(id, email, passwordHash, now.toISOString(), now.toISOString());

    return {
      id,
      email,
      passwordHash,
      emailVerified: false,
      createdAt: now,
      updatedAt: now,
    };
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const row = this.db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
    return row ? this.mapUser(row) : null;
  }

  async getUserById(id: string): Promise<User | null> {
    const row = this.db.prepare("SELECT * FROM users WHERE id = ?").get(id) as any;
    return row ? this.mapUser(row) : null;
  }

  async createSession(userId: string, tokenHash: string, expiresAt: Date): Promise<Session> {
    const id = nanoid();
    const now = new Date();
    
    this.db.prepare(
      "INSERT INTO sessions (id, user_id, token_hash, expires_at, created_at) VALUES (?, ?, ?, ?, ?)"
    ).run(id, userId, tokenHash, expiresAt.toISOString(), now.toISOString());

    return {
      id,
      userId,
      tokenHash,
      expiresAt,
      createdAt: now,
    };
  }

  async getSessionByTokenHash(tokenHash: string): Promise<Session | null> {
    const row = this.db.prepare("SELECT * FROM sessions WHERE token_hash = ?").get(tokenHash) as any;
    return row ? this.mapSession(row) : null;
  }

  async deleteSession(id: string): Promise<void> {
    this.db.prepare("DELETE FROM sessions WHERE id = ?").run(id);
  }

  async deleteUserSessions(userId: string): Promise<void> {
    this.db.prepare("DELETE FROM sessions WHERE user_id = ?").run(userId);
  }

  private mapUser(row: any): User {
    return {
      id: row.id,
      email: row.email,
      passwordHash: row.password_hash,
      emailVerified: row.email_verified === 1,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  private mapSession(row: any): Session {
    return {
      id: row.id,
      userId: row.user_id,
      tokenHash: row.token_hash,
      expiresAt: new Date(row.expires_at),
      createdAt: new Date(row.created_at),
    };
  }
}
