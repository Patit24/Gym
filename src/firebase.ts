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

/**
 * Creates a new user in Firebase Authentication using an isolated in-memory secondary App instance.
 * Using `inMemoryPersistence` guarantees the current logged-in user (e.g. Master Admin, Owner, Manager)
 * is NEVER signed out, replaced, or interrupted when provisioning accounts for Trainers, Staff, or Members.
 */
export async function createIsolatedAuthUser(email: string, pass: string): Promise<string> {
  const { initializeApp: initSecondaryApp, deleteApp } = await import('firebase/app');
  const { initializeAuth, inMemoryPersistence, createUserWithEmailAndPassword, signOut } = await import('firebase/auth');
  
  const secondaryAppName = `auth-creator-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const secondaryApp = initSecondaryApp(firebaseConfig, secondaryAppName);
  
  // CRITICAL: Initialize secondary auth strictly in memory so it never writes to IndexedDB/LocalStorage
  // or broadcasts auth state change events to the primary application.
  const secondaryAuth = initializeAuth(secondaryApp, {
    persistence: inMemoryPersistence
  });

  try {
    const userCred = await createUserWithEmailAndPassword(secondaryAuth, email, pass);
    const newUid = userCred.user.uid;
    try {
      await signOut(secondaryAuth);
    } catch {}
    await deleteApp(secondaryApp);
    return newUid;
  } catch (err: any) {
    try {
      await deleteApp(secondaryApp);
    } catch {}
    throw err;
  }
}

export { app, db, auth, firebaseConfig };
