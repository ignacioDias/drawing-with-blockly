import {LANGUAGES, readLanguage, writeLanguage} from '../../shared/preferences';
import {translations} from '../../shared/translations';

export const setupAuthLanguage = (page) => {
  const languageSelect = document.getElementById('language-select');
  const languageLabel = document.getElementById('language-label');
  let currentLanguage = readLanguage();

  const render = () => {
    const copy = translations[currentLanguage];
    const authCopy = copy.auth[page];
    document.getElementById('auth-title').textContent = authCopy.title;
    if (document.getElementById('auth-subtitle')) {
      document.getElementById('auth-subtitle').textContent = authCopy.subtitle;
    }
    if (document.getElementById('username-label')) {
      document.getElementById('username-label').textContent = authCopy.username;
      document.getElementById('password-label').textContent = authCopy.password;
      document.getElementById('auth-submit').textContent = authCopy.submit;
      document.getElementById('auth-alternate').textContent = authCopy.alternate;
    }
    if (document.getElementById('auth-status') && page === 'logout') {
      document.getElementById('auth-status').textContent = authCopy.loading;
    }
    document.getElementById('auth-back').textContent = authCopy.back;
    languageLabel.textContent = copy.common.languageLabel;
    languageSelect.querySelector('option[value="en"]').textContent = copy.common.languageOptionEn;
    languageSelect.querySelector('option[value="es"]').textContent = copy.common.languageOptionEs;
    languageSelect.value = currentLanguage;
  };

  languageSelect.addEventListener('change', () => {
    currentLanguage = languageSelect.value === LANGUAGES.es ? LANGUAGES.es : LANGUAGES.en;
    writeLanguage(currentLanguage);
    render();
  });

  render();
  return () => translations[currentLanguage].auth[page];
};
