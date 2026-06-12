# @authlite/sqlite

The SQLite adapter for AuthLite.

## SQLiteAdapter Class

Implements the `AuthAdapter` interface using `better-sqlite3`.

### Constructor

```typescript
new SQLiteAdapter(dbPath: string | Database.Database)
```

- `dbPath`: A string representing the file path to the SQLite database, or an existing `better-sqlite3` Database instance.

### Automatic Schema

When calling `auth.init()`, the adapter automatically creates the following tables if they don't exist:

- `users`: Stores user credentials and profile information.
- `sessions`: Stores active session tokens (hashed).

### Example

```typescript
import { SQLiteAdapter } from '@xyzintel/authlite-sqlite';
import { AuthLite } from '@xyzintel/authlite-core';

const adapter = new SQLiteAdapter('./auth.db');
const auth = new AuthLite(adapter, { secret: '...' });

await auth.init();
```
