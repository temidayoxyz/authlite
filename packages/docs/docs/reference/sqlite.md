# SQLite Adapter (`@xyzintel/authlite-sqlite`)

The SQLite adapter implements the `AuthAdapter` interface using `better-sqlite3` — a synchronous, native SQLite binding for Node.js.

Requires **Node.js 18+** and `better-sqlite3` version 11 or 12 (`^11.0.0 || ^12.0.0`).

## SQLiteAdapter Class

### Constructor

```typescript
new SQLiteAdapter(dbPath: string | Database.Database)
```

Accepts either a file path or an existing `better-sqlite3` `Database` instance.

```typescript
// From a file path (creates the database if it doesn't exist)
import { SQLiteAdapter } from "@xyzintel/authlite-sqlite";
const adapter = new SQLiteAdapter("./auth.db");

// From an existing Database instance
import Database from "better-sqlite3";
const db = new Database("./auth.db");
const adapter = new SQLiteAdapter(db);
```

### Automatic Schema

When `auth.init()` is called (which delegates to `adapter.initialize()`), the adapter creates the following tables:

**`users` table:**

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `TEXT` | `PRIMARY KEY` |
| `email` | `TEXT` | `UNIQUE NOT NULL` |
| `password_hash` | `TEXT` | `NOT NULL` |
| `email_verified` | `INTEGER` | `DEFAULT 0` |
| `created_at` | `DATETIME` | `DEFAULT CURRENT_TIMESTAMP` |
| `updated_at` | `DATETIME` | `DEFAULT CURRENT_TIMESTAMP` |

**`sessions` table:**

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `TEXT` | `PRIMARY KEY` |
| `user_id` | `TEXT` | `NOT NULL` (FK → users.id, `ON DELETE CASCADE`) |
| `token_hash` | `TEXT` | `NOT NULL` (indexed for fast lookups) |
| `expires_at` | `DATETIME` | `NOT NULL` |
| `created_at` | `DATETIME` | `DEFAULT CURRENT_TIMESTAMP` |

All tables use `IF NOT EXISTS`, so repeated `init()` calls are safe.

### Complete Example

```typescript
import { AuthLite } from "@xyzintel/authlite-core";
import { SQLiteAdapter } from "@xyzintel/authlite-sqlite";

const adapter = new SQLiteAdapter("./auth.db");
const auth = new AuthLite(adapter, {
  secret: process.env.AUTH_SECRET!,
});

await auth.init();

// Ready to use
const result = await auth.signUp("user@example.com", "secure-password");
```

### IDs

User and session IDs are generated using `nanoid` — URL-safe, collision-resistant unique identifiers.

### Column Mapping

The adapter maps between `snake_case` database columns and `camelCase` JavaScript properties:

- `password_hash` ↔ `passwordHash`
- `email_verified` ↔ `emailVerified`
- `created_at` ↔ `createdAt`
- `updated_at` ↔ `updatedAt`
- `user_id` ↔ `userId`
- `token_hash` ↔ `tokenHash`
- `expires_at` ↔ `expiresAt`

### Performance

- The `sessions.token_hash` column is indexed for constant-time session lookups.
- `better-sqlite3` operates synchronously (no event loop overhead), which is ideal for SQLite's single-writer model.
