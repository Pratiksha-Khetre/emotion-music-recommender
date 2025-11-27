// emotune-frontend\src\utils\dbService.js

import { db } from "./firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

// --- CORE FIX FOR Profile.jsx:15 ---
/**
 * Fetches additional user profile information from the Firestore database.
 * @param {string} uid The user's Firebase Authentication UID.
 */
export const getUserInfoFromDB = async (uid) => {
  if (!uid) return null;

  // Assumes you have a top-level collection named 'users'
  // where the document ID is the user's UID.
  const userDocRef = doc(db, "users", uid);

  try {
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      // Returns the document data
      return userDocSnap.data();
    } else {
      console.log(`No user document found in DB for UID: ${uid}`);
      return null;
    }
  } catch (error) {
    console.error("Error fetching user info from DB:", error);
    return null;
  }
};
