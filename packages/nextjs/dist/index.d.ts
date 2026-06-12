import { AuthLite, User, Session, AuthLiteResult } from '@xyzintel/authlite-core';

declare class NextAuthLite {
    private auth;
    private cookieName;
    constructor(auth: AuthLite);
    /**
     * Get the current session and user from cookies.
     * Works in Server Components, Server Actions, and Route Handlers.
     */
    getSession(): Promise<{
        user: User;
        session: Session;
    } | null>;
    /**
     * Sign in and set the session cookie.
     */
    signIn(email: string, password: string): Promise<AuthLiteResult>;
    /**
     * Sign out and clear the session cookie.
     */
    signOut(): Promise<AuthLiteResult>;
}

export { NextAuthLite };
