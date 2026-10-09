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
import {createCollection, getCurrentUser} from '../../shared/api';
import {createLocalCollection} from '../../shared/local-store';
import {setupAuthNavigation} from '../../shared/auth-navigation';

const themeToggle = document.getElementById('theme-toggle');
const authLink = document.getElementById('auth-link');
const profileLink = document.getElementById('profile-link');
const languageSelect = document.getElementById('language-select');
const languageLabel = document.querySelector('.control-group span');
const backLink = document.querySelector('.back-link');
const createTitle = document.getElementById('create-title');
const createSubtitle = document.getElementById('create-subtitle');
const nameLabel = document.getElementById('name-label');
const descriptionLabel = document.getElementById('description-label');
const submit = document.getElementById('create-submit');
const status = document.getElementById('create-status');
const form = document.getElementById('create-form');
const nameInput = document.getElementById('collection-name');
const descriptionInput = document.getElementById('collection-description');

let currentLanguage = readLanguage();
let currentTheme = readTheme();
let isAdmin = false;
const renderAuthLink = setupAuthNavigation(
  {authLink, profileLink},
  () => translations[currentLanguage].common,
);

const applyTheme = () => {
  applyThemeToDocument(currentTheme);
  themeToggle.setAttribute('aria-pressed', String(currentTheme === THEMES.dark));
  const commonText = translations[currentLanguage].common;
  themeToggle.textContent = currentTheme === THEMES.dark
    ? commonText.themeButtonDark
    : commonText.themeButtonLight;
};

const applyLanguage = () => {
  const copy = translations[currentLanguage].create.collection;
  languageLabel.textContent = translations[currentLanguage].common.languageLabel;
  backLink.textContent = copy.back;
  languageSelect.querySelector('option[value="en"]').textContent = translations[currentLanguage].common.languageOptionEn;
  languageSelect.querySelector('option[value="es"]').textContent = translations[currentLanguage].common.languageOptionEs;
  languageSelect.value = currentLanguage;
  createTitle.textContent = copy.title;
  createSubtitle.textContent = copy.subtitle;
  nameLabel.textContent = copy.name;
  descriptionLabel.textContent = copy.description;
  nameInput.placeholder = copy.namePlaceholder;
  descriptionInput.placeholder = copy.descriptionPlaceholder;
  submit.textContent = copy.submit;
  renderAuthLink();
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

getCurrentUser()
  .then(({user}) => {
    isAdmin = user.role === 'admin';
  })
  .catch(() => {
    window.location.href = 'login.html';
  });

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  status.textContent = '';
  submit.disabled = true;
  const fields = {
    name: nameInput.value.trim(),
    description: descriptionInput.value.trim(),
  };
  try {
    if (isAdmin) {
      await createCollection(fields);
    } else {
      createLocalCollection(fields);
    }
    window.location.href = 'index.html';
  } catch (error) {
    status.textContent = error.message || translations[currentLanguage].create.collection.error;
    submit.disabled = false;
  }
});
