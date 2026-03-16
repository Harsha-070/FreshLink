const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

let db = null;

function initFirebase() {
  // Check for service account key file
  const keyPaths = [
    path.join(__dirname, '..', 'serviceAccountKey.json'),
    path.join(__dirname, '..', '..', 'serviceAccountKey.json'),
  ];

  let serviceAccount = null;
  for (const keyPath of keyPaths) {
    if (fs.existsSync(keyPath)) {
      serviceAccount = require(keyPath);
      console.log('  [Firebase] Found service account key at', keyPath);
      break;
    }
  }

  if (!serviceAccount) {
    // Try environment variable
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      try {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        console.log('  [Firebase] Using service account from environment variable');
      } catch (e) {
        // ignore
      }
    }
  }

  if (!serviceAccount) {
    console.log('  [Firebase] No service account found. Place serviceAccountKey.json in /backend/');
    console.log('  [Firebase] Falling back to local JSON file storage');
    return null;
  }

  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    db = admin.firestore();
    console.log('  [Firebase] Connected to Firestore successfully');
    return db;
  } catch (err) {
    console.error('  [Firebase] Init failed:', err.message);
    return null;
  }
}

function getFirestore() {
  return db;
}

module.exports = { initFirebase, getFirestore };
