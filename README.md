# Drawing With Blockly

A multi-page Blockly + p5.js app where users pick a level, then solve drawing challenges by programming with visual blocks.

## Quick Start

```bash
pnpm install
cp .env.example .env
pnpm db:up
pnpm api
```

In a second terminal, run `pnpm start`. The web app runs at
`http://localhost:8080` and the API runs at `http://localhost:3001`.

Build the frontend with `pnpm build`.

Available scripts:

- `pnpm start`: start the webpack development server
- `pnpm api`: start the backend API
- `pnpm build`: build the frontend for production
- `pnpm db:up`: start PostgreSQL
- `pnpm db:down`: stop PostgreSQL without deleting its data
- `pnpm db:logs`: follow PostgreSQL logs

## Database

Start PostgreSQL with Docker:

```bash
cp .env.example .env
pnpm db:up
```

The initialization scripts create the `levels`, `users`, and `sessions` tables.
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
`starting_column` store Blockly's initial cursor position. Three example
levels are published; levels 4–12 are draft placeholders.

The browser does not connect directly to PostgreSQL. The server API owns the
database connection.

Authentication endpoints:

- `POST /api/auth/register` with `{ "username": "alice", "password": "..." }`
- `POST /api/auth/login` with the same body
- `POST /api/auth/logout` (authenticated)
- `GET /api/auth/me` (authenticated)

Registration and login set an `HttpOnly` session cookie. Passwords must be at
least eight characters. New users always receive the `normal` role.

To promote a user to admin during local development:

```bash
docker compose exec postgres psql \
  -U drawing_app -d drawing_with_blockly \
  -c "UPDATE users SET role = 'admin' WHERE username = 'alice';"
```

Level mutation endpoints require an authenticated admin:

- `POST /api/levels` creates a level
- `PUT /api/levels/:id` partially updates a level
- `DELETE /api/levels/:id` deletes a level

Level requests use the database fields `slug`, `title`, `description`,
`difficulty`, `sort_order`, `starting_board`, `target_board`, `starting_row`,
`starting_column`, `validation_config`, and `is_published`. Board objects must
contain `rows: 20`, `columns: 20`, and a `cells` array.

The API uses parameterized SQL, scrypt password hashes, SHA-256 session-token
hashes, and secure `HttpOnly` cookies in production. Expired or revoked
sessions cannot authenticate requests.

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
- `src/pages/drawing`: Blockly workspace and p5 board
- `src/features/board`: board state and drawing operations
- `src/shared`: preferences, translations, toolbox, and serialization
- `db/init`: PostgreSQL initialization and migrations

The frontend does not yet fetch levels or submit authentication requests; it
still renders its static level list and persists Blockly workspace state per
level in browser `localStorage`. Connecting the UI to the API is a separate
step.
