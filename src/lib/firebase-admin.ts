import * as admin from 'firebase-admin';

function getAdminApp() {
  if (!admin.apps.length) {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    
    if (serviceAccountKey) {
      try {
        const serviceAccount = JSON.parse(serviceAccountKey);
        return admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
      } catch (error) {
        console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:', error);
      }
    }

    // Fallback for build-time or restricted environments
    if (process.env.NODE_ENV === 'production') {
      try {
        // Try to use application default credentials if available (e.g. in GCP/Firebase)
        return admin.initializeApp({
          credential: admin.credential.applicationDefault()
        });
      } catch (error) {
        console.warn('Firebase Admin: No service account key and no default credentials. Admin features will be disabled.');
        return null;
      }
    }

    return null;
  }
  return admin.apps[0];
}

export const adminDb = (() => {
  const app = getAdminApp();
  return app ? admin.firestore() : null as any;
})();

export const adminAuth = (() => {
  const app = getAdminApp();
  return app ? admin.auth() : null as any;
})();

export { admin };
