import './styles.css';
import {redirectIfAuthenticated, setupAuthForm} from '../auth/form';
import {setupAuthLanguage} from '../auth/i18n';

setupAuthLanguage('register');
redirectIfAuthenticated().then((authenticated) => {
  if (!authenticated) setupAuthForm('register');
});
