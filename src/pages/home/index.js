import './styles.css';
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

const collectionList = document.getElementById('collection-list');
const levelStatus = document.getElementById('level-status');
const themeToggle = document.getElementById('theme-toggle');
const authLink = document.getElementById('auth-link');
const profileLink = document.getElementById('profile-link');
const languageSelect = document.getElementById('language-select');
const languageLabel = document.querySelector('.control-group span');
const homeTitle = document.getElementById('home-title');
const homeSubtitle = document.getElementById('home-subtitle');

let currentLanguage = readLanguage();
let currentTheme = readTheme();
let collections = [];
const renderAuthLink = setupAuthNavigation(
  {authLink, profileLink},
  () => translations[currentLanguage].common,
);

const localized = (value, language) => value?.[language] || value?.en || '';

const createCollection = (collection) => {
  const card = document.createElement('button');
  card.type = 'button';
  card.className = 'collection-card';
  card.setAttribute('aria-label', collection.name);

  const heading = document.createElement('h2');
  heading.textContent = collection.name;
  const description = document.createElement('p');
  description.textContent = collection.description;
  card.append(heading, description);
  card.addEventListener('click', () => {
    window.location.href = `collection.html?id=${encodeURIComponent(String(collection.id))}`;
  });
  return card;
};

const renderCollections = () => {
  collectionList.innerHTML = '';
  collections.forEach((collection) => collectionList.appendChild(createCollection(collection)));
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
  languageSelect.querySelector('option[value="en"]').textContent = copy.common.languageOptionEn;
  languageSelect.querySelector('option[value="es"]').textContent = copy.common.languageOptionEs;
  languageSelect.value = currentLanguage;
  homeTitle.textContent = copy.home.title;
  homeSubtitle.textContent = copy.home.subtitle;
  levelStatus.textContent = collections.length ? '' : copy.home.loading;
  renderAuthLink();
  renderCollections();
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
  .then((loadedCollections) => {
    collections = loadedCollections;
    applyLanguage();
  })
  .catch(() => {
    levelStatus.textContent = translations[currentLanguage].home.loadError;
  });
