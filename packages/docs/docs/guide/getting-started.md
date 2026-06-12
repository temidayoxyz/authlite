# Getting Started

AuthLite is a modular authentication library. To get started, you'll typically need the core package and a database adapter.

## Installation

Install the core package and the SQLite adapter (recommended for starting):

```bash
pnpm add @xyzintel/authlite-core @xyzintel/authlite-sqlite
```

If you are using Next.js, also install the Next.js helper:

```bash
pnpm add @xyzintel/authlite-nextjs
```

## Basic Setup

### 1. Initialize the Adapter

The adapter handles the database connection and schema.

```typescript
import { SQLiteAdapter } from '@xyzintel/authlite-sqlite';

const adapter = new SQLiteAdapter('auth.db');
```

### 2. Create the Auth Instance

The core `AuthLite` class contains the main logic.

```typescript
import { AuthLite } from '@xyzintel/authlite-core';

const auth = new AuthLite(adapter, {
  secret: process.env.AUTH_SECRET, // 32+ characters recommended
  sessionExpiryDays: 30,
});

// Initialize the database tables
await auth.init();
```

### 3. Usage with Next.js (Optional)

Wrap the auth instance with `NextAuthLite` for easy cookie management in Next.js.

```typescript
import { NextAuthLite } from '@xyzintel/authlite-nextjs';

export const authHelper = new NextAuthLite(auth);
```

## Core Concepts

- **AuthLite**: The main engine. It's framework-agnostic.
- **Adapters**: Connect AuthLite to your database (e.g., SQLite, PostgreSQL).
- **Framework Helpers**: Glue code for specific frameworks (e.g., Next.js).
