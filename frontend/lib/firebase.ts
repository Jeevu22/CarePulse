/**
 * Firebase Client SDK Initialization (Authentication Only)
 * Project: carepulse-2c4eb
 *
 * NOTE: Data storage (Firestore / Realtime Database) is intentionally excluded.
 * All clinical data and readings persist exclusively in the Flask + SQLAlchemy backend.
 */

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
    "AIzaSyA8VBj7MtwcHZ5RoBkGoEmMeZJeiYSJBYc",
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    "carepulse-2c4eb.firebaseapp.com",
  projectId:
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    "carepulse-2c4eb",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    "carepulse-2c4eb.firebasestorage.app",
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ||
    "875977220056",
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ||
    "1:875977220056:web:d9ed85db88e2c3daef1cad",
  measurementId:
    process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ||
    "G-HWENCLVKQV",
};

// Initialize Firebase once
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Authentication only
export const auth: Auth = getAuth(app);

/**
 * Returns fresh Firebase ID Token if user is logged in, or null.
 * Used by lib/api.ts to attach Authorization: Bearer <token> on backend calls.
 */
export async function getFirebaseAuthToken(): Promise<string | null> {
  if (!auth.currentUser) {
    return null;
  }
  try {
    return await auth.currentUser.getIdToken(false);
  } catch (err) {
    console.warn("Failed to retrieve Firebase ID Token:", err);
    return null;
  }
}

export default app;
