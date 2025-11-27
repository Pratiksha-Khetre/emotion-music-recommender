// src/utils/statsTracker.js

// 1. Import all necessary Firebase utility functions from the Firestore SDK
import {
  setDoc,
  doc,
  arrayUnion,
  updateDoc,
  increment,
} from "firebase/firestore";

// 2. Import your initialized database instance 'db' from your local config file
// NOTE: Ensure your firebaseConfig.js exports 'db' (i.e., export { db };)
import { db } from "/src/utils/firebaseConfig.js";

// 3. Import your authentication service function
// NOTE: Ensure your authService.js exports 'getCurrentUser'
import { getCurrentUser } from "./authService";

// Helper function to get the document reference for the current user's profile
const getProfileDocRef = (uid) => doc(db, "users", uid);

// Function to update any field on the user's document using merge: true
export const updateUserProfileData = async (data) => {
  const user = getCurrentUser();
  if (!user) {
    console.error("No user logged in to update data.");
    return;
  }
  try {
    // Merges the new data with the existing document data
    await setDoc(getProfileDocRef(user.uid), data, { merge: true });
  } catch (e) {
    console.error("Error updating document: ", e);
  }
};

/**
 * Adds a song object to the user's favoriteSongs array in Firestore.
 * This is the function that was missing and caused the last SyntaxError.
 * It uses arrayUnion to safely append the new song to the array.
 * @param {object} songData - The object containing song details (e.g., {id: "s1", title: "Song 1", ...})
 */
export const addFavoriteSong = async (songData) => {
  const user = getCurrentUser();
  if (!user) {
    console.error("No user logged in to add favorite song.");
    return;
  }

  try {
    const userDocRef = getProfileDocRef(user.uid);

    // Use updateDoc for a specific field update and arrayUnion for atomic array append
    // Note: Using dot notation for nested fields (stats.favoriteSongs)
    await updateDoc(userDocRef, {
      "stats.favoriteSongs": arrayUnion(songData),
    });
    console.log(`Song ${songData.title} added to favorites successfully.`);
  } catch (e) {
    // Log the error but also include the song data for context
    console.error("Error adding favorite song to Firestore: ", e, { songData });
  }
};

export const incrementScans = async () => {
  const user = getCurrentUser();
  if (!user) {
    console.error("No user logged in to increment scan count.");
    return;
  }

  try {
    const userDocRef = getProfileDocRef(user.uid);

    // Use updateDoc and increment for atomic, safe updates to a numeric field
    await updateDoc(userDocRef, {
      "stats.totalScans": increment(1),
    });
    console.log("Total scans successfully incremented.");
  } catch (e) {
    console.error("Error incrementing total scans:", e);
  }
};

export const incrementSongsPlayed = async () => {
  const user = getCurrentUser();
  if (!user) {
    console.error("No user logged in to increment songs played count.");
    return;
  }

  try {
    const userDocRef = getProfileDocRef(user.uid);

    // Use updateDoc and increment for atomic, safe updates to the songsPlayed field
    await updateDoc(userDocRef, {
      "stats.songsPlayed": increment(1),
    });
    console.log("Songs played successfully incremented.");
  } catch (e) {
    console.error("Error incrementing songs played:", e);
  }
};

export const recordEmotion = async (emotion) => {
  const user = getCurrentUser();
  if (!user) {
    console.error("No user logged in to record emotion.");
    return;
  }

  try {
    const userDocRef = getProfileDocRef(user.uid);
    const emotionCountPath = `stats.emotionCounts.${emotion}`;

    // 1. Atomically increment the count for the specific emotion
    // We also want to record this emotion in the 'recentEmotions' array.
    // Since Firebase doesn't have an array queue, we will rely on fetching the full
    // stats in MainDashboard/Profile and updating the whole array on the client side
    // to maintain the "recent" history, but for simplicity here, we'll just push.

    await updateDoc(userDocRef, {
      [emotionCountPath]: increment(1),
      "stats.recentEmotions": arrayUnion(emotion), // Simple push for now
    });
    console.log(`Emotion '${emotion}' successfully recorded.`);
  } catch (e) {
    // If the update fails because the parent field (stats.emotionCounts) doesn't exist,
    // we use setDoc with merge: true to create it.
    if (e.code === "not-found" || e.message.includes("No document to update")) {
      console.warn(
        "User document not found or initial stats missing. Creating/Merging initial data."
      );
      await updateUserProfileData({
        stats: {
          emotionCounts: { [emotion]: 1 },
          recentEmotions: [emotion],
        },
      });
    } else {
      console.error("Error recording emotion:", e);
    }
  }
};

export const initializeUserProfile = async (user) => {
  const userDocRef = getProfileDocRef(user.uid);
  const date = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  const initialData = {
    name: user.displayName || user.email.split("@")[0], // Use display name or part of email
    email: user.email,
    memberSince: date,
    profilePic: user.photoURL || null,
    selectedLanguages: ["English"], // Set a default
    stats: {
      totalScans: 0,
      songsPlayed: 0,
      mostDetectedEmotion: "Neutral",
      emotionCounts: {},
      favoriteSongs: [],
      recentEmotions: [],
    },
    settings: {
      autoPlay: true,
      defaultEmotion: "Neutral",
    },
  };

  try {
    // Use setDoc without merge: true to ensure the entire document is created
    await setDoc(userDocRef, initialData);
    console.log(`Initial profile created for user: ${user.uid}`);
  } catch (e) {
    console.error("Error creating initial user profile: ", e);
  }
};

// Function to remove a song object from the user's favoriteSongs array in Firestore.
// NOTE: This requires knowing the current list and replacing it, as arrayRemove needs the exact object.
// A simpler implementation using arrayRemove is possible if you import the song ID/object.
export const removeFavoriteSong = async (songObject) => {
  const user = getCurrentUser();
  if (!user) {
    console.error("No user logged in to remove favorite song.");
    return;
  }

  try {
    const userDocRef = getProfileDocRef(user.uid);

    // Use updateDoc and arrayRemove to safely pull the song from the array
    // NOTE: arrayRemove requires the exact object stored in the array to work.
    await updateDoc(userDocRef, {
      "stats.favoriteSongs": arrayRemove(songObject),
    });
    console.log(`Song removed from favorites successfully.`);
  } catch (e) {
    console.error("Error removing favorite song from Firestore: ", e);
  }
};

// Placeholder function: stats are now fetched via real-time listener (onSnapshot)
export const getStats = () => {
  // Return an empty object; actual stats are managed by the listener in Profile.jsx
  return {};
};

// Function to reset all user statistics
export const resetStats = async () => {
  const user = getCurrentUser();
  if (!user) return;

  const initialStats = {
    totalScans: 0,
    songsPlayed: 0,
    mostDetectedEmotion: "Neutral", // Default value
    emotionCounts: {},
    favoriteSongs: [],
    recentEmotions: [],
  };

  try {
    // Use the existing updateUserProfileData to merge the initial stats
    await updateUserProfileData({ stats: initialStats });
    alert("Statistics have been reset! 📈");
  } catch (error) {
    console.error("Error resetting stats:", error);
  }
};
