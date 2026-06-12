# Core (`@xyzintel/authlite-core`)

The core package contains the protocol-agnostic authentication logic. It defines the `AuthLite` engine and the `AuthAdapter` interface that database adapters must implement.

## AuthLite Class

The main class for managing authentication. It is database-agnostic and communicates with the database through an adapter implementing `AuthAdapter`.

### Constructor

```typescript
new AuthLite(adapter: AuthAdapter, config: AuthLiteConfig)
```

**Config Options:**

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `secret` | `string` | Yes | — | Secret key used for HMAC-SHA256 token hashing. Use 32+ random characters. |
| `sessionExpiryDays` | `number` | No | `30` | Number of days until a session expires. |
| `cookieName` | `string` | No | `"authlite_session"` | Name of the session cookie (used by framework helpers). |

### Methods

#### `init()`

Initializes the adapter (typically creates database tables if they don't exist).

```typescript
await auth.init();
```

#### `signUp(email, password)`

Creates a new user account. The password is hashed with Argon2id before storage.

```typescript
const result = await auth.signUp("user@example.com", "secure-password");
// result: AuthLiteResult<SafeUser>
// result.data = { id, email, emailVerified, createdAt, updatedAt } — no passwordHash
```

Returns `{ success: false, error: "User already exists" }` if the email is taken.

#### `signIn(email, password)`

Authenticates a user and creates a session. The session token is a 64-character hex string (32 bytes of CSPRNG). The token is HMAC-SHA256 hashed before storage.

```typescript
const result = await auth.signIn("user@example.com", "secure-password");
// result: AuthLiteResult<{ user: SafeUser; sessionToken: string }>
```

Returns `{ success: false, error: "Invalid credentials" }` for wrong email or password (constant-time — no user enumeration).

#### `validateSession(sessionToken)`

Validates a session token and returns the associated user. Automatically cleans up expired sessions.

```typescript
const result = await auth.validateSession(sessionToken);
// result: AuthLiteResult<{ user: SafeUser; session: Session }>
```

Returns `{ success: false, error: "Session expired" }` or `{ success: false, error: "Invalid session" }` as appropriate.

#### `signOut(sessionToken)`

Invalidates a session by deleting it from the database.

```typescript
const result = await auth.signOut(sessionToken);
```

#### `getCookieName()`

Returns the configured cookie name.

```typescript
const name = auth.getCookieName(); // "authlite_session"
```

#### `getSessionExpiryDays()`

Returns the configured session expiry in days.

```typescript
const days = auth.getSessionExpiryDays(); // 30
```

#### `getSessionMaxAge()`

Returns the session expiry in seconds (for cookie `maxAge`).

```typescript
const maxAge = auth.getSessionMaxAge(); // 2592000 (30 days in seconds)
```

## Types

### `User`

The full user object as stored in the database. Includes the password hash — this type is used internally by adapters.

```typescript
interface User {
  id: string;
  email: string;
  passwordHash: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### `SafeUser`

The public-safe user object returned by API methods. This is `User` with `passwordHash` removed.

```typescript
type SafeUser = Omit<User, "passwordHash">;
// { id, email, emailVerified, createdAt, updatedAt }
```

### `Session`

```typescript
interface Session {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  createdAt: Date;
}
```

### `AuthAdapter`

The interface that database adapters must implement.

```typescript
interface AuthAdapter {
  createUser(email: string, passwordHash: string): Promise<User>;
  getUserByEmail(email: string): Promise<User | null>;
  getUserById(id: string): Promise<User | null>;
  createSession(userId: string, tokenHash: string, expiresAt: Date): Promise<Session>;
  getSessionByTokenHash(tokenHash: string): Promise<Session | null>;
  deleteSession(id: string): Promise<void>;
  deleteUserSessions(userId: string): Promise<void>;
  initialize?(): Promise<void>;
}
```

### `AuthLiteResult<T>`

Generic result type returned by all AuthLite methods.

```typescript
interface AuthLiteResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}
```

## Security

- **Argon2id** for password hashing (via `@node-rs/argon2`).
- **HMAC-SHA256** for session token hashing — plain tokens never hit the database.
- **64 bytes of CSPRNG entropy** (`crypto.randomBytes`) for session tokens.
- **Constant-time error messages** to prevent user enumeration.
