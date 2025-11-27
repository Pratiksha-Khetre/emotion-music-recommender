// src/components/Profile.jsx

import React from "react";
import { useAuth } from "../context/AuthContext"; // Import the custom hook

const Profile = () => {
  // Use the hook to access user state, loading status, and the logout function
  const { currentUser, loading, logout } = useAuth();

  if (loading) {
    // Show a simple loading state while Firebase checks the session
    return (
      <div className="profile-container loading">
        <p>Loading profile...</p>
      </div>
    );
  }

  // If loading is false and currentUser is null, the user is logged out
  if (!currentUser) {
    return (
      <div className="profile-container logged-out">
        <h2>Not Logged In</h2>
        <p>You need to log in to view this content.</p>
        {/* Add a link to your Login page here */}
      </div>
    );
  }

  // User is authenticated, display their information
  return (
    <div className="profile-container">
      <h1>Welcome, {currentUser.displayName || currentUser.email}!</h1>
      <img
        src={currentUser.photoURL || "default-avatar.png"}
        alt="Profile"
        className="profile-pic"
      />
      <p>
        <strong>Email:</strong> {currentUser.email}
      </p>
      <p>
        <strong>User ID (UID):</strong> {currentUser.uid}
      </p>

      <button onClick={logout} className="logout-button">
        Log Out
      </button>
    </div>
  );
};

export default Profile;
