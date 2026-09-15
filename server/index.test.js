const assert = require('node:assert/strict');
const {after, before, test} = require('node:test');
require('dotenv').config();

const testDatabaseUrl = process.env.TEST_DATABASE_URL;

if (!testDatabaseUrl) {
  test('API integration tests require TEST_DATABASE_URL', {skip: 'Set TEST_DATABASE_URL to a dedicated test database'}, () => {});
} else {
  process.env.DATABASE_URL = testDatabaseUrl;
  const {app, pool} = require('./index');
  let server;
  let baseUrl;
  const username = `test_${Date.now()}`;
  const password = 'correct horse battery staple';
   let cookie;
   let levelId;
   let collectionId;

  const request = (path, options = {}) => fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      'content-type': 'application/json',
      ...(cookie ? {cookie} : {}),
      ...(options.headers || {}),
    },
  });

  const json = (response) => response.json();

  before(async () => {
    server = app.listen(0);
    await new Promise((resolve) => server.once('listening', resolve));
    baseUrl = `http://127.0.0.1:${server.address().port}`;
  });

  test('lists published levels and hides draft levels', async () => {
    let response = await request('/api/levels');
    assert.equal(response.status, 200);
    const levels = (await json(response)).levels;
    assert.ok(levels.length > 0);
    assert.deepEqual(levels.map((level) => level.id), [1, 2, 3]);
    assert.ok(levels.every((level) => level.sort_order <= 3));

    response = await request('/api/levels/1');
    assert.equal(response.status, 200);
    assert.equal((await json(response)).level.id, 1);

    response = await request('/api/levels/4');
    assert.equal(response.status, 404);
  });

  after(async () => {
    try {
      if (levelId) await pool.query('DELETE FROM levels WHERE id = $1', [levelId]);
      if (collectionId) await pool.query('DELETE FROM collections WHERE id = $1', [collectionId]);
      await pool.query('DELETE FROM users WHERE username = $1', [username]);
    } catch {
      // Database may be unavailable; still shut down the server and pool.
    }
    await pool.end().catch(() => {});
    if (server?.closeAllConnections) server.closeAllConnections();
    if (server) await new Promise((resolve) => server.close(resolve));
  });

  test('registers, authenticates, and logs out a user', async () => {
    let response = await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({username, password}),
    });
    assert.equal(response.status, 201);
    assert.equal((await json(response)).user.role, 'normal');
    cookie = response.headers.get('set-cookie')?.split(';')[0];
    assert.ok(cookie);

    response = await request('/api/auth/me');
    assert.equal(response.status, 200);
    assert.equal((await json(response)).user.username, username);

    response = await request('/api/auth/logout', {method: 'POST'});
    assert.equal(response.status, 204);
    cookie = null;

    response = await request('/api/auth/me');
    assert.equal(response.status, 401);
  });

  test('rejects unauthenticated protected requests', async () => {
    let response = await request('/api/auth/logout', {method: 'POST'});
    assert.equal(response.status, 401);

    for (const [method, path] of [
      ['POST', '/api/levels'],
      ['PUT', '/api/levels/1'],
      ['DELETE', '/api/levels/1'],
      ['POST', '/api/collections'],
    ]) {
      response = await request(path, {method, body: JSON.stringify({})});
      assert.equal(response.status, 401);
    }
  });

  test('rejects duplicate registration and invalid login', async () => {
    let response = await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({username, password}),
    });
    assert.equal(response.status, 409);

    response = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({username, password: 'wrong password'}),
    });
    assert.equal(response.status, 401);
  });

  test('rejects normal users from all admin level mutations', async () => {
    // Log in again after the logout test.
    const response = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({username, password}),
    });
    cookie = response.headers.get('set-cookie')?.split(';')[0];
    assert.equal(response.status, 200);

    for (const [method, path] of [
      ['POST', '/api/levels'],
      ['PUT', '/api/levels/1'],
      ['DELETE', '/api/levels/1'],
    ]) {
      const levelResponse = await request(path, {
        method,
        body: JSON.stringify({}),
      });
      assert.equal(levelResponse.status, 403);
    }
  });

  test('admin can create, update, and delete a level', async () => {
    await pool.query('UPDATE users SET role = \'admin\' WHERE username = $1', [username]);

    let response = await request('/api/collections', {
      method: 'POST',
      body: JSON.stringify({name: `Test collection ${Date.now()}`, description: 'Test collection description'}),
    });
    assert.equal(response.status, 201);
    collectionId = (await json(response)).collection.id;

    response = await request('/api/levels', {
      method: 'POST',
      body: JSON.stringify({}),
    });
    assert.equal(response.status, 400);

    const level = {
      slug: `test-level-${Date.now()}`,
      title: {en: 'Test level'},
      description: {en: 'Test description'},
      difficulty: 1,
      sort_order: 10000 + Math.floor(Math.random() * 1000),
      collection_id: collectionId,
      starting_board: {rows: 20, columns: 20, cells: []},
      target_board: {rows: 20, columns: 20, cells: [{row: 0, column: 0, color: '#000000'}]},
      starting_row: 0,
      starting_column: 0,
      validation_config: {type: 'drawing'},
      is_published: false,
    };

    response = await request('/api/levels', {
      method: 'POST',
      body: JSON.stringify(level),
    });
    assert.equal(response.status, 201);
    levelId = (await json(response)).level.id;

    response = await request(`/api/levels/${levelId}`, {
      method: 'PUT',
      body: JSON.stringify({difficulty: 2}),
    });
    assert.equal(response.status, 200);
    assert.equal((await json(response)).level.difficulty, 2);

    response = await request(`/api/levels/${levelId}`, {method: 'DELETE'});
    assert.equal(response.status, 204);
    levelId = null;

    response = await request(`/api/collections/${collectionId}`, {method: 'DELETE'});
    assert.equal(response.status, 204);
    collectionId = null;

    response = await request('/api/levels/not-a-number', {method: 'DELETE'});
    assert.equal(response.status, 400);
  });
}
