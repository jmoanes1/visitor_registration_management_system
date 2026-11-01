import { authenticateUser, issueToken } from '../services/authService.js';

const login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    const error = new Error('Email and password are required');
    error.statusCode = 400;
    throw error;
  }

  const user = authenticateUser(email, password);
  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  res.json({
    success: true,
    message: 'Login successful',
    token: issueToken(user),
    user,
  });
};

const logout = (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful',
  });
};

const me = (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.auth.sub,
      email: req.auth.email,
      name: req.auth.name,
      role: req.auth.role,
    },
  });
};

export { login, logout, me };
