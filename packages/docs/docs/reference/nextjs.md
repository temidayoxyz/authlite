# @authlite/nextjs

The Next.js helper for AuthLite. Simplifies session management using cookies and Next.js APIs.

## NextAuthLite Class

A wrapper around the core `AuthLite` instance.

### Constructor

```typescript
new NextAuthLite(auth: AuthLite)
```

### Methods

#### `getSession()`
Retrieves the current session and user from cookies. Works in Server Components, Server Actions, and Route Handlers.
- Returns: `Promise<{ user: User; session: Session } | null>`

#### `signIn(email, password)`
Authenticates the user and sets the `authlite_session` cookie.
- Returns: `Promise<AuthLiteResult>`

#### `signOut()`
Invalidates the session in the database and clears the session cookie.
- Returns: `Promise<AuthLiteResult>`

### Example Setup

```typescript
// lib/auth.ts
import { AuthLite } from '@xyzintel/authlite-core';
import { SQLiteAdapter } from '@xyzintel/authlite-sqlite';
import { NextAuthLite } from '@xyzintel/authlite-nextjs';

const adapter = new SQLiteAdapter('auth.db');
const auth = new AuthLite(adapter, { secret: process.env.AUTH_SECRET! });
export const { signIn, signOut, getSession } = new NextAuthLite(auth);
```

### Usage in Server Component

```tsx
// app/page.tsx
import { getSession } from '@/lib/auth';

export default async function Page() {
  const session = await getSession();

  if (!session) {
    return <div>Not signed in</div>;
  }

  return <div>Welcome, {session.user.email}</div>;
}
```
