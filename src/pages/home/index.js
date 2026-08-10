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

const DEFAULT_LEVEL_COUNT = 12;
const levelGrid = document.getElementById('level-grid');
const themeToggle = document.getElementById('theme-toggle');
const languageSelect = document.getElementById('language-select');
const languageLabel = document.querySelector('.control-group span');
const homeTitle = document.getElementById('home-title');
const homeSubtitle = document.getElementById('home-subtitle');

let currentLanguage = readLanguage();
let currentTheme = readTheme();

const createLevelCard = (levelId, text) => {
  const card = document.createElement('button');
  card.type = 'button';
  card.className = 'level-card';
  card.setAttribute('aria-label', `Open level ${levelId}`);
  card.innerHTML = `
    <span class="level-badge">${text.levelLabel} ${levelId}</span>
    <span class="level-caption">${text.openWorkspace}</span>
  `;

  card.addEventListener('click', () => {
    window.location.href = `drawing.html?level=${encodeURIComponent(String(levelId))}`;
  });

  return card;
};

const renderLevels = () => {
  levelGrid.innerHTML = '';
  const text = translations[currentLanguage].home;
  for (let levelId = 1; levelId <= DEFAULT_LEVEL_COUNT; levelId++) {
    levelGrid.appendChild(createLevelCard(levelId, text));
  }
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
  renderLevels();
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
