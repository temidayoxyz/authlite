import { AuthLite, AuthLiteResult, Session, User } from "@xyzintel/authlite-core";
import { cookies } from "next/headers";

export class NextAuthLite {
  private auth: AuthLite;
  private cookieName: string;

  constructor(auth: AuthLite) {
    this.auth = auth;
    this.cookieName = "authlite_session"; // Should match AuthLite config
  }

  /**
   * Get the current session and user from cookies.
   * Works in Server Components, Server Actions, and Route Handlers.
   */
  async getSession(): Promise<{ user: User; session: Session } | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get(this.cookieName)?.value;

    if (!token) return null;

    const result = await this.auth.validateSession(token);
    if (!result.success || !result.data) {
      return null;
    }

    return result.data;
  }

  /**
   * Sign in and set the session cookie.
   */
  async signIn(email: string, password: string): Promise<AuthLiteResult> {
    const result = await this.auth.signIn(email, password);
    if (!result.success) {
      return { success: false, error: result.error };
    }

    if (!result.data) {
      return { success: false, error: "Sign in failed" };
    }

    const { sessionToken } = result.data;
    const cookieStore = await cookies();
    
    cookieStore.set(this.cookieName, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return { success: true };
  }

  /**
   * Sign out and clear the session cookie.
   */
  async signOut(): Promise<AuthLiteResult> {
    const cookieStore = await cookies();
    const token = cookieStore.get(this.cookieName)?.value;

    if (token) {
      await this.auth.signOut(token);
    }

    cookieStore.delete(this.cookieName);
    return { success: true };
  }
}
