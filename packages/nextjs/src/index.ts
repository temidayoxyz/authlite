import { AuthLite, AuthLiteResult, SafeUser, Session } from "@xyzintel/authlite-core";
import { cookies } from "next/headers";

export class NextAuthLite {
  private auth: AuthLite;
  private cookieName: string;
  private sessionMaxAge: number;

  constructor(auth: AuthLite) {
    this.auth = auth;
    this.cookieName = auth.getCookieName();
    this.sessionMaxAge = auth.getSessionMaxAge();
  }

  /**
   * Get the current session and user from cookies.
   * Works in Server Components, Server Actions, and Route Handlers.
   */
  async getSession(): Promise<{ user: SafeUser; session: Session } | null> {
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
      maxAge: this.sessionMaxAge,
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
      const result = await this.auth.signOut(token);
      if (!result.success) {
        return result;
      }
    }

    cookieStore.delete(this.cookieName);
    return { success: true };
  }
}
