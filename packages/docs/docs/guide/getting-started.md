# Getting Started

AuthLite is a modular authentication library. To get started, you'll need the core package and a database adapter.

## Installation

Install the core package and the SQLite adapter (recommended for starting):

```bash
npm install @xyzintel/authlite-core @xyzintel/authlite-sqlite better-sqlite3
```

If you are using Next.js, also install the Next.js helper:

```bash
npm install @xyzintel/authlite-nextjs
```

## Basic Setup

### 1. Initialize the Adapter

The adapter handles the database connection and schema.

```typescript
import { SQLiteAdapter } from "@xyzintel/authlite-sqlite";

const adapter = new SQLiteAdapter("auth.db");
```

### 2. Create the Auth Instance

The core `AuthLite` class contains the main logic. The `secret` is used to sign session tokens with HMAC-SHA256.

```typescript
import { AuthLite } from "@xyzintel/authlite-core";

const auth = new AuthLite(adapter, {
  secret: process.env.AUTH_SECRET!, // 32+ characters recommended
  sessionExpiryDays: 30,            // optional, default: 30
  cookieName: "authlite_session",   // optional, default: authlite_session
});

// Initialize the database tables
await auth.init();
```

### 3. Direct Usage (Framework-Agnostic)

```typescript
// Sign up a new user
const signUpResult = await auth.signUp("user@example.com", "secure-password");
if (signUpResult.success) {
  console.log("User created:", signUpResult.data.email);
}

// Sign in
const signInResult = await auth.signIn("user@example.com", "secure-password");
if (signInResult.success) {
  const { sessionToken } = signInResult.data;
  // Store sessionToken in a cookie or header
}

// Validate a session
const session = await auth.validateSession(sessionToken);
if (session.success) {
  console.log("Logged in as:", session.data.user.email);
}

// Sign out
await auth.signOut(sessionToken);
```

### 4. Usage with Next.js

Wrap the auth instance with `NextAuthLite` for automatic cookie management.

```typescript
import { NextAuthLite } from "@xyzintel/authlite-nextjs";

export const authLite = new NextAuthLite(auth);
```

The `NextAuthLite` constructor reads `cookieName` and `sessionExpiryDays` from the core config automatically — no manual sync needed.

Usage in a Server Component:

```tsx
import { authLite } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await authLite.getSession();

  if (!session) {
    return <div>You are not signed in.</div>;
  }

  return <div>Welcome, {session.user.email}!</div>;
}
```

Usage in a Server Action:

```typescript
"use server";
import { authLite } from "@/lib/auth";

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const result = await authLite.signIn(email, password);
  if (!result.success) {
    return { error: result.error };
  }

  return { success: true };
}
```

Usage in Middleware:

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authLite } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const session = await authLite.getSession();

  if (!session && request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
```

## Core Concepts

- **AuthLite**: The main engine. Framework-agnostic, handles hashing and session logic.
- **Adapters**: Connect AuthLite to your database (e.g., SQLite via `better-sqlite3`).
- **Framework Helpers**: Glue code for specific frameworks (e.g., Next.js App Router).
