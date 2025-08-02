const admin = require('firebase-admin');

try {
  if (admin.apps.length === 0) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_KEY);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: 'stardy-205',
    });

    console.log('[Firebase Admin] Initialized with ENV key');
  }
} catch (error) {
  console.warn('[Firebase Admin] Initialization failed:', error.message);
  console.warn('[Firebase Admin] Token verification will be skipped');
}

module.exports = admin;
