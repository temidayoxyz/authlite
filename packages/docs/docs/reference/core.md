# @authlite/core

The core package contains the protocol-agnostic authentication logic.

## AuthLite Class

The main class for managing authentication.

### Constructor

```typescript
new AuthLite(adapter: AuthAdapter, config: AuthLiteConfig)
```

**Config Options:**
- `secret`: (Required) String used for hashing tokens.
- `sessionExpiryDays`: (Optional) Number of days until a session expires. Default: `30`.
- `cookieName`: (Optional) The name of the session cookie. Default: `authlite_session`.

### Methods

#### `init()`
Initializes the database/adapter. Usually creates necessary tables.

#### `signUp(email, password)`
Creates a new user account.
- Returns: `Promise<AuthLiteResult<User>>`

#### `signIn(email, password)`
Authenticates a user and creates a session.
- Returns: `Promise<AuthLiteResult<{ user: User; sessionToken: string }>>`

#### `validateSession(sessionToken)`
Validates a session token and returns the user.
- Returns: `Promise<AuthLiteResult<{ user: User; session: Session }>>`

#### `signOut(sessionToken)`
Invalidates a session.
- Returns: `Promise<AuthLiteResult>`

## Types

### `User`
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
