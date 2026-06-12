interface User {
    id: string;
    email: string;
    passwordHash: string;
    emailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
}
interface Session {
    id: string;
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    createdAt: Date;
}
interface AuthLiteConfig {
    secret: string;
    sessionExpiryDays?: number;
    cookieName?: string;
}
interface AuthAdapter {
    createUser(email: string, passwordHash: string): Promise<User>;
    getUserByEmail(email: string): Promise<User | null>;
    getUserById(id: string): Promise<User | null>;
    createSession(userId: string, tokenHash: string, expiresAt: Date): Promise<Session>;
    getSessionByTokenHash(tokenHash: string): Promise<Session | null>;
    deleteSession(id: string): Promise<void>;
    deleteUserSessions(userId: string): Promise<void>;
    initialize?(): Promise<void>;
}
interface AuthLiteResult<T = void> {
    success: boolean;
    data?: T;
    error?: string;
}

declare class AuthLite {
    private adapter;
    private config;
    constructor(adapter: AuthAdapter, config: AuthLiteConfig);
    /**
     * Initialize the database/adapter if needed.
     */
    init(): Promise<void>;
    /**
     * Create a new user account.
     */
    signUp(email: string, password: string): Promise<AuthLiteResult<User>>;
    /**
     * Sign in an existing user.
     */
    signIn(email: string, password: string): Promise<AuthLiteResult<{
        user: User;
        sessionToken: string;
    }>>;
    /**
     * Validate a session token and return the associated user.
     */
    validateSession(sessionToken: string): Promise<AuthLiteResult<{
        user: User;
        session: Session;
    }>>;
    /**
     * Sign out the user by deleting the session.
     */
    signOut(sessionToken: string): Promise<AuthLiteResult>;
    private generateSessionToken;
    private hashToken;
}

export { type AuthAdapter, AuthLite, type AuthLiteConfig, type AuthLiteResult, type Session, type User };
