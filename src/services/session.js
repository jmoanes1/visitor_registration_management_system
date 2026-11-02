// The browser session lives in localStorage so a page refresh keeps you signed
// in. Only non-secret profile fields are stored here.
const TOKEN_KEY = 'token';
const USER_KEY = 'user';

const readToken = () => localStorage.getItem(TOKEN_KEY);

const readUser = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY));
  } catch {
    return null;
  }
};

const saveSession = ({ token, user }) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export { readToken, readUser, saveSession, clearSession };
