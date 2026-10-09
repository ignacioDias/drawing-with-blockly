# Agent Guide

## Commands

- Use `pnpm` for the repository scripts. Install with `pnpm install`.
- Run the frontend with `pnpm start` and the API separately with `pnpm api`; the frontend is at `http://localhost:8080` and the API at `http://localhost:3001`.
- Run `pnpm build` for a production webpack build. Development builds write to `build/`; production builds write to `dist/`.
- There are no configured lint, formatter, or typecheck scripts. `pnpm test` runs `node --test server/index.test.js`.

## Database And Tests

- Copy `.env.example` to `.env` before local setup. `pnpm db:up` starts PostgreSQL; the API reads `DATABASE_URL` from `.env`.
- The SQL files in `db/init/` are mounted as PostgreSQL initialization scripts and run automatically only when the Docker volume is created. After schema changes, reset locally with `docker compose down -v` followed by `pnpm db:up`.
- Never run integration tests against the development database. Configure `TEST_DATABASE_URL` to a separate database with the same `db/init/` schema; without it, the test command skips the suite.

## Structure

- Webpack has nine entrypoints, one per page under `src/pages/*/index.js` (`home`, `collection`, `drawing`, `login`, `register`, `logout`, `profile`, `collection-create`, `level-create`), each producing a matching HTML page.
- Blockly workspace state and user preferences live in browser `localStorage`. Level data and authentication state are loaded through the API client in `src/shared/api.js`; pages fetch from the API rather than using static data.
- Non-admin users can create collections/levels that are stored only in `localStorage` (temporary). `src/shared/local-store.js` owns that cache, `src/shared/data.js` merges API + local data (`loadCollections`, `loadLevel`), and `src/shared/level-io.js` provides level export/import helpers. Temporary items are flagged `is_temporary` and rendered with a teal dashed border + badge.
- `server/index.js` owns all PostgreSQL access and authentication/level/collection/profile endpoints. Browser code must not connect directly to PostgreSQL.
- `db/init/` defines the levels, users, sessions, collections, and profile schema and seed data. Level boards are sparse 20x20 JSON objects.

## Frontend Quirk

- The drawing page evaluates generated Blockly JavaScript on Run via `eval`; changes to blocks or generators must preserve the globals exposed by `src/pages/drawing/index.js` for board operations.
