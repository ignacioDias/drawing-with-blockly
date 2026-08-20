import './styles.css';
import {applyThemeToDocument, readTheme} from '../../shared/preferences';
import {redirectIfAuthenticated, setupAuthForm} from '../auth/form';
import {setupAuthLanguage} from '../auth/i18n';

applyThemeToDocument(readTheme());
setupAuthLanguage('login');
redirectIfAuthenticated().then((authenticated) => {
  if (!authenticated) setupAuthForm('login');
});
