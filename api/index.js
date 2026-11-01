import app from '../backend/src/app.js';

// Vercel Functions receive native Node.js req/res objects, so the Express app
// itself is the handler and no long-lived listener is needed.
export default app;
