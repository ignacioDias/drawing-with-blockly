export const LEVEL_FILE_FORMAT = 'drawing-with-blockly';
export const LEVEL_FILE_VERSION = 1;

export const slugify = (value) => String(value ?? '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

export const localizedText = (value) => {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    return value.en || value.es || Object.values(value).find((entry) => typeof entry === 'string') || '';
  }
  return String(value);
};

export const asLocalizedObject = (value) => {
  if (value && typeof value === 'object') return value;
  return {en: String(value ?? '')};
};

export const downloadJson = (filename, data) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export const readFileAsJson = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onerror = () => reject(new Error('Unable to read file'));
  reader.onload = () => {
    try {
      resolve(JSON.parse(reader.result));
    } catch (error) {
      reject(new Error('Invalid JSON file'));
    }
  };
  reader.readAsText(file);
});

export const buildLevelsFile = (levels) => ({
  format: LEVEL_FILE_FORMAT,
  kind: 'levels',
  version: LEVEL_FILE_VERSION,
  levels,
});

export const buildLevelFile = (level) => ({
  format: LEVEL_FILE_FORMAT,
  kind: 'level',
  version: LEVEL_FILE_VERSION,
  level,
});

export const extractLevels = (data) => {
  let levels = null;
  if (Array.isArray(data)) {
    levels = data;
  } else if (data && typeof data === 'object') {
    if (Array.isArray(data.levels)) levels = data.levels;
    else if (data.level) levels = [data.level];
  }
  if (!levels) throw new Error('File does not contain any levels');
  const clean = levels.filter((level) => level && typeof level === 'object');
  if (!clean.length) throw new Error('File does not contain any levels');
  return clean;
};

export const buildImportLevel = (level, collectionId, index) => {
  const title = asLocalizedObject(level.title);
  const description = asLocalizedObject(level.description ?? '');
  const difficulty = Math.min(5, Math.max(1, Math.round(Number(level.difficulty) || 1)));
  const boardPairs = Array.isArray(level.board_pairs) && level.board_pairs.length > 0
    ? level.board_pairs
    : [{starting_board: level.starting_board, target_board: level.target_board}];

  return {
    slug: `${slugify(localizedText(title)) || 'level'}-${Date.now()}-${index + 1}`,
    title,
    description,
    difficulty,
    sort_order: Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 1000000) + index,
    collection_id: Number(collectionId),
    board_pairs: boardPairs,
    starting_row: Number(level.starting_row) || 0,
    starting_column: Number(level.starting_column) || 0,
    validation_config: level.validation_config ?? {type: 'drawing'},
    is_published: Boolean(level.is_published),
  };
};
