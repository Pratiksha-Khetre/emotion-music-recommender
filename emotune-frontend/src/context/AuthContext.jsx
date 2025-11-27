// src/context/AuthContext.jsx

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
// --- FIX: Import 'auth' from firebaseConfig and 'logoutUser' from authService ---
import { auth } from "../utils/firebaseConfig";
import { logoutUser } from "../utils/authService";
// ---------------------------------------------------------------------------------

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

// Helper function to get the current user's email for local storage keys
const getCurrentUserEmail = (user) => {
  return user ? user.email : null;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // useEffect to listen to the Firebase Auth state change
  useEffect(() => {
    // onAuthStateChanged is the primary way to track user login state in Firebase
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);

      // Simple local storage management for quick checks
      if (user) {
        localStorage.setItem("isLoggedIn", "true");
        const userInfo = {
          name: user.displayName || user.email.split("@")[0],
          email: user.email,
          profilePic: user.photoURL,
        };
        localStorage.setItem("user_info", JSON.stringify(userInfo));
      } else {
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("user_info");
      }
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  // Language setting functions (using user email as a key)
  const hasSetLanguage = () => {
    const email = getCurrentUserEmail(currentUser);
    if (!email) return false;
    return localStorage.getItem(`languages_set_${email}`) === "true";
  };

  const setLanguageSet = (isSet) => {
    const email = getCurrentUserEmail(currentUser);
    if (!email) return;
    localStorage.setItem(`languages_set_${email}`, isSet ? "true" : "false");
  };

  const value = {
    currentUser,
    loading,
    logout: logoutUser,
    isAuthenticated: !!currentUser, // Boolean check
    hasSetLanguage,
    setLanguageSet,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
      {loading && (
        <div
          style={{
            minHeight: "100vh",
            backgroundColor: "#0f0f1c",
            color: "#f0f0f0",
            display: "grid",
            placeItems: "center",
          }}
        >
          Checking Authentication Status...
        </div>
      )}
    </AuthContext.Provider>
  );
};
