# Next.js Helper (`@xyzintel/authlite-nextjs`)

The Next.js helper for AuthLite simplifies session management using cookies and the Next.js App Router APIs.

## NextAuthLite Class

A wrapper around the core `AuthLite` instance. It reads `cookieName` and `sessionExpiryDays` from the core config automatically — no manual sync required.

### Constructor

```typescript
new NextAuthLite(auth: AuthLite)
```

```typescript
import { AuthLite } from "@xyzintel/authlite-core";
import { SQLiteAdapter } from "@xyzintel/authlite-sqlite";
import { NextAuthLite } from "@xyzintel/authlite-nextjs";

const adapter = new SQLiteAdapter("auth.db");
const auth = new AuthLite(adapter, {
  secret: process.env.AUTH_SECRET!,
  sessionExpiryDays: 14,
  cookieName: "my_app_session",
});

export const authLite = new NextAuthLite(auth);
// cookieName = "my_app_session", maxAge = 14 days — synced automatically
```

### Methods

#### `getSession()`

Retrieves the current session and user from cookies. Works in Server Components, Server Actions, and Route Handlers.

```typescript
const session = await authLite.getSession();
// Returns: { user: SafeUser; session: Session } | null
```

Returns `null` if no valid session cookie is found or the session is expired/invalid.

#### `signIn(email, password)`

Authenticates the user and sets an HTTP-only session cookie.

```typescript
const result = await authLite.signIn("user@example.com", "password");
// Returns: AuthLiteResult (void data)
```

On success, sets a cookie with these attributes:
- **HttpOnly**: `true` — JavaScript can't read it (XSS mitigation)
- **Secure**: `true` in production, `false` in development
- **SameSite**: `"lax"` — CSRF protection while allowing normal navigation
- **Path**: `"/"` — available to all routes
- **Max-Age**: derived from `sessionExpiryDays` config

#### `signOut()`

Invalidates the session in the database and clears the session cookie.

```typescript
const result = await authLite.signOut();
// Returns: AuthLiteResult (void data)
```

If the database operation fails, the error is propagated before the cookie is cleared — no orphaned database sessions.

### full setup

```typescript
// lib/auth.ts
import { AuthLite } from "@xyzintel/authlite-core";
import { SQLiteAdapter } from "@xyzintel/authlite-sqlite";
import { NextAuthLite } from "@xyzintel/authlite-nextjs";

const adapter = new SQLiteAdapter("auth.db");
const auth = new AuthLite(adapter, {
  secret: process.env.AUTH_SECRET!,
  sessionExpiryDays: 30,
});

export const authLite = new NextAuthLite(auth);
```

#### Protected Server Component

```tsx
// app/dashboard/page.tsx
import { authLite } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await authLite.getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {session.user.email}!</p>
    </div>
  );
}
```

#### Server Action (Login)

```typescript
// app/login/actions.ts
"use server";
import { authLite } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const result = await authLite.signIn(email, password);
  if (!result.success) {
    return { error: result.error };
  }

  redirect("/dashboard");
}
```

#### Server Action (Logout)

```typescript
// app/logout/actions.ts
"use server";
import { authLite } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function logoutAction() {
  await authLite.signOut();
  redirect("/login");
}
```

#### Middleware (Route Protection)

```typescript
// middleware.ts
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

### Peer Dependencies

- `next` >= 13.0.0
- `react` >= 18.0.0
- `@xyzintel/authlite-core`
