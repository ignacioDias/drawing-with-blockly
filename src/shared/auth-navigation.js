import {getCurrentUser} from './api';

export const setupAuthNavigation = ({authLink, profileLink, adminLink, createLink}, getLabels) => {
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
    if (createLink) {
      createLink.hidden = !isAuthenticated;
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
