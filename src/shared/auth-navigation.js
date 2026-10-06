import {getCurrentUser} from './api';

export const setupAuthNavigation = ({authLink, profileLink, adminLink}, getLabels) => {
  let isAuthenticated = false;
  let isAdmin = false;

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
    if (adminLink) {
      adminLink.hidden = !isAdmin;
    }
  };

  render();
  getCurrentUser()
    .then(({user}) => {
      isAuthenticated = true;
      isAdmin = user.role === 'admin';
      render();
    })
    .catch(() => {});

  return render;
};
