import { AuthAdapter, User, Session } from '@xyzintel/authlite-core';
import Database from 'better-sqlite3';

declare class SQLiteAdapter implements AuthAdapter {
    private db;
    constructor(dbPath: string | Database.Database);
    initialize(): Promise<void>;
    createUser(email: string, passwordHash: string): Promise<User>;
    getUserByEmail(email: string): Promise<User | null>;
    getUserById(id: string): Promise<User | null>;
    createSession(userId: string, tokenHash: string, expiresAt: Date): Promise<Session>;
    getSessionByTokenHash(tokenHash: string): Promise<Session | null>;
    deleteSession(id: string): Promise<void>;
    deleteUserSessions(userId: string): Promise<void>;
    private mapUser;
    private mapSession;
}

export { SQLiteAdapter };
