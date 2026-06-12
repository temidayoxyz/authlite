# AuthLite Project Documentation

## Architecture

AuthLite is a monorepo managed with `pnpm`. It is split into three main packages to maintain separation of concerns:

1.  **`@authlite/core`**: Contains the protocol-agnostic logic.
    -   `AuthLite` class: The main engine.
    -   `AuthAdapter` interface: Defines how the engine communicates with the database.
    -   Password hashing via `@node-rs/argon2`.
    -   Session management (token generation/hashing).

2.  **`@authlite/sqlite`**: The primary database adapter.
    -   Uses `better-sqlite3`.
    -   Handles automatic schema creation.
    -   Implements `AuthAdapter`.

3.  **`@authlite/nextjs`**: Framework-specific helpers.
    -   `NextAuthLite` class: Wraps the core engine with Next.js specific cookie handling (`next/headers`).
    -   Provides `getSession`, `signIn`, and `signOut` for App Router.

## Tech Stack ($0)

-   **Language:** TypeScript
-   **Runtime:** Node.js
-   **Bundler:** `tsup` (esbuild based)
-   **Testing:** `vitest`
-   **Database:** SQLite (`better-sqlite3`)
-   **Security:** Argon2id, SHA-256 token hashing, Secure Cookies.

## Future Roadmap

-   [ ] **Email Verification:** Add logic for sending and verifying tokens.
-   [ ] **Password Reset:** Add "forgot password" flow helpers.
-   [ ] **Framework Adapters:** Add `authlite-hono` and `authlite-express`.
-   [ ] **Database Adapters:** Add `authlite-postgresql` (Drizzle/Prisma integration).
-   [ ] **Magic Links:** Optional passwordless authentication.

## Development

Run `pnpm build` from the root to build all packages.
Run `pnpm test` to run the core test suite.
