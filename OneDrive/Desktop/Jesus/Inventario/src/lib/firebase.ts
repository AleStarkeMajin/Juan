/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Import user-provided Firebase config placed at project root
import firebaseConfig from "../../firebase-applet-config.json";

const app = initializeApp(firebaseConfig as any);
export const auth = getAuth(app);
export const db = (firebaseConfig as any).firestoreDatabaseId
  ? getFirestore(app, (firebaseConfig as any).firestoreDatabaseId)
  : getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export const signIn = () => signInWithPopup(auth, googleProvider);
export const signOut = () => auth.signOut();

// Attempt anonymous sign-in for development if no user is signed in
signInAnonymously(auth)
  .then(() => console.log("Signed in anonymously to Firebase"))
  .catch((err) =>
    console.debug(
      "Anonymous sign-in failed or not enabled:",
      err && err.code ? err.code : err,
    ),
  );

// Helper: ensure there's an authenticated user (attempt anonymous sign-in if needed)
export const ensureSignedIn = async () => {
  if (auth.currentUser) return auth.currentUser;
  try {
    await signInAnonymously(auth);
    return auth.currentUser;
  } catch (err) {
    console.debug(
      "ensureSignedIn: anonymous sign-in failed",
      err && err.code ? err.code : err,
    );
    return null;
  }
};
