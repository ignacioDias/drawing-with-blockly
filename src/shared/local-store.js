const COLLECTIONS_KEY = 'drawing-blockly:collections';
const LEVELS_KEY = 'drawing-blockly:levels';
const LOCAL_PREFIX = 'local:';

const readJson = (key, fallback) => {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    return fallback;
  }
};

const writeJson = (key, value) => {
  window.localStorage.setItem(key, JSON.stringify(value));
};

export const isLocalId = (id) => String(id ?? '').startsWith(LOCAL_PREFIX);

export const readLocalCollections = () => readJson(COLLECTIONS_KEY, []);
export const readLocalLevels = () => readJson(LEVELS_KEY, []);
export const writeLocalCollections = (collections) => writeJson(COLLECTIONS_KEY, collections);
export const writeLocalLevels = (levels) => writeJson(LEVELS_KEY, levels);

const makeId = (kind) => `${LOCAL_PREFIX}${kind}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const slugify = (value) => String(value ?? '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

const asLocalizedObject = (value) => {
  if (value && typeof value === 'object') return value;
  return {en: String(value ?? '')};
};

export const createLocalCollection = ({name, description}) => {
  const collection = {
    id: makeId('collection'),
    name: String(name ?? '').trim(),
    description: String(description ?? '').trim(),
    created_at: new Date().toISOString(),
  };
  writeLocalCollections([...readLocalCollections(), collection]);
  return collection;
};

export const createLocalLevel = ({
  title,
  description,
  difficulty,
  collection_id,
  board_pairs,
  starting_row,
  starting_column,
  validation_config,
  is_published,
}) => {
  const localizedTitle = asLocalizedObject(title);
  const level = {
    id: makeId('level'),
    slug: `${slugify(localizedTitle.en || '') || 'level'}-${Date.now()}`,
    title: localizedTitle,
    description: asLocalizedObject(description),
    difficulty: Number(difficulty) || 1,
    sort_order: Date.now(),
    collection_id: String(collection_id),
    board_pairs: Array.isArray(board_pairs) ? board_pairs : [],
    starting_row: Number(starting_row) || 0,
    starting_column: Number(starting_column) || 0,
    validation_config: validation_config ?? {type: 'drawing'},
    is_published: Boolean(is_published),
  };
  writeLocalLevels([...readLocalLevels(), level]);
  return level;
};

export const getLocalCollection = (id) => (
  readLocalCollections().find((collection) => String(collection.id) === String(id)) || null
);

export const getLocalLevel = (id) => (
  readLocalLevels().find((level) => String(level.id) === String(id)) || null
);
