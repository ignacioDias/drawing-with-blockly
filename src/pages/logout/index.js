import './styles.css';
import {applyThemeToDocument, readTheme} from '../../shared/preferences';
import {logout} from '../../shared/api';
import {setupAuthLanguage} from '../auth/i18n';

applyThemeToDocument(readTheme());
const status = document.getElementById('auth-status');
const getCopy = setupAuthLanguage('logout');

logout()
  .catch(() => {
    status.textContent = getCopy().alreadySignedOut;
  })
  .finally(() => {
    window.setTimeout(() => {
      window.location.href = 'index.html';
    }, 500);
  });
