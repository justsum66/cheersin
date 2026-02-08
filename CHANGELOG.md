# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- P2-250: Code splitting strategy documentation (`docs/code-splitting.md`).
- P2-261: Component and file naming conventions (`docs/naming-conventions.md`).
- P2-265: This CHANGELOG; future releases should append under version headings.
- P2-266: Contributing guide (`CONTRIBUTING.md`).
- P2-280: Dependency graph documentation placeholder (`docs/dependency-graph.md`).

### Changed

- P2-271: `GAME_CATEGORY_BY_ID` in `games.config.ts` now uses `Map` for lookup performance.
- P2-245: `canvas-confetti` in `lib/celebration.ts` loaded via dynamic import to reduce main bundle.
- P2-322: `lib/errors.ts` extended with `ServerError` and 4xx/5xx classification.
- P2-303 / P2-327: Middleware logs request ID, method, path, status, and response time for API routes.
- P2-314: API request body size limit configured in Next.js (when applicable).
- P2-246: Error boundaries documented and used for game and assistant blocks.
- P2-260: Third-party scripts use `next/script` with appropriate strategy where applicable.
- P2-263: Git hooks (Husky + lint-staged) for pre-commit lint/format.
- P2-273: Key data-fetching hooks use `AbortController` to cancel requests on unmount.
- P2-267: API routes use `headers()` from `next/headers` where appropriate for consistency.

### Fixed

- (None in this batch.)

## [1.0.0] - 2025-xx-xx

- Initial production-ready release (see report for full P0/P1/P2 scope).
