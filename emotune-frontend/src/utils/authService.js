// emotune-frontend\src\utils\authService.js

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { auth } from "./firebaseConfig";

import { getAuth } from "firebase/auth";

// const auth = getAuth();
const googleProvider = new GoogleAuthProvider();
// src/utils/authService.js
import { onAuthStateChanged } from "firebase/auth";

googleProvider.setCustomParameters({
  prompt: "select_account",
});

// A listener to check the auth state whenever it changes
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Returns the current user object (or null) synchronously
export const getCurrentUser = () => {
  return auth.currentUser;
};

// Standard Firebase sign-out
export const logoutUser = async () => {
  try {
    await signOut(auth);
    // Optional: Clean up localStorage items related to user session if needed
    localStorage.removeItem("current_user_email");
    localStorage.removeItem("isLoggedIn");
    return true;
  } catch (error) {
    console.error("Logout failed:", error);
    return false;
  }
};

// NOTE: You'll need other functions like loginUser, registerUser, etc.
// in this file, which are not included here for brevity.

// --- Utility function to format user object for local use ---
const formatUser = (user, name = null) => {
  if (!user) return null;

  return {
    uid: user.uid,
    name:
      name ||
      user.displayName ||
      (user.email ? user.email.split("@")[0] : "User"),
    email: user.email,
    memberSince: new Date().toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    }),
    profilePic: user.photoURL,
  };
};

// --- CORE FIX FOR Profile.jsx:13 ---
/**
 * Synchronously returns the current logged-in user object (formatted), or null.
 */

// --- Existing Firebase Authentication Functions ---

export const registerUser = async (name, email, password) => {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
  const user = userCredential.user;
  await updateProfile(user, { displayName: name });
  return formatUser(user, name);
};

export const loginUser = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );
  return formatUser(userCredential.user);
};

export const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return formatUser(result.user);
};

export const resetPassword = async (email) => {
  await sendPasswordResetEmail(auth, email);
};
