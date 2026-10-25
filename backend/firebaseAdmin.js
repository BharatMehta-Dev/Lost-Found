const fs = require("fs");
const path = require("path");
const { cert, getApps, initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore } = require("firebase-admin/firestore");
const { getStorage } = require("firebase-admin/storage");

let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  let raw = process.env.FIREBASE_SERVICE_ACCOUNT.trim();

  // Strip wrapping quotes if added by mistake
  if ((raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'"))) {
    raw = raw.slice(1, -1).trim();
  }

  // Auto-recover if the opening/closing curly brace was accidentally missed during copy
  if (!raw.startsWith("{") && raw.includes('"type"')) {
    raw = "{" + raw;
  }
  if (!raw.endsWith("}") && raw.includes('"type"')) {
    raw = raw + "}";
  }

  try {
    serviceAccount = JSON.parse(raw);
  } catch (error) {
    console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT environment variable:", error.message);
  }
}

// Fallback 1: Render Secret Files default path (/etc/secrets/serviceAccountKey.json)
if (!serviceAccount) {
  const renderSecretPath = "/etc/secrets/serviceAccountKey.json";
  if (fs.existsSync(renderSecretPath)) {
    try {
      serviceAccount = require(renderSecretPath);
    } catch (e) {
      console.error("Failed to read from /etc/secrets/serviceAccountKey.json:", e.message);
    }
  }
}

// Fallback 2: Local project path
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