# Drawing With Blockly

A multi-page Blockly + p5.js app where users pick a published level, then solve drawing challenges by programming with visual blocks. The frontend loads levels and authentication state through the Express API. Admins create persistent collections and levels; any signed-in user can create temporary ones saved in the browser, and levels can be exported to and imported from JSON files.

## Quick Start

```bash
pnpm install
cp .env.example .env
pnpm db:up
```

Run the API and frontend in separate terminals:

```bash
pnpm api
pnpm start
```

The web app runs at `http://localhost:8080` and the API runs at
`http://localhost:3001`. Webpack proxies `/api` requests to the API during
development.

Build the frontend with `pnpm build`.

Available scripts:

- `pnpm start`: start the webpack development server
- `pnpm api`: start the backend API
- `pnpm build`: build the frontend for production
- `pnpm db:up`: start PostgreSQL
- `pnpm db:down`: stop PostgreSQL without deleting its data
- `pnpm db:logs`: follow PostgreSQL logs
- `pnpm test`: run API integration tests when `TEST_DATABASE_URL` is configured

The production build is written to `dist/`; development output is written to
`build/`.

## Database

Start PostgreSQL with Docker:

```bash
cp .env.example .env
pnpm db:up
```

The initialization scripts create the `levels`, `users`, `sessions`, and
`collections` tables, plus profile columns on `users`.
Database data is stored in the `postgres_data` Docker volume. Reset the local
database and rerun all initialization scripts with:

```bash
docker compose down -v
pnpm db:up
```

Each level stores sparse `starting_board` and `target_board` JSON objects:

```json
{
  "rows": 20,
  "columns": 20,
  "cells": [{"row": 0, "column": 0, "color": "#000000"}]
}
```

Unlisted cells use the empty color (`#ffffff`). `starting_row` and
`starting_column` store Blockly's initial cursor position. The seed creates 12
levels: levels 1–3 are published, while levels 4–12 are draft placeholders.

The browser does not connect directly to PostgreSQL. The server API owns the
database connection.

Authentication endpoints:

- `POST /api/auth/register` with `{ "username": "alice", "password": "..." }`
- `POST /api/auth/login` with the same body
- `POST /api/auth/logout` (authenticated)
- `GET /api/auth/me` (authenticated)
- `GET /api/profile` (authenticated) returns the current user's profile
- `PUT /api/profile` (authenticated) updates `display_name`, `email`, or `bio`;
  send `null` (or an empty string) for a field to clear it

Registration and login set an `HttpOnly` session cookie. Passwords must be at
least eight characters. New users always receive the `normal` role.

To promote a user to admin during local development:

```bash
docker compose exec postgres psql \
  -U drawing_app -d drawing_with_blockly \
  -c "UPDATE users SET role = 'admin' WHERE username = 'alice';"
```

Published levels are available without authentication:

- `GET /api/levels` lists published levels
- `GET /api/levels/:id` returns one published level
- `GET /api/collections` lists all collections with their published levels

Collection and level mutation endpoints require an authenticated admin:

- `POST /api/collections` creates a collection
- `PUT /api/collections/:id` partially updates a collection
- `DELETE /api/collections/:id` deletes an empty collection
- `POST /api/levels` creates a level
- `PUT /api/levels/:id` partially updates a level
- `DELETE /api/levels/:id` deletes a level

The frontend additionally lets non-admin users create collections and levels,
but those are stored in the browser's `localStorage` rather than the database
(see "Temporary (Local) Collections and Levels").

Every level must belong to exactly one collection through `collection_id`.

Level requests use the database fields `slug`, `title`, `description`,
`difficulty`, `sort_order`, `starting_board`, `target_board`, `starting_row`,
`starting_column`, `validation_config`, and `is_published`. Board objects must
contain `rows: 20`, `columns: 20`, and a `cells` array.

## Temporary (Local) Collections and Levels

Any signed-in user can create collections and levels. For admins they are saved
to PostgreSQL as usual; for non-admin users they are saved only in the browser's
`localStorage` and are therefore temporary. Temporary collections and levels are
rendered with a dashed teal border and a "Temporary" badge. Non-admin users can
only add levels to their own temporary collections, and temporary levels cannot
be completed for points.

## Export and Import

Levels can be exported to and imported from JSON files:

- The collection page has "Export levels" (all levels in that collection) and
  "Import levels" buttons.
- The drawing page has an "Export" button for the currently open level.
- The level editor can export the current draft or import a JSON file to
  populate the form.

Importing saves to the database for admins and to `localStorage` for non-admin
users. Temporary content can be exported and imported just like persistent
content.

The API uses parameterized SQL, scrypt password hashes, SHA-256 session-token
hashes, and secure `HttpOnly` cookies in production. Expired or revoked
sessions cannot authenticate requests.

## Tests

Tests use a real PostgreSQL database and must never use the development
database. Create a separate database, apply the same initialization scripts,
set `TEST_DATABASE_URL` in `.env`, and run:

```bash
pnpm test
```

Without `TEST_DATABASE_URL`, the integration suite is skipped rather than
connecting to an unintended database.

The `users` table has a unique username, a `hashed_password`, and a role
restricted to `admin` or `normal`. Store only password hashes; authentication
and password hashing belong in the backend.

The `sessions` table belongs to users and stores only `token_hash`, not the raw
login token. Sessions can expire or be revoked using `expires_at` and
`revoked_at`. The backend should generate a cryptographically random token,
hash it before storing it, and send the raw token only in a secure,
`HttpOnly` cookie.

## Project Structure

- `src/pages/home`: level selection page
- `src/pages/collection`: single collection page
- `src/pages/drawing`: Blockly workspace and p5 board
- `src/pages/login`: sign-in page
- `src/pages/register`: account creation page
- `src/pages/logout`: session logout page
- `src/pages/profile`: account profile page
- `src/pages/collection-create`: collection creation page
- `src/pages/level-create`: level creation page (Blockly + p5 board editor)
- `src/features/board`: board state and drawing operations
- `src/shared`: API client, authentication navigation, preferences, translations, toolbox, serialization, local cache (`local-store.js`), merged data access (`data.js`), and level export/import (`level-io.js`)
- `db/init`: PostgreSQL initialization and migrations

Webpack generates nine pages: `index.html`, `collection.html`, `drawing.html`,
`login.html`, `register.html`, `logout.html`, `profile.html`,
`collection-create.html`, and `level-create.html`. The home and drawing pages fetch level data from
the API (merged with any local temporary content), and the authentication pages use the session-cookie endpoints described
above. Signed-in users see "+" buttons on the home and collection pages that
open the collection/level creation pages; admins save to the database while
non-admin users save to `localStorage`.

Blockly workspace state, theme, and language preferences are persisted in
browser `localStorage`, along with any temporary collections and levels created
by non-admin users. Workspace progress is not currently stored on the
server.
