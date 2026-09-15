const request = async (path, options = {}) => {
  const response = await fetch(path, {
    ...options,
    credentials: 'include',
    headers: {
      ...(options.body ? {'content-type': 'application/json'} : {}),
      ...(options.headers || {}),
    },
  });

  const body = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(body?.error || `Request failed (${response.status})`);
  }
  return body;
};

export const getLevels = async () => {
  const {levels} = await request('/api/levels');
  return levels;
};

export const getCollections = async () => {
  const {collections} = await request('/api/collections');
  return collections;
};

export const getLevel = async (id) => {
  const {level} = await request(`/api/levels/${encodeURIComponent(String(id))}`);
  return level;
};

export const register = (credentials) => request('/api/auth/register', {
  method: 'POST',
  body: JSON.stringify(credentials),
});

export const login = (credentials) => request('/api/auth/login', {
  method: 'POST',
  body: JSON.stringify(credentials),
});

export const getCurrentUser = () => request('/api/auth/me');

export const logout = () => request('/api/auth/logout', {method: 'POST'});
