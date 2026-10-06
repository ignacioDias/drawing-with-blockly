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
import {getProfile, updateProfile} from '../../shared/api';
import {setupAuthNavigation} from '../../shared/auth-navigation';

const themeToggle = document.getElementById('theme-toggle');
const authLink = document.getElementById('auth-link');
const languageSelect = document.getElementById('language-select');
const languageLabel = document.querySelector('.control-group span');
const backLink = document.querySelector('.back-link');
const profileTitle = document.getElementById('profile-title');
const profileSubtitle = document.getElementById('profile-subtitle');
const accountHeading = document.getElementById('account-heading');
const fieldsHeading = document.getElementById('fields-heading');
const usernameLabel = document.getElementById('username-label');
const roleLabel = document.getElementById('role-label');
const memberSinceLabel = document.getElementById('member-since-label');
const profileUsername = document.getElementById('profile-username');
const profileRole = document.getElementById('profile-role');
const profileMemberSince = document.getElementById('profile-member-since');
const profileStatus = document.getElementById('profile-status');

let currentLanguage = readLanguage();
let currentTheme = readTheme();
let profile = null;
const renderAuthLink = setupAuthNavigation({authLink}, () => translations[currentLanguage].common);

const fields = [
  {key: 'display_name', labelKey: 'displayName'},
  {key: 'email', labelKey: 'email'},
  {key: 'bio', labelKey: 'bio'},
].map((field) => {
  const root = document.querySelector(`.profile-field[data-field="${field.key}"]`);
  return {
    ...field,
    root,
    label: root.querySelector('.profile-field-label'),
    value: root.querySelector('.profile-field-value'),
    form: root.querySelector('.profile-field-form'),
    input: root.querySelector('.profile-field-input'),
    edit: root.querySelector('.profile-edit'),
    remove: root.querySelector('.profile-delete'),
    save: root.querySelector('.profile-save'),
    cancel: root.querySelector('.profile-cancel'),
  };
});

const applyTheme = () => {
  applyThemeToDocument(currentTheme);
  themeToggle.setAttribute('aria-pressed', String(currentTheme === THEMES.dark));
  const commonText = translations[currentLanguage].common;
  themeToggle.textContent = currentTheme === THEMES.dark
    ? commonText.themeButtonDark
    : commonText.themeButtonLight;
};

const showViewingMode = (field) => {
  field.form.hidden = true;
  field.value.hidden = false;
  field.edit.hidden = false;
  field.remove.hidden = false;
  field.save.disabled = false;
  field.remove.disabled = false;
};

const renderProfile = () => {
  const copy = translations[currentLanguage].profile;
  profileUsername.textContent = profile?.username || '';
  profileRole.textContent = profile?.role === 'admin' ? copy.roleAdmin : copy.roleNormal;
  profileMemberSince.textContent = profile
    ? new Date(profile.created_at).toLocaleDateString(currentLanguage)
    : '';

  fields.forEach((field) => {
    field.label.textContent = copy[field.labelKey];
    field.value.textContent = profile?.[field.key] || copy.notSet;
    field.value.classList.toggle('profile-field-empty', !profile?.[field.key]);
    field.edit.textContent = copy.edit;
    field.remove.textContent = copy.delete;
    field.save.textContent = copy.save;
    field.cancel.textContent = copy.cancel;
    showViewingMode(field);
  });
};

const applyLanguage = () => {
  const copy = translations[currentLanguage];
  languageLabel.textContent = copy.common.languageLabel;
  backLink.textContent = copy.profile.back;
  languageSelect.querySelector('option[value="en"]').textContent = copy.common.languageOptionEn;
  languageSelect.querySelector('option[value="es"]').textContent = copy.common.languageOptionEs;
  languageSelect.value = currentLanguage;
  profileTitle.textContent = copy.profile.title;
  profileSubtitle.textContent = copy.profile.subtitle;
  accountHeading.textContent = copy.profile.account;
  fieldsHeading.textContent = copy.profile.fields;
  usernameLabel.textContent = copy.profile.username;
  roleLabel.textContent = copy.profile.role;
  memberSinceLabel.textContent = copy.profile.memberSince;
  if (!profile) profileStatus.textContent = copy.profile.loading;
  renderAuthLink();
  renderProfile();
  applyTheme();
};

const setStatus = (message) => {
  profileStatus.textContent = message;
};

fields.forEach((field) => {
  field.edit.addEventListener('click', () => {
    field.input.value = profile?.[field.key] || '';
    field.value.hidden = true;
    field.edit.hidden = true;
    field.remove.hidden = true;
    field.form.hidden = false;
    field.input.focus();
  });

  field.cancel.addEventListener('click', () => showViewingMode(field));

  field.form.addEventListener('submit', async (event) => {
    event.preventDefault();
    field.save.disabled = true;
    try {
      profile = await updateProfile({[field.key]: field.input.value.trim()});
      setStatus('');
      renderProfile();
    } catch (error) {
      setStatus(error.message);
      field.save.disabled = false;
    }
  });

  field.remove.addEventListener('click', async () => {
    field.remove.disabled = true;
    try {
      profile = await updateProfile({[field.key]: null});
      setStatus('');
      renderProfile();
    } catch (error) {
      setStatus(error.message);
      field.remove.disabled = false;
    }
  });
});

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

getProfile()
  .then((loadedProfile) => {
    profile = loadedProfile;
    setStatus('');
    applyLanguage();
  })
  .catch((error) => {
    if (/authentication|session/i.test(error.message)) {
      window.location.href = 'login.html';
      return;
    }
    setStatus(translations[currentLanguage].profile.loadError);
  });
