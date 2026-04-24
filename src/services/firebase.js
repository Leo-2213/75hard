// =====================================================
// src/services/firebase.js
// Firebase initialization + auth + firestore exports
// =====================================================
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { GoogleAuthProvider, signInWithCredential, signInWithPopup } from 'firebase/auth';
import { Capacitor } from '@capacitor/core';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';

// ─────────────────────────────────────────────────────
//  🔴 REPLACE THESE VALUES with your Firebase project config
//  Get them from: Firebase Console → Project Settings → Your Apps
// ─────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyDLbvJwupxbLa90D24DTQIGFnUVkC7blno",
  authDomain: "hard-tracker-41887.firebaseapp.com",
  projectId: "hard-tracker-41887",
  storageBucket: "hard-tracker-41887.firebasestorage.app",
  messagingSenderId: "965089864427",
  appId: "1:965089864427:web:a61fa741baccbcf7baacae",
  measurementId: "G-HPQT4K6QY3"
};


// Initialize Firebase app (singleton)
const app = initializeApp(firebaseConfig);

// ── Exports ──────────────────────────────────────────
export const auth = getAuth(app);
export const db   = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// ─────────────────────────────────────────────────────
//  AUTH HELPERS
// ─────────────────────────────────────────────────────

/** Sign in with Google popup */
export const signInWithGoogle = async () => {
  if (Capacitor.isNativePlatform()) {
    try {
      // Initialize first, then sign in
      await GoogleAuth.initialize({
        clientId: '965089864427-ljber3lusl34mru515rhtk9m9it432ev.apps.googleusercontent.com',
        scopes: ['profile', 'email'],
        grantOfflineAccess: true,
      });
      const googleUser = await GoogleAuth.signIn();
      const credential = GoogleAuthProvider.credential(
          googleUser.authentication.idToken
      );
      return signInWithCredential(auth, credential);
    } catch (err) {
      console.error('Google Sign-in error:', err);
      throw err;
    }
  } else {
    return signInWithPopup(auth, googleProvider);
  }
};
/** Create a new email/password account and save user doc */
export const registerWithEmail = async (name, email, password) => {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  // Set display name
  await updateProfile(cred.user, { displayName: name });
  // Create Firestore user document
  await createUserDoc(cred.user, name);
  return cred;
};

/** Sign in with email and password */
export const loginWithEmail = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

/** Sign out current user */
export const logout = () => signOut(auth);

// ─────────────────────────────────────────────────────
//  FIRESTORE HELPERS
// ─────────────────────────────────────────────────────

/**
 * Create or update a user document in Firestore.
 * Called after first sign-in so user metadata is stored.
 */
export const createUserDoc = async (user, displayName) => {
  const userRef = doc(db, 'users', user.uid);
  const snap    = await getDoc(userRef);

  if (!snap.exists()) {
    const name = displayName || user.displayName || 'Champion';
    await setDoc(userRef, {
      name:      name,
      email:     user.email,
      createdAt: serverTimestamp(),
    });
  }
};

/**
 * Fetch all progress documents for a user.
 * Returns an object: { day_1: {...}, day_2: {...}, ... }
 */
export const fetchUserProgress = async (uid) => {
  const progressRef = collection(db, 'users', uid, 'progress');
  const snapshot    = await getDocs(progressRef);
  const progress    = {};
  snapshot.forEach((d) => { progress[d.id] = d.data(); });
  return progress;
};

/**
 * Save (merge) a single day's progress to Firestore.
 * @param {string} uid      - Firebase user UID
 * @param {number} dayNum   - Day number (1–75)
 * @param {object} data     - Progress fields for that day
 */
export const saveDayProgress = async (uid, dayNum, data) => {
  const dayRef = doc(db, 'users', uid, 'progress', `day_${dayNum}`);
  await setDoc(dayRef, { ...data, updatedAt: serverTimestamp() }, { merge: true });
};

/**
 * Fetch the user's profile document.
 */
export const fetchUserDoc = async (uid) => {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : null;
};

/**
 * Delete all progress documents for a user.
 */
export const deleteAllProgress = async (uid) => {
  const progressRef = collection(db, 'users', uid, 'progress');
  const snapshot = await getDocs(progressRef);
  const deletePromises = snapshot.docs.map((d) => deleteDoc(d.ref));
  await Promise.all(deletePromises);
};
