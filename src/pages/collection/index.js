import '../home/styles.css';
import {
  LANGUAGES,
  THEMES,
  applyThemeToDocument,
  readLanguage,
  readTheme,
  writeLanguage,
  writeTheme,
} from '../../shared/preferences';
import {translations} from '../../shared/translations';
import {createLevel, getCollections, getCurrentUser} from '../../shared/api';
import {setupAuthNavigation} from '../../shared/auth-navigation';
import {
  buildImportLevel,
  buildLevelsFile,
  downloadJson,
  extractLevels,
  readFileAsJson,
  slugify,
} from '../../shared/level-io';

const collectionId = new URLSearchParams(window.location.search).get('id');
const levelGrid = document.getElementById('level-grid');
const levelStatus = document.getElementById('level-status');
const collectionTitle = document.getElementById('collection-title');
const collectionDescription = document.getElementById('collection-description');
const themeToggle = document.getElementById('theme-toggle');
const authLink = document.getElementById('auth-link');
const profileLink = document.getElementById('profile-link');
const adminLink = document.getElementById('admin-link');
const exportLevelsButton = document.getElementById('export-levels');
const importLevelsButton = document.getElementById('import-levels');
const importFileInput = document.getElementById('import-file');
const languageSelect = document.getElementById('language-select');
const languageLabel = document.querySelector('.control-group span');
const backLink = document.querySelector('.back-link');

let currentLanguage = readLanguage();
let currentTheme = readTheme();
let collection = null;
let completedLevelIds = [];
let isAdmin = false;
const renderAuthLink = setupAuthNavigation(
  {authLink, profileLink, adminLink},
  () => translations[currentLanguage].common,
);

adminLink.href = `level-create.html?collection=${encodeURIComponent(collectionId || '')}`;

const localized = (value, language) => value?.[language] || value?.en || '';

const createLevelCard = (level, copy) => {
  const text = copy.home;
  const card = document.createElement('button');
  card.type = 'button';
  card.className = 'level-card';
  if (completedLevelIds.includes(level.id)) card.classList.add('completed');
  card.setAttribute('aria-label', `${text.levelLabel} ${level.sort_order}`);

  const badge = document.createElement('span');
  badge.className = 'level-badge';
  badge.textContent = `${text.levelLabel} ${level.sort_order}`;
  const caption = document.createElement('span');
  caption.className = 'level-caption';
  caption.textContent = localized(level.title, currentLanguage) || text.openWorkspace;
  card.append(badge, caption);
  card.addEventListener('click', () => {
    window.location.href = `drawing.html?level=${encodeURIComponent(String(level.id))}`;
  });
  return card;
};

const renderCollection = () => {
  const copy = translations[currentLanguage];
  collectionTitle.textContent = collection?.name || copy.home.title;
  collectionDescription.textContent = collection?.description || '';
  levelGrid.innerHTML = '';
  collection?.levels.forEach((level) => levelGrid.appendChild(createLevelCard(level, copy)));
  levelStatus.textContent = collection ? '' : copy.home.loading;
};

const toExportableLevel = (level) => ({
  title: level.title,
  description: level.description,
  difficulty: level.difficulty,
  is_published: level.is_published,
  starting_row: level.starting_row,
  starting_column: level.starting_column,
  validation_config: level.validation_config,
  board_pairs: Array.isArray(level.board_pairs) && level.board_pairs.length > 0
    ? level.board_pairs
    : [{starting_board: level.starting_board, target_board: level.target_board}],
});

const exportLevels = () => {
  const levels = collection?.levels || [];
  if (!levels.length) {
    levelStatus.textContent = translations[currentLanguage].levelIO.exportEmpty;
    return;
  }
  const name = slugify(collection?.name || '') || 'collection';
  downloadJson(`${name}-levels.json`, buildLevelsFile(levels.map(toExportableLevel)));
};

const importLevels = async (file) => {
  const copy = translations[currentLanguage].levelIO;
  let levels;
  try {
    levels = extractLevels(await readFileAsJson(file));
  } catch (error) {
    levelStatus.textContent = error.message === 'Invalid JSON file' ? copy.loadError : copy.noLevels;
    return;
  }

  let imported = 0;
  for (let i = 0; i < levels.length; i++) {
    try {
      await createLevel(buildImportLevel(levels[i], collectionId, i));
      imported += 1;
    } catch (error) {
      // Continue with the remaining levels.
    }
  }

  let message;
  if (imported === levels.length) {
    message = copy.importSuccess.replace('%1', String(imported));
  } else if (imported > 0) {
    message = copy.importPartial
      .replace('%1', String(imported))
      .replace('%2', String(levels.length));
  } else {
    message = copy.importError;
  }

  await loadCollection();
  levelStatus.textContent = message;
};

const loadCollection = () => {
  getCollections()
    .then((result) => {
      const collections = result.collections;
      completedLevelIds = result.completed_level_ids || [];
      collection = collections.find((item) => String(item.id) === String(collectionId)) || null;
      if (!collection) throw new Error('Collection not found');
      applyLanguage();
    })
    .catch(() => {
      levelStatus.textContent = translations[currentLanguage].home.loadError;
    });
};

const applyTheme = () => {
  applyThemeToDocument(currentTheme);
  themeToggle.setAttribute('aria-pressed', String(currentTheme === THEMES.dark));
  const commonText = translations[currentLanguage].common;
  themeToggle.textContent = currentTheme === THEMES.dark
    ? commonText.themeButtonDark
    : commonText.themeButtonLight;
};

const applyLanguage = () => {
  const copy = translations[currentLanguage];
  languageLabel.textContent = copy.common.languageLabel;
  backLink.textContent = copy.common.backToCollections;
  languageSelect.querySelector('option[value="en"]').textContent = copy.common.languageOptionEn;
  languageSelect.querySelector('option[value="es"]').textContent = copy.common.languageOptionEs;
  languageSelect.value = currentLanguage;
  exportLevelsButton.textContent = copy.common.exportLevels;
  importLevelsButton.textContent = copy.common.importLevels;
  importLevelsButton.hidden = !isAdmin;
  renderAuthLink();
  renderCollection();
  applyTheme();
};

themeToggle.addEventListener('click', () => {
  currentTheme = currentTheme === THEMES.dark ? THEMES.light : THEMES.dark;
  writeTheme(currentTheme);
  applyTheme();
});

languageSelect.addEventListener('change', () => {
  currentLanguage = languageSelect.value === LANGUAGES.es ? LANGUAGES.es : LANGUAGES.en;
  writeLanguage(currentLanguage);
  applyLanguage();
});

exportLevelsButton.addEventListener('click', exportLevels);
importLevelsButton.addEventListener('click', () => importFileInput.click());
importFileInput.addEventListener('change', () => {
  const [file] = importFileInput.files;
  if (file) importLevels(file);
  importFileInput.value = '';
});

applyLanguage();

getCurrentUser()
  .then(({user}) => {
    isAdmin = user.role === 'admin';
    applyLanguage();
  })
  .catch(() => {});

loadCollection();
