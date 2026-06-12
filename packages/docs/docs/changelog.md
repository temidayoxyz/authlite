---
sidebar: false
---

# Changelog

All notable changes to AuthLite.

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
