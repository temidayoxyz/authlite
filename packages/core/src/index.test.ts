import { describe, it, expect, beforeEach } from "vitest";
import { AuthLite } from "./index";
import { AuthAdapter, User, Session } from "./types";

class MockAdapter implements AuthAdapter {
  users: User[] = [];
  sessions: Session[] = [];

  async createUser(email: string, passwordHash: string): Promise<User> {
    const user: User = {
      id: Math.random().toString(),
      email,
      passwordHash,
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.push(user);
    return user;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.users.find((u) => u.email === email) || null;
  }

  async getUserById(id: string): Promise<User | null> {
    return this.users.find((u) => u.id === id) || null;
  }

  async createSession(userId: string, tokenHash: string, expiresAt: Date): Promise<Session> {
    const session: Session = {
      id: Math.random().toString(),
      userId,
      tokenHash,
      expiresAt,
      createdAt: new Date(),
    };
    this.sessions.push(session);
    return session;
  }

  async getSessionByTokenHash(tokenHash: string): Promise<Session | null> {
    return this.sessions.find((s) => s.tokenHash === tokenHash) || null;
  }

  async deleteSession(id: string): Promise<void> {
    this.sessions = this.sessions.filter((s) => s.id !== id);
  }

  async deleteUserSessions(userId: string): Promise<void> {
    this.sessions = this.sessions.filter((s) => s.userId !== userId);
  }
}

describe("AuthLite Core", () => {
  let auth: AuthLite;
  let adapter: MockAdapter;

  beforeEach(() => {
    adapter = new MockAdapter();
    auth = new AuthLite(adapter, { secret: "test-secret" });
  });

  it("should sign up a new user", async () => {
    const result = await auth.signUp("test@example.com", "password123");
    expect(result.success).toBe(true);
    expect(result.data?.email).toBe("test@example.com");
    expect(adapter.users.length).toBe(1);
  });

  it("should sign in an existing user", async () => {
    await auth.signUp("test@example.com", "password123");
    const result = await auth.signIn("test@example.com", "password123");
    expect(result.success).toBe(true);
    expect(result.data?.sessionToken).toBeDefined();
    expect(adapter.sessions.length).toBe(1);
  });

  it("should fail sign in with wrong password", async () => {
    await auth.signUp("test@example.com", "password123");
    const result = await auth.signIn("test@example.com", "wrongpassword");
    expect(result.success).toBe(false);
    expect(result.error).toBe("Invalid credentials");
  });

  it("should validate a valid session", async () => {
    await auth.signUp("test@example.com", "password123");
    const signInResult = await auth.signIn("test@example.com", "password123");
    const sessionToken = signInResult.data!.sessionToken;

    const validationResult = await auth.validateSession(sessionToken);
    expect(validationResult.success).toBe(true);
    expect(validationResult.data?.user.email).toBe("test@example.com");
  });

  it("should fail validation for invalid token", async () => {
    const result = await auth.validateSession("invalid-token");
    expect(result.success).toBe(false);
  });
});
