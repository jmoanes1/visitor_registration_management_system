const DEV_CREDENTIALS = {
  email: 'admin@visitorreg.com',
  password: 'admin123',
};

const authenticateUser = (email, password) => {
  if (email === DEV_CREDENTIALS.email && password === DEV_CREDENTIALS.password) {
    return {
      id: 'u-001',
      email: DEV_CREDENTIALS.email,
      name: 'Admin User',
      role: 'Administrator',
    };
  }
  return null;
};

export { authenticateUser, DEV_CREDENTIALS };
