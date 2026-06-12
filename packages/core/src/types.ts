export interface User {
  id: string;
  email: string;
  passwordHash: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type SafeUser = Omit<User, "passwordHash">;

export interface Session {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface AuthLiteConfig {
  secret: string;
  sessionExpiryDays?: number;
  cookieName?: string;
}

export interface AuthAdapter {
  // User operations
  createUser(email: string, passwordHash: string): Promise<User>;
  getUserByEmail(email: string): Promise<User | null>;
  getUserById(id: string): Promise<User | null>;
  
  // Session operations
  createSession(userId: string, tokenHash: string, expiresAt: Date): Promise<Session>;
  getSessionByTokenHash(tokenHash: string): Promise<Session | null>;
  deleteSession(id: string): Promise<void>;
  deleteUserSessions(userId: string): Promise<void>;
  
  // Optional: Initial setup
  initialize?(): Promise<void>;
}

export interface AuthLiteResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}
