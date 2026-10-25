const { cert, getApps, initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore } = require("firebase-admin/firestore");
const { getStorage } = require("firebase-admin/storage");
const serviceAccount = require("./serviceAccountKey.json");

const firebaseApp = getApps().length
  ? getApps()[0]
  : initializeApp({
      credential: cert(serviceAccount),
      storageBucket: "lost-found-mits-ae898.firebasestorage.app"
    });

const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const bucket = getStorage(firebaseApp).bucket();

module.exports = {
  auth,
  db,
  bucket
};