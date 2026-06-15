# AuthLite

**The lightweight, self-hosted authentication library for SQLite.**

AuthLite is designed for founders, hackers, and builders who want secure, simple email/password authentication without the bloat of enterprise providers or the monthly bills.

## Why AuthLite?

- **Zero Vendor Lock-in:** You own your database. You own your user data.
- **SQLite First:** Optimized for local development and prototypes.
- **$0 Cost:** Runs entirely on your own infrastructure for free.
- **Market Ready:** Uses industry-standard Argon2id hashing and secure database sessions.
- **Developer Experience:** Set up in minutes, not hours.

## Packages

- `@xyzintel/authlite-core`: The core logic engine (hashing, sessions).
- `@xyzintel/authlite-sqlite`: SQLite adapter using `better-sqlite3`.
- `@xyzintel/authlite-nextjs`: First-class integration for Next.js App Router.

## Requirements

- **Node.js 18 or later** — AuthLite's native dependencies require Node 18+. Package managers will warn on older versions.

## Quick Start (Next.js)

### 1. Install

```bash
npm install @xyzintel/authlite-core @xyzintel/authlite-sqlite @xyzintel/authlite-nextjs better-sqlite3
```

### 2. Initialize

Create a file like `lib/auth.ts`:

```typescript
import { AuthLite } from "@xyzintel/authlite-core";
import { SQLiteAdapter } from "@xyzintel/authlite-sqlite";
import { NextAuthLite } from "@xyzintel/authlite-nextjs";

const adapter = new SQLiteAdapter("app.db");
const auth = new AuthLite(adapter, {
  secret: process.env.AUTHLITE_SECRET!,
});

export const authLite = new NextAuthLite(auth);

// Automatically create tables on first run
await auth.init();
```

### 3. Usage in Server Actions

```typescript
"use server";
import { authLite } from "@/lib/auth";

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  
  const result = await authLite.signIn(email, password);
  
  if (result.success) {
    // Redirect or return success
  }
}
```

### 4. Protect Routes in Middleware

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authLite } from "./lib/auth";

export async function middleware(request: NextRequest) {
  const session = await authLite.getSession();
  
  if (!session && request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}
```

## Security Standards

AuthLite follows OWASP best practices:
- **Argon2id** password hashing.
- **HMAC-SHA256** session token hashing.
- **Database-backed sessions** (no stateless JWT risks).
- **HttpOnly, Secure, SameSite** cookies.
- **Constant-time** password verification.

## License

MIT
