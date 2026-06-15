---
sidebar: false
prev: false
next: false
---

# Changelog

All notable changes to AuthLite.

---

## [0.1.3] — 2026-06-15

### Fixed

- **Widened `better-sqlite3` version range** to `^11.0.0 || ^12.0.0` so npm can use v12 when available, which ships prebuilt binaries for newer Node.js versions and avoids native compilation failures on systems without C++ build tools.
- **Added `engines` field** (`node >= 18.0.0`) to all three packages so package managers warn users before attempting an install on unsupported Node.js versions.
- **Updated documentation** with a Prerequisites section listing Node.js 18+ requirement and better-sqlite3 compatibility notes.

---

## [0.1.2] — 2026-06-12

### Fixed

- **NextJS adapter cookie name** now reads from `AuthLite` config instead of using a hardcoded value.
- **Cookie maxAge** now derived from `sessionExpiryDays` config instead of a hardcoded 30 days.
- **Password hash no longer leaked** via public API responses. A new `SafeUser` type (user without `passwordHash`) is returned from `signUp()`, `signIn()`, and `validateSession()`.
- **signOut error propagation** in NextJS adapter — if the database operation fails, the error is now returned before the cookie is cleared, preventing orphaned sessions.
- **Token hashing** switched from SHA-256 concatenation to **HMAC-SHA256** for session tokens.
- **Dead dependencies** removed: `nanoid` and `cookie` from `@xyzintel/authlite-core`, `cookie` from `@xyzintel/authlite-nextjs`.

### Added

- `getCookieName()`, `getSessionExpiryDays()`, and `getSessionMaxAge()` methods on `AuthLite` for framework helpers to sync config.
- `SafeUser` type exported from `@xyzintel/authlite-core`.
- Expired session validation test.
- Documentation website with local search and copy-page feature.

### Changed

- Package names corrected in README to match published scope (`@xyzintel/authlite-*`).
- Expanded API reference documentation for all packages.

---

## [0.1.1] — 2026-06-11

### Added

- Initial release of AuthLite.
- `@xyzintel/authlite-core`: Argon2id password hashing, HMAC-SHA256 session tokens, database-agnostic adapter interface.
- `@xyzintel/authlite-sqlite`: SQLite adapter using `better-sqlite3` with automatic schema creation.
- `@xyzintel/authlite-nextjs`: Next.js App Router integration with cookie-based session management.
- Vitest test suite for core engine.
