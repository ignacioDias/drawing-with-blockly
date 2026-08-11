import {getCurrentUser} from './api';

export const setupAuthLink = (link, getLabels) => {
  let isAuthenticated = false;

  const render = () => {
    const labels = getLabels();
    link.textContent = isAuthenticated ? labels.logout : labels.login;
    link.href = isAuthenticated ? 'logout.html' : 'login.html';
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
