const admin = require('firebase-admin');
const fs = require('fs');

try {
  if (admin.apps.length === 0) {
    const keyPath = process.env.FIREBASE_ADMIN_KEY;

    if (!keyPath) {
      throw new Error('FIREBASE_ADMIN_KEY is not defined in environment variables');
    }

    const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id,
    });

    console.log('[Firebase Admin] Initialized successfully');
  }
} catch (error) {
  console.warn('[Firebase Admin] Initialization failed:', error.message);
  console.warn('[Firebase Admin] Token verification will be skipped');
}

module.exports = admin;
