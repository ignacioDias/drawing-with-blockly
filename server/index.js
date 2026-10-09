const crypto = require('node:crypto');
const {promisify} = require('node:util');
const express = require('express');
const {Pool} = require('pg');
require('dotenv').config();

const scrypt = promisify(crypto.scrypt);
const app = express();
const pool = new Pool({connectionString: process.env.DATABASE_URL});
const port = Number(process.env.API_PORT || 3001);
const sessionCookie = 'drawing_session';
const sessionDays = Number(process.env.SESSION_TTL_DAYS || 7);

app.use(express.json({limit: '100kb'}));

const sendError = (res, status, message) => res.status(status).json({error: message});

const hashPassword = async (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = await scrypt(password, salt, 64);
  return `scrypt$${salt}$${derivedKey.toString('hex')}`;
};

const verifyPassword = async (password, storedHash) => {
  const [algorithm, salt, expectedHex] = storedHash.split('$');
  if (algorithm !== 'scrypt' || !salt || !expectedHex) return false;

  const actual = await scrypt(password, salt, 64);
  const expected = Buffer.from(expectedHex, 'hex');
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
};

const hashSessionToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const createSession = async (userId, res) => {
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashSessionToken(token);
  const expiresAt = new Date(Date.now() + sessionDays * 24 * 60 * 60 * 1000);

  await pool.query(
    'INSERT INTO sessions (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
    [userId, tokenHash, expiresAt],
  );

  res.cookie(sessionCookie, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: sessionDays * 24 * 60 * 60 * 1000,
  });
};

const clearSessionCookie = (res) => {
  res.clearCookie(sessionCookie, {httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production'});
};

const getCookie = (req, name) => {
  const cookies = (req.headers.cookie || '').split(';');
  const cookie = cookies.find((entry) => entry.trim().startsWith(`${name}=`));
  return cookie ? decodeURIComponent(cookie.trim().slice(name.length + 1)) : null;
};

const requireAuth = async (req, res, next) => {
  try {
    const token = getCookie(req, sessionCookie);
    if (!token) return sendError(res, 401, 'Authentication required');

    const {rows} = await pool.query(
      `SELECT s.id AS session_id, u.id, u.username, u.role
       FROM sessions s
       JOIN users u ON u.id = s.user_id
       WHERE s.token_hash = $1
         AND s.revoked_at IS NULL
         AND s.expires_at > now()`,
      [hashSessionToken(token)],
    );
    if (!rows[0]) return sendError(res, 401, 'Invalid or expired session');

    req.user = rows[0];
    await pool.query('UPDATE sessions SET last_used_at = now() WHERE id = $1', [req.user.session_id]);
    return next();
  } catch (error) {
    return next(error);
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') return sendError(res, 403, 'Admin access required');
  return next();
};

const validCredentials = (body) => (
  typeof body?.username === 'string' &&
  body.username.trim() === body.username &&
  body.username.length > 0 &&
  body.username.length <= 100 &&
  typeof body.password === 'string' &&
  body.password.length >= 8 &&
  body.password.length <= 200
);

app.post('/api/auth/register', async (req, res, next) => {
  try {
    if (!validCredentials(req.body)) return sendError(res, 400, 'Username or password is invalid');
    const passwordHash = await hashPassword(req.body.password);
    const {rows} = await pool.query(
      'INSERT INTO users (username, hashed_password) VALUES ($1, $2) RETURNING id, username, role',
      [req.body.username, passwordHash],
    );
    await createSession(rows[0].id, res);
    return res.status(201).json({user: rows[0]});
  } catch (error) {
    if (error.code === '23505') return sendError(res, 409, 'Username is already in use');
    return next(error);
  }
});

app.post('/api/auth/login', async (req, res, next) => {
  try {
    if (!validCredentials(req.body)) return sendError(res, 400, 'Username or password is invalid');
    const {rows} = await pool.query(
      'SELECT id, username, role, hashed_password FROM users WHERE lower(username) = lower($1)',
      [req.body.username],
    );
    if (!rows[0] || !(await verifyPassword(req.body.password, rows[0].hashed_password))) {
      return sendError(res, 401, 'Invalid username or password');
    }

    await createSession(rows[0].id, res);
    return res.json({user: {id: rows[0].id, username: rows[0].username, role: rows[0].role}});
  } catch (error) {
    return next(error);
  }
});

app.post('/api/auth/logout', requireAuth, async (req, res, next) => {
  try {
    await pool.query('UPDATE sessions SET revoked_at = now() WHERE id = $1', [req.user.session_id]);
    clearSessionCookie(res);
    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
});

app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json({user: {id: req.user.id, username: req.user.username, role: req.user.role}});
});

const PROFILE_FIELDS = ['display_name', 'email', 'bio'];

const validateProfileField = (field, value) => {
  if (value === null) return null;
  if (typeof value !== 'string') return `Invalid ${field}`;
  const trimmed = value.trim();
  if (field === 'display_name' && trimmed.length > 100) return 'Invalid display name';
  if (field === 'email') {
    if (trimmed && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return 'Invalid email';
    if (trimmed.length > 254) return 'Invalid email';
  }
  if (field === 'bio' && trimmed.length > 1000) return 'Invalid bio';
  return null;
};

const profileSelect = 'id, username, role, display_name, email, bio, created_at, updated_at';

app.get('/api/profile', requireAuth, async (req, res, next) => {
  try {
    const {rows} = await pool.query(
      `SELECT ${profileSelect} FROM users WHERE id = $1`,
      [req.user.id],
    );
    if (!rows[0]) return sendError(res, 404, 'User not found');
    return res.json({profile: rows[0]});
  } catch (error) {
    return next(error);
  }
});

app.put('/api/profile', requireAuth, async (req, res, next) => {
  try {
    const updates = PROFILE_FIELDS.filter((field) => Object.prototype.hasOwnProperty.call(req.body, field));
    if (!updates.length) return sendError(res, 400, 'No fields to update');

    for (const field of updates) {
      const validationError = validateProfileField(field, req.body[field]);
      if (validationError) return sendError(res, 400, validationError);
    }

    const values = updates.map((field) => {
      const raw = req.body[field];
      return (raw === null || (typeof raw === 'string' && raw.trim() === '')) ? null : raw.trim();
    });
    const assignments = updates.map((field, index) => `${field} = $${index + 1}`).join(', ');
    values.push(req.user.id);

    const {rows} = await pool.query(
      `UPDATE users SET ${assignments}, updated_at = now()
       WHERE id = $${values.length} RETURNING ${profileSelect}`,
      values,
    );
    if (!rows[0]) return sendError(res, 404, 'User not found');
    return res.json({profile: rows[0]});
  } catch (error) {
    return next(error);
  }
});

app.get('/api/collections', async (req, res, next) => {
  try {
    const {rows} = await pool.query(
      `SELECT c.id, c.name, c.description,
              COALESCE(
                jsonb_agg(
                  jsonb_build_object(
                    'id', l.id, 'slug', l.slug, 'title', l.title,
                    'description', l.description, 'difficulty', l.difficulty,
                    'sort_order', l.sort_order, 'starting_board', l.starting_board,
                    'target_board', l.target_board, 'board_pairs', l.board_pairs,
                    'starting_row', l.starting_row,
                    'starting_column', l.starting_column,
                    'validation_config', l.validation_config,
                    'collection_id', l.collection_id
                  ) ORDER BY l.sort_order
                ) FILTER (WHERE l.id IS NOT NULL),
                '[]'::jsonb
              ) AS levels
       FROM collections c
       LEFT JOIN levels l ON l.collection_id = c.id AND l.is_published
       GROUP BY c.id
       ORDER BY c.id`,
    );
    return res.json({collections: rows});
  } catch (error) {
    return next(error);
  }
});

const validateCollection = (body, partial = false) => {
  if (!partial && (body.name === undefined || body.description === undefined)) {
    return 'Name and description are required';
  }
  if (body.name !== undefined && (typeof body.name !== 'string' || !body.name.trim() || body.name.length > 200)) {
    return 'Invalid collection name';
  }
  if (body.description !== undefined && (typeof body.description !== 'string' || body.description.length > 2000)) {
    return 'Invalid collection description';
  }
  return null;
};

app.post('/api/collections', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const validationError = validateCollection(req.body);
    if (validationError) return sendError(res, 400, validationError);
    const {rows} = await pool.query(
      'INSERT INTO collections (name, description) VALUES ($1, $2) RETURNING *',
      [req.body.name, req.body.description],
    );
    return res.status(201).json({collection: rows[0]});
  } catch (error) {
    return next(error);
  }
});

app.put('/api/collections/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) return sendError(res, 400, 'Invalid collection id');
    const validationError = validateCollection(req.body, true);
    if (validationError) return sendError(res, 400, validationError);
    const updates = ['name', 'description'].filter((field) => req.body[field] !== undefined);
    if (!updates.length) return sendError(res, 400, 'No fields to update');
    const values = updates.map((field) => req.body[field]);
    values.push(id);
    const assignments = updates.map((field, index) => `${field} = $${index + 1}`).join(', ');
    const {rows} = await pool.query(
      `UPDATE collections SET ${assignments}, updated_at = now()
       WHERE id = $${values.length} RETURNING *`,
      values,
    );
    if (!rows[0]) return sendError(res, 404, 'Collection not found');
    return res.json({collection: rows[0]});
  } catch (error) {
    return next(error);
  }
});

app.delete('/api/collections/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) return sendError(res, 400, 'Invalid collection id');
    const result = await pool.query('DELETE FROM collections WHERE id = $1', [id]);
    if (!result.rowCount) return sendError(res, 404, 'Collection not found');
    return res.status(204).end();
  } catch (error) {
    if (error.code === '23503') return sendError(res, 409, 'Collection still contains levels');
    return next(error);
  }
});

app.get('/api/levels', async (req, res, next) => {
  try {
    const {rows} = await pool.query(
       `SELECT id, slug, title, description, difficulty, sort_order, collection_id,
              starting_board, target_board, board_pairs, starting_row, starting_column,
              validation_config
       FROM levels
       WHERE is_published
       ORDER BY sort_order`,
    );
    return res.json({levels: rows});
  } catch (error) {
    return next(error);
  }
});

app.get('/api/levels/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) return sendError(res, 400, 'Invalid level id');
    const {rows} = await pool.query(
       `SELECT id, slug, title, description, difficulty, sort_order, collection_id,
              starting_board, target_board, board_pairs, starting_row, starting_column,
              validation_config
       FROM levels
       WHERE id = $1 AND is_published`,
      [id],
    );
    if (!rows[0]) return sendError(res, 404, 'Level not found');
    return res.json({level: rows[0]});
  } catch (error) {
    return next(error);
  }
});

const boardIsValid = (board) => (
  board && board.rows === 20 && board.columns === 20 && Array.isArray(board.cells)
);

const boardPairsValid = (pairs) => (
  Array.isArray(pairs) &&
  pairs.length > 0 &&
  pairs.every((pair) => pair && boardIsValid(pair.starting_board) && boardIsValid(pair.target_board))
);

const validateLevel = (body, partial = false) => {
  const required = ['slug', 'title', 'description', 'difficulty', 'sort_order', 'collection_id', 'starting_row', 'starting_column', 'validation_config', 'is_published'];
  if (!partial && required.some((field) => body[field] === undefined)) return 'All level fields are required';
  if (body.slug !== undefined && (typeof body.slug !== 'string' || !/^[a-z0-9-]+$/.test(body.slug))) return 'Invalid slug';
  if (body.difficulty !== undefined && (!Number.isInteger(body.difficulty) || body.difficulty < 1 || body.difficulty > 5)) return 'Invalid difficulty';
  if (body.sort_order !== undefined && (!Number.isInteger(body.sort_order) || body.sort_order < 1)) return 'Invalid sort order';
  if (body.collection_id !== undefined && (!Number.isInteger(body.collection_id) || body.collection_id < 1)) return 'Invalid collection id';
  if (body.starting_row !== undefined && (!Number.isInteger(body.starting_row) || body.starting_row < 0 || body.starting_row > 19)) return 'Invalid starting row';
  if (body.starting_column !== undefined && (!Number.isInteger(body.starting_column) || body.starting_column < 0 || body.starting_column > 19)) return 'Invalid starting column';
  if (body.starting_board !== undefined && !boardIsValid(body.starting_board)) return 'Invalid starting board';
  if (body.target_board !== undefined && !boardIsValid(body.target_board)) return 'Invalid target board';
  if (body.board_pairs !== undefined && !boardPairsValid(body.board_pairs)) return 'Invalid board pairs';
  if (!partial && body.board_pairs === undefined && (body.starting_board === undefined || body.target_board === undefined)) {
    return 'Board pairs are required';
  }
  return null;
};

// Normalizes a level request into its board_pairs array plus the legacy
// starting_board / target_board columns derived from the first pair.
const resolveBoards = (body) => {
  if (body.board_pairs !== undefined) {
    return {
      board_pairs: body.board_pairs,
      starting_board: body.board_pairs[0].starting_board,
      target_board: body.board_pairs[0].target_board,
    };
  }
  return {
    board_pairs: [{starting_board: body.starting_board, target_board: body.target_board}],
    starting_board: body.starting_board,
    target_board: body.target_board,
  };
};

const levelFields = ['slug', 'title', 'description', 'difficulty', 'sort_order', 'collection_id', 'starting_board', 'target_board', 'starting_row', 'starting_column', 'validation_config', 'is_published', 'board_pairs'];

const bodyHasBoardPairChange = (body) => (
  body.board_pairs !== undefined ||
  body.starting_board !== undefined ||
  body.target_board !== undefined
);

const levelInsertValues = (body) => {
  const boards = resolveBoards(body);
  return levelFields.map((field) => {
    if (field === 'starting_board') return boards.starting_board;
    if (field === 'target_board') return boards.target_board;
    if (field === 'board_pairs') return JSON.stringify(boards.board_pairs);
    return body[field];
  });
};

app.post('/api/levels', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const validationError = validateLevel(req.body);
    if (validationError) return sendError(res, 400, validationError);
    const values = levelInsertValues(req.body);
    const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
    const {rows} = await pool.query(
      `INSERT INTO levels (${levelFields.join(', ')}) VALUES (${placeholders}) RETURNING *`,
      values,
    );
    return res.status(201).json({level: rows[0]});
  } catch (error) {
    if (error.code === '23505') return sendError(res, 409, 'Slug or sort order is already in use');
    if (error.code === '23503') return sendError(res, 400, 'Collection not found');
    return next(error);
  }
});

app.put('/api/levels/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) return sendError(res, 400, 'Invalid level id');
    const validationError = validateLevel(req.body, true);
    if (validationError) return sendError(res, 400, validationError);

    const updates = levelFields.filter((field) => req.body[field] !== undefined);
    if (bodyHasBoardPairChange(req.body)) {
      const boards = resolveBoards(req.body);
      for (const field of ['starting_board', 'target_board', 'board_pairs']) {
        if (!updates.includes(field)) updates.push(field);
      }
      req.body.starting_board = boards.starting_board;
      req.body.target_board = boards.target_board;
      req.body.board_pairs = JSON.stringify(boards.board_pairs);
    }
    if (!updates.length) return sendError(res, 400, 'No fields to update');

    const values = updates.map((field) => req.body[field]);
    const assignments = updates.map((field, index) => `${field} = $${index + 1}`).join(', ');
    values.push(id);
    const {rows} = await pool.query(
      `UPDATE levels SET ${assignments}, updated_at = now() WHERE id = $${values.length} RETURNING *`,
      values,
    );
    if (!rows[0]) return sendError(res, 404, 'Level not found');
    return res.json({level: rows[0]});
  } catch (error) {
    if (error.code === '23505') return sendError(res, 409, 'Slug or sort order is already in use');
    if (error.code === '23503') return sendError(res, 400, 'Collection not found');
    return next(error);
  }
});

app.delete('/api/levels/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) return sendError(res, 400, 'Invalid level id');
    const result = await pool.query('DELETE FROM levels WHERE id = $1', [id]);
    if (!result.rowCount) return sendError(res, 404, 'Level not found');
    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
});

app.use((error, req, res, next) => {
  console.error(error);
  if (res.headersSent) return next(error);
  return sendError(res, 500, 'Internal server error');
});

if (require.main === module) {
  app.listen(port, () => console.log(`API listening on port ${port}`));
}

module.exports = {app, pool};
