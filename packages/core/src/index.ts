import { hash, verify } from "@node-rs/argon2";
import { createHmac, randomBytes } from "node:crypto";
import { AuthAdapter, AuthLiteConfig, AuthLiteResult, SafeUser, Session, User } from "./types";

export * from "./types";

export class AuthLite {
  private adapter: AuthAdapter;
  private config: Required<AuthLiteConfig>;

  constructor(adapter: AuthAdapter, config: AuthLiteConfig) {
    this.adapter = adapter;
    this.config = {
      secret: config.secret,
      sessionExpiryDays: config.sessionExpiryDays ?? 30,
      cookieName: config.cookieName ?? "authlite_session",
    };
  }

  getCookieName(): string {
    return this.config.cookieName;
  }

  getSessionExpiryDays(): number {
    return this.config.sessionExpiryDays;
  }

  getSessionMaxAge(): number {
    return this.config.sessionExpiryDays * 24 * 60 * 60;
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
  async signUp(email: string, password: string): Promise<AuthLiteResult<SafeUser>> {
    try {
      const existing = await this.adapter.getUserByEmail(email);
      if (existing) {
        return { success: false, error: "User already exists" };
      }

      const passwordHash = await hash(password);
      const user = await this.adapter.createUser(email, passwordHash);

      return { success: true, data: this.sanitizeUser(user) };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  /**
   * Sign in an existing user.
   */
  async signIn(email: string, password: string): Promise<AuthLiteResult<{ user: SafeUser; sessionToken: string }>> {
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
      
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + this.config.sessionExpiryDays);

      await this.adapter.createSession(user.id, tokenHash, expiresAt);

      return { success: true, data: { user: this.sanitizeUser(user), sessionToken } };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  /**
   * Validate a session token and return the associated user.
   */
  async validateSession(sessionToken: string): Promise<AuthLiteResult<{ user: SafeUser; session: Session }>> {
    try {
      const tokenHash = this.hashToken(sessionToken);
      const session = await this.adapter.getSessionByTokenHash(tokenHash);

      if (!session) {
        return { success: false, error: "Invalid session" };
      }

      if (session.expiresAt < new Date()) {
        await this.adapter.deleteSession(session.id);
        return { success: false, error: "Session expired" };
      }

      const user = await this.adapter.getUserById(session.userId);
      if (!user) {
        return { success: false, error: "User not found" };
      }

      return { success: true, data: { user: this.sanitizeUser(user), session } };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  /**
   * Sign out the user by deleting the session.
   */
  async signOut(sessionToken: string): Promise<AuthLiteResult> {
    try {
      const tokenHash = this.hashToken(sessionToken);
      const session = await this.adapter.getSessionByTokenHash(tokenHash);
      if (session) {
        await this.adapter.deleteSession(session.id);
      }
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  private generateSessionToken(): string {
    return randomBytes(32).toString("hex");
  }

  private sanitizeUser(user: User): Omit<User, "passwordHash"> {
    const { passwordHash, ...safe } = user;
    return safe;
  }

  private hashToken(token: string): string {
    return createHmac("sha256", this.config.secret)
      .update(token)
      .digest("hex");
  }
}
