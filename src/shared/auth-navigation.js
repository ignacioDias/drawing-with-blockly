import {getCurrentUser} from './api';

export const setupAuthNavigation = ({authLink, profileLink}, getLabels) => {
  let isAuthenticated = false;

  const render = () => {
    const labels = getLabels();
    if (authLink) {
      authLink.textContent = isAuthenticated ? labels.logout : labels.login;
      authLink.href = isAuthenticated ? 'logout.html' : 'login.html';
    }
    if (profileLink) {
      profileLink.textContent = labels.profile;
      profileLink.href = 'profile.html';
      profileLink.hidden = !isAuthenticated;
    }
  };

  render();
  getCurrentUser()
    .then(() => {
      isAuthenticated = true;
      render();
    })
    .catch(() => {});

  return render;
};
