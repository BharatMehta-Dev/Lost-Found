const fs = require("fs");
const path = require("path");
const { cert, getApps, initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore } = require("firebase-admin/firestore");
const { getStorage } = require("firebase-admin/storage");

let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } catch (error) {
    console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT environment variable:", error.message);
  }
}

if (!serviceAccount) {
  const localKeyPath = path.join(__dirname, "serviceAccountKey.json");
  if (fs.existsSync(localKeyPath)) {
    serviceAccount = require(localKeyPath);
  } else {
    throw new Error(
      "Firebase credentials missing. Provide FIREBASE_SERVICE_ACCOUNT environment variable or serviceAccountKey.json."
    );
  }
}

const firebaseApp = getApps().length
  ? getApps()[0]
  : initializeApp({
      credential: cert(serviceAccount),
      storageBucket: process.env.STORAGE_BUCKET || "lost-found-mits-ae898.firebasestorage.app"
    });

const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const bucket = getStorage(firebaseApp).bucket();

module.exports = {
  auth,
  db,
  bucket
};