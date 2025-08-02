// Firebase Admin SDK Configuration
const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK
try {
    // Check if Firebase Admin is already initialized
    if (admin.apps.length === 0) {
        // You can use service account key file or environment variables
        // For now, we'll use the project ID from environment
        admin.initializeApp({
            projectId: 'stardy-205',
            // If you have a service account key file, uncomment the line below:
            // credential: admin.credential.cert(path.join(__dirname, 'service-account-key.json'))
        });
        
        console.log('[Firebase Admin] Initialized successfully');
    }
} catch (error) {
    console.warn('[Firebase Admin] Initialization failed:', error.message);
    console.warn('[Firebase Admin] Token verification will be skipped');
}

module.exports = admin;
