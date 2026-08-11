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

- `src/pages/home/index.js` and `src/pages/drawing/index.js` are the two webpack entrypoints, producing `index.html` and `drawing.html`.
- Blockly workspace state and user preferences currently live in browser `localStorage`; the frontend still uses a static 12-level list and does not call the API.
- `server/index.js` owns all PostgreSQL access and authentication/level endpoints. Browser code must not connect directly to PostgreSQL.
- `db/init/` defines the levels, users, and sessions schema and seed data. Level boards are sparse 20x20 JSON objects.

## Frontend Quirk

- The drawing page evaluates generated Blockly JavaScript on Run via `eval`; changes to blocks or generators must preserve the globals exposed by `src/pages/drawing/index.js` for board operations.
