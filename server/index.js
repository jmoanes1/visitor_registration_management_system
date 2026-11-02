import app from './app.js';
import config from './config.js';

app.listen(config.port, () => {
  console.log(`API ready on http://localhost:${config.port} (${config.nodeEnv})`);
  console.log(`Sign in as "${config.admin.username}" (ADMIN_USERNAME), password from ADMIN_PASSWORD`);
});
