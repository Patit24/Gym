import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const env = (import.meta as any).env || {};

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || "AIzaSyBEn6KdmWH3RqZwHzxPT0IqOB_xRamTp6U",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "smart-gym-3db92.firebaseapp.com",
  projectId: env.VITE_FIREBASE_PROJECT_ID || "smart-gym-3db92",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "smart-gym-3db92.firebasestorage.app",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "813059119870",
  appId: env.VITE_FIREBASE_APP_ID || "1:813059119870:web:9b72d78cd1510360ba63af",
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || "G-LYRSZ79MCK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
