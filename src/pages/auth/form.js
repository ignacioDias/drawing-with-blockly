import {getCurrentUser, login, register} from '../../shared/api';

export const redirectIfAuthenticated = async () => {
  try {
    await getCurrentUser();
    window.location.href = 'index.html';
    return true;
  } catch {
    return false;
  }
};

export const setupAuthForm = (mode) => {
  const form = document.getElementById('auth-form');
  const status = document.getElementById('auth-status');
  const submit = form.querySelector('button[type="submit"]');
  const request = mode === 'login' ? login : register;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    status.textContent = '';
    submit.disabled = true;

    const formData = new FormData(form);
    try {
      await request({
        username: formData.get('username'),
        password: formData.get('password'),
      });
      window.location.href = 'index.html';
    } catch (error) {
      status.textContent = error.message;
      submit.disabled = false;
    }
  });
};
