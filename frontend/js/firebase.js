import { initializeApp } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyC6jP-2qL6QigTvEQvSjlwz1oQSTijNpu8",
  authDomain: "lost-found-mits-ae898.firebaseapp.com",
  projectId: "lost-found-mits-ae898",
  storageBucket: "lost-found-mits-ae898.firebasestorage.app",
  messagingSenderId: "707573080580",
  appId: "1:707573080580:web:ece9372d8d79dae1da4b51",
  measurementId: "G-X2HYTX3BQG"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const storage = getStorage(app);

async function compressImage(file) {
  if (file.size <= 800 * 1024) {
    return file;
  }

  const bitmap = await createImageBitmap(file);
  const maxDimension = 1280;
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));

  const context = canvas.getContext("2d");
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const blob = await new Promise((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", 0.75);
  });

  if (!blob) {
    return file;
  }

  return new File([blob], `${file.name.replace(/\.[^.]+$/, "")}.jpg`, {
    type: "image/jpeg",
    lastModified: Date.now()
  });
}

export async function uploadItemImage(file, folder) {
  if (!file) {
    return "";
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("Please select an image file.");
  }

  if (file.size > 15 * 1024 * 1024) {
    throw new Error("Image must be smaller than 15 MB.");
  }

  const user = auth.currentUser;
  if (!user) {
    throw new Error("Please log in before uploading an image.");
  }

  const optimizedFile = await compressImage(file);
  const safeName = optimizedFile.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const imageRef = ref(storage, `${folder}/${user.uid}/${Date.now()}-${safeName}`);
  await uploadBytes(imageRef, optimizedFile, { contentType: optimizedFile.type });
  return getDownloadURL(imageRef);
}