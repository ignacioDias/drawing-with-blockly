# Drawing With Blockly

A multi-page Blockly + p5.js app where users pick a level, then solve drawing challenges by programming with visual blocks.

## Quick Start

```bash
pnpm install
pnpm start
```

The web app runs at `http://localhost:8080`. Build it with `pnpm build`.

## Database

Start PostgreSQL with Docker:

```bash
cp .env.example .env
pnpm db:up
```

The initialization scripts create the `levels` and `users` tables. Database
data is stored in the `postgres_data` Docker volume. Reset the local database
with `docker compose down -v`.

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

The browser does not connect directly to PostgreSQL. A server-side API must be
added before database data becomes the application's source of truth.

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

Workspace state is currently persisted per level in browser `localStorage`.
