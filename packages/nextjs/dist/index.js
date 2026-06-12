"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  NextAuthLite: () => NextAuthLite
});
module.exports = __toCommonJS(index_exports);
var import_headers = require("next/headers");
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
    const cookieStore = await (0, import_headers.cookies)();
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
    const cookieStore = await (0, import_headers.cookies)();
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
    const cookieStore = await (0, import_headers.cookies)();
    const token = cookieStore.get(this.cookieName)?.value;
    if (token) {
      await this.auth.signOut(token);
    }
    cookieStore.delete(this.cookieName);
    return { success: true };
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  NextAuthLite
});
