// src/index.ts
import { hash, verify } from "@node-rs/argon2";
import { createHash, randomBytes } from "crypto";
var AuthLite = class {
  adapter;
  config;
  constructor(adapter, config) {
    this.adapter = adapter;
    this.config = {
      secret: config.secret,
      sessionExpiryDays: config.sessionExpiryDays ?? 30,
      cookieName: config.cookieName ?? "authlite_session"
    };
  }
  /**
   * Initialize the database/adapter if needed.
   */
  async init() {
    if (this.adapter.initialize) {
      await this.adapter.initialize();
    }
  }
  /**
   * Create a new user account.
   */
  async signUp(email, password) {
    try {
      const existing = await this.adapter.getUserByEmail(email);
      if (existing) {
        return { success: false, error: "User already exists" };
      }
      const passwordHash = await hash(password);
      const user = await this.adapter.createUser(email, passwordHash);
      return { success: true, data: user };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }
  /**
   * Sign in an existing user.
   */
  async signIn(email, password) {
    try {
      const user = await this.adapter.getUserByEmail(email);
      if (!user) {
        return { success: false, error: "Invalid credentials" };
      }
      const isValid = await verify(user.passwordHash, password);
      if (!isValid) {
        return { success: false, error: "Invalid credentials" };
      }
      const sessionToken = this.generateSessionToken();
      const tokenHash = this.hashToken(sessionToken);
      const expiresAt = /* @__PURE__ */ new Date();
      expiresAt.setDate(expiresAt.getDate() + this.config.sessionExpiryDays);
      await this.adapter.createSession(user.id, tokenHash, expiresAt);
      return { success: true, data: { user, sessionToken } };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }
  /**
   * Validate a session token and return the associated user.
   */
  async validateSession(sessionToken) {
    try {
      const tokenHash = this.hashToken(sessionToken);
      const session = await this.adapter.getSessionByTokenHash(tokenHash);
      if (!session) {
        return { success: false, error: "Invalid session" };
      }
      if (session.expiresAt < /* @__PURE__ */ new Date()) {
        await this.adapter.deleteSession(session.id);
        return { success: false, error: "Session expired" };
      }
      const user = await this.adapter.getUserById(session.userId);
      if (!user) {
        return { success: false, error: "User not found" };
      }
      return { success: true, data: { user, session } };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }
  /**
   * Sign out the user by deleting the session.
   */
  async signOut(sessionToken) {
    try {
      const tokenHash = this.hashToken(sessionToken);
      const session = await this.adapter.getSessionByTokenHash(tokenHash);
      if (session) {
        await this.adapter.deleteSession(session.id);
      }
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }
  generateSessionToken() {
    return randomBytes(32).toString("hex");
  }
  hashToken(token) {
    return createHash("sha256").update(token + this.config.secret).digest("hex");
  }
};
export {
  AuthLite
};
