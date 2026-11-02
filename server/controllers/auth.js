import { authenticate, issueToken } from '../services/auth.js';
import httpError from '../utils/httpError.js';

const login = (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) throw httpError(400, 'Username and password are required');

  const user = authenticate(username, password);
  if (!user) throw httpError(401, 'Invalid username or password');

  res.json({
    success: true,
    message: 'Signed in',
    data: { token: issueToken(user), user },
  });
};

// Tokens are stateless, so logging out only needs to end the browser session.
const logout = (req, res) => {
  res.json({ success: true, message: 'Signed out' });
};

export { login, logout };
