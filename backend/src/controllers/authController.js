import { authenticateUser } from '../services/authService.js';

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
    message: 'Login successful (mock authentication)',
    token: 'dev-mock-token',
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
      id: 'u-001',
      email: 'admin@visitorreg.com',
      name: 'Admin User',
      role: 'Administrator',
    },
  });
};

export { login, logout, me };
