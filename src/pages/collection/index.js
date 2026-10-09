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
import {getCollections} from '../../shared/api';
import {setupAuthNavigation} from '../../shared/auth-navigation';

const collectionId = new URLSearchParams(window.location.search).get('id');
const levelGrid = document.getElementById('level-grid');
const levelStatus = document.getElementById('level-status');
const collectionTitle = document.getElementById('collection-title');
const collectionDescription = document.getElementById('collection-description');
const themeToggle = document.getElementById('theme-toggle');
const authLink = document.getElementById('auth-link');
const profileLink = document.getElementById('profile-link');
const adminLink = document.getElementById('admin-link');
const languageSelect = document.getElementById('language-select');
const languageLabel = document.querySelector('.control-group span');
const backLink = document.querySelector('.back-link');

let currentLanguage = readLanguage();
let currentTheme = readTheme();
let collection = null;
let completedLevelIds = [];
const renderAuthLink = setupAuthNavigation(
  {authLink, profileLink, adminLink},
  () => translations[currentLanguage].common,
);

adminLink.href = `level-create.html?collection=${encodeURIComponent(collectionId || '')}`;

const localized = (value, language) => value?.[language] || value?.en || '';

const createLevelCard = (level, text) => {
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
  collection?.levels.forEach((level) => levelGrid.appendChild(createLevelCard(level, copy.home)));
  levelStatus.textContent = collection ? '' : copy.home.loading;
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

applyLanguage();

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
