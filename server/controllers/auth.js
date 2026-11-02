import { authenticate, issueToken } from '../services/auth.js';
import httpError from '../utils/httpError.js';

const login = (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) throw httpError(400, 'Email and password are required');

  const user = authenticate(email, password);
  if (!user) throw httpError(401, 'Invalid email or password');

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
