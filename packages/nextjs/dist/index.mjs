// src/index.ts
import { cookies } from "next/headers";
var NextAuthLite = class {
  auth;
  cookieName;
  constructor(auth) {
    this.auth = auth;
    this.cookieName = "authlite_session";
  }
  /**
   * Get the current session and user from cookies.
   * Works in Server Components, Server Actions, and Route Handlers.
   */
  async getSession() {
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
  async signIn(email, password) {
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
      maxAge: 60 * 60 * 24 * 30
      // 30 days
    });
    return { success: true };
  }
  /**
   * Sign out and clear the session cookie.
   */
  async signOut() {
    const cookieStore = await cookies();
    const token = cookieStore.get(this.cookieName)?.value;
    if (token) {
      await this.auth.signOut(token);
    }
    cookieStore.delete(this.cookieName);
    return { success: true };
  }
};
export {
  NextAuthLite
};
