// src/pages/Profile.jsx
import { onSnapshot, doc, getDoc } from "firebase/firestore"; // <-- Import 'doc' from here
import { db } from "/src/utils/firebaseConfig.js"; // <-- Import your Firestore instance (db) from here
// ... rest of your code
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// Use Firebase-based imports
import { updateUserProfileData, resetStats } from "../utils/statsTracker";
import { getCurrentUser, logoutUser, onAuthChange } from "../utils/authService";

// Icon imports
import {
  FiTrendingUp,
  FiMusic,
  FiHeart,
  FiActivity,
  FiPlay,
  FiTrash2,
} from "react-icons/fi";

// --- STYLES AND CONSTANTS (Keep these as they were) ---
const colors = {
  darkBg: "#0f0f1c",
  cardBg: "#1e1e35",
  accentPurple: "#a350ff",
  neonGreen: "#39ff14",
  textLight: "#f0f0f0",
  textGray: "#b0b0c2",
  coralRed: "#ff6b6b",
  inputCardBgVisible: "#3a1f50",
};

const allLanguages = [
  "Hindi",
  "English",
  "Marathi",
  "Telugu",
  "Tamil",
  "Gujarati",
  "Urdu",
  "Kannada",
  "Bengali",
  "Malayalam",
];

const emotionEmojis = {
  Angry: "😠",
  Disgust: "🤢",
  Fear: "😨",
  Happy: "😊",
  Neutral: "😐",
  Sad: "😢",
  Surprise: "😮",
};
// --------------------------------------------------------

const Profile = () => {
  const navigate = useNavigate();
  const currentUser = getCurrentUser(); // Get user for UID

  // Combined state for all user data from Firestore
  const [userData, setUserData] = useState({
    name: "Loading User...",
    email: "loading@emotune.com",
    memberSince: "N/A",
    profilePic: null,
    selectedLanguages: [],
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
  });

  const [isEditingLanguages, setIsEditingLanguages] = useState(false);
  const [playingSongId, setPlayingSongId] = useState(null);

  const floatingEmojis = [
    "🎵",
    "🎶",
    "🎤",
    "🎧",
    "🎸",
    "🎹",
    "🥁",
    "🎺",
    "🎻",
    "🎼",
    "😊",
    "😢",
    "😠",
    "😮",
    "😐",
    "🤢",
    "😨",
    "💜",
    "💚",
    "💙",
    "❤️",
    "🌟",
    "✨",
    "🎭",
    "🎪",
  ];

  // Component for floating emojis
  function FloatingEmoji({ emoji, delay, duration, startX, endX, startY }) {
    return (
      <div
        style={{
          position: "absolute",
          left: `${startX}%`,
          top: `${startY}%`,
          fontSize: "44px",
          opacity: "0.55",
          animation: `float ${duration}s ease-in-out ${delay}s infinite`,
          pointerEvents: "none",
          zIndex: 0,
          dropshadow: "#a350ff",
        }}
      >
        {emoji}
      </div>
    );
  }

  // --- FIREBASE LISTENER & INITIAL LOAD ---
  useEffect(() => {
    // 1. Redirect if not authenticated
    if (!currentUser) {
      console.log("User not logged in. Redirecting.");
      navigate("/login");
      return;
    }

    // 2. Set up Firestore Real-time Listener (onSnapshot)
    // This listener fetches data immediately and then whenever it changes on the server.
    const userDocRef = doc(db, "users", currentUser.uid);

    const unsubscribe = onSnapshot(
      userDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();

          // Update the combined state object
          setUserData({
            name: data.name || "User",
            email: data.email || currentUser.email,
            memberSince: data.memberSince || "N/A",
            profilePic: data.profilePic || null,
            selectedLanguages: data.selectedLanguages || [],
            stats: data.stats || {
              totalScans: 0,
              songsPlayed: 0,
              mostDetectedEmotion: "Neutral",
              emotionCounts: {},
              favoriteSongs: [],
              recentEmotions: [],
            },
            settings: data.settings || {
              autoPlay: true,
              defaultEmotion: "Neutral",
            },
          });
        } else {
          // Document doesn't exist (First-time login/Registration complete)
          // Initialize the user's document with default data
          console.log("User document not found. Initializing profile.");
          updateUserProfileData({
            name: currentUser.displayName || "New User",
            email: currentUser.email,
            memberSince: new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
            }),
            selectedLanguages: [],
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
          });
        }
      },
      (error) => {
        // This is where the 400 Bad Request would appear if security rules deny access
        console.error(
          "Firestore Listen Error (400 Bad Request likely here):",
          error
        );
        // The error name 'undefined' and message 'undefined' are often caused by the 400 response from Google API.
      }
    );

    // Cleanup function to detach the listener when the component unmounts
    return () => unsubscribe();
  }, [currentUser, navigate]);

  // Destructure for cleaner access in JSX
  const { name, email, memberSince, profilePic } = userData;
  const { selectedLanguages, stats, settings } = userData;

  // --- HANDLERS USING FIREBASE/UTILITY FUNCTIONS ---

  const handleLanguageToggle = (lang) => {
    const currentLanguages = selectedLanguages;
    let newLanguages;

    if (currentLanguages.includes(lang)) {
      newLanguages = currentLanguages.filter((l) => l !== lang);
    } else if (currentLanguages.length < 5) {
      newLanguages = [...currentLanguages, lang];
    } else {
      return; // Max 5 languages
    }

    // Optimistic UI update (update local state immediately)
    setUserData((prev) => ({ ...prev, selectedLanguages: newLanguages }));
  };

  const handleSaveLanguages = async () => {
    // Save the new languages to Firestore
    await updateUserProfileData({ selectedLanguages });
    setIsEditingLanguages(false);
    alert("Languages updated successfully! 🎵");
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const newProfilePic = reader.result;
        // Save the new image data (base64) to Firestore
        await updateUserProfileData({ profilePic: newProfilePic });
        // State update happens via the onSnapshot listener, so no need for explicit setUserData here
        alert("Profile picture updated! 📸");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    // Save the updated name to Firestore
    await updateUserProfileData({ name });
    alert("Profile updated successfully! ✨");
  };

  const handleSettingToggle = async (setting) => {
    const newSettings = { ...settings, [setting]: !settings[setting] };
    // Save the new settings to Firestore
    await updateUserProfileData({ settings: newSettings });
    // State update happens via the onSnapshot listener
  };

  const handleRemoveFavorite = async (songId) => {
    const updatedFavorites = stats.favoriteSongs.filter(
      (song) => song.id !== songId
    );

    // Save the new favorite list to Firestore
    await updateUserProfileData({
      stats: { ...stats, favoriteSongs: updatedFavorites },
    });
    // State update happens via the onSnapshot listener
  };

  const handleDeleteAccount = () => {
    if (
      window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone. 😢"
      )
    ) {
      // NOTE: You must use the Firebase Admin SDK on a secure backend (Cloud Functions)
      // to *actually* delete a user's account permanently for security reasons.
      // This front-end function only clears data and logs out.

      // Simulate data clearance (which Firestore listener would handle)
      // ... (your localStorage cleanup removed as it's now Firestore based) ...

      // Logout the user and navigate
      logoutUser();
      navigate("/login");
    }
  };

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
    // window.location.reload(); // Usually not needed with proper React Router navigation
  };

  const handlePlaySong = (songId) => {
    setPlayingSongId(songId);
    // In a real app, this would trigger playback in a global player component.
  };

  const getTopEmotions = () => {
    const emotions = Object.entries(stats.emotionCounts || {})
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
    return emotions;
  };

  // --- JSX RENDER (Keep original structure for styling) ---
  return (
    <div
      style={{
        backgroundColor: colors.accentPurple,
        minHeight: "100vh",
        padding: "40px 20px",
        background: "linear-gradient(135deg, #171725ff 0%, #20203cff 100%)",
      }}
    >
      {/* Add CSS keyframes for floating animation */}
      <style>
        {`
          @keyframes float {
            0%, 100% {
              transform: translateY(0) translateX(0) rotate(0deg);
            }
            25% {
              transform: translateY(-20px) translateX(20px) rotate(5deg);
            }
            50% {
              transform: translateY(-40px) translateX(-20px) rotate(-5deg);
            }
            75% {
              transform: translateY(-20px) translateX(10px) rotate(3deg);
            }
          }

        `}
      </style>

      {/* Floating Emojis Background */}
      {floatingEmojis.map((emoji, index) => (
        <FloatingEmoji
          key={index}
          emoji={emoji}
          delay={index * 0.5}
          duration={8 + (index % 5)}
          startX={Math.random() * 100}
          endX={Math.random() * 100}
          startY={Math.random() * 100}
        />
      ))}

      <div style={{ maxWidth: "1300px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "50px" }}>
          <h1
            style={{
              background: "linear-gradient(135deg, #a350ff 0%, #d957ff 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontSize: "42px",
              fontWeight: "900",
              marginBottom: "10px",
              letterSpacing: "2px",
            }}
          >
            Your Vibe Profile 🎧
          </h1>
          <p style={{ color: colors.textGray, fontSize: "16px" }}>
            Manage your account, stats & music preferences
          </p>
        </div>

        {/* Main Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "30px",
          }}
        >
          {/* LEFT COLUMN */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "30px" }}
          >
            {/* Basic Info Card */}
            <div
              style={{
                backgroundColor: "rgba(30, 30, 53, 0.8)",
                backdropFilter: "blur(10px)",
                borderRadius: "20px",
                padding: "35px",
                border: "1px solid rgba(163, 80, 255, 0.2)",
                boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
              }}
            >
              <h2
                style={{
                  color: colors.textLight,
                  fontSize: "22px",
                  fontWeight: "700",
                  marginBottom: "25px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <span>👤</span> Basic Information
              </h2>

              {/* Profile Picture */}
              <div style={{ textAlign: "center", marginBottom: "30px" }}>
                <div
                  style={{
                    width: "140px",
                    height: "140px",
                    borderRadius: "50%",
                    background:
                      "linear-gradient(135deg, #a350ff 0%, #d957ff 100%)",
                    margin: "0 auto 20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "60px",
                    border: "4px solid rgba(163, 80, 255, 0.3)",
                    overflow: "hidden",
                    boxShadow: "0 0 30px rgba(163, 80, 255, 0.4)",
                  }}
                >
                  {profilePic ? (
                    <img
                      src={profilePic}
                      alt="Profile"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    "👤"
                  )}
                </div>
                <label
                  style={{
                    padding: "10px 20px",
                    background:
                      "linear-gradient(135deg, #a350ff 0%, #d957ff 100%)",
                    color: colors.textLight,
                    borderRadius: "25px",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: "700",
                    boxShadow: "0 5px 20px rgba(163, 80, 255, 0.4)",
                    transition: "all 0.3s ease",
                    display: "inline-block",
                  }}
                >
                  📸 Change Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePicChange}
                    style={{ display: "none" }}
                  />
                </label>
              </div>

              {/* User Details */}
              <div style={{ marginBottom: "18px" }}>
                <label
                  style={{
                    color: colors.textGray,
                    fontSize: "12px",
                    marginBottom: "8px",
                    display: "block",
                    fontWeight: "600",
                  }}
                >
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) =>
                    setUserData({ ...userData, name: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "12px 15px",
                    backgroundColor: colors.inputCardBgVisible,
                    border: "2px solid rgba(163, 80, 255, 0.2)",
                    borderRadius: "10px",
                    color: colors.textLight,
                    fontSize: "15px",
                    boxSizing: "border-box",
                    outline: "none",
                    transition: "all 0.3s ease",
                  }}
                  onFocus={(e) =>
                    (e.target.style.borderColor = colors.accentPurple)
                  }
                  onBlur={(e) =>
                    (e.target.style.borderColor = "rgba(163, 80, 255, 0.2)")
                  }
                />
              </div>

              <div style={{ marginBottom: "18px" }}>
                <label
                  style={{
                    color: colors.textGray,
                    fontSize: "12px",
                    marginBottom: "8px",
                    display: "block",
                    fontWeight: "600",
                  }}
                >
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  disabled
                  style={{
                    width: "100%",
                    padding: "12px 15px",
                    backgroundColor: colors.inputCardBgVisible,
                    border: "2px solid rgba(163, 80, 255, 0.1)",
                    borderRadius: "10px",
                    color: colors.textGray,
                    fontSize: "15px",
                    boxSizing: "border-box",
                    opacity: 0.6,
                  }}
                />
              </div>

              <div
                style={{
                  padding: "15px",
                  background:
                    "linear-gradient(135deg, rgba(163, 80, 255, 0.1) 0%, rgba(57, 255, 20, 0.1) 100%)",
                  borderRadius: "10px",
                  color: colors.neonGreen,
                  fontSize: "14px",
                  textAlign: "center",
                  fontWeight: "600",
                  marginBottom: "20px",
                }}
              >
                🎉 Member Since: {memberSince}
              </div>

              <button
                onClick={handleSaveProfile}
                style={{
                  width: "100%",
                  padding: "14px",
                  background:
                    "linear-gradient(135deg, #39ff14 0%, #2ecc71 100%)",
                  color: "#000",
                  border: "none",
                  borderRadius: "12px",
                  fontWeight: "700",
                  fontSize: "15px",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  boxShadow: "0 5px 20px rgba(57, 255, 20, 0.3)",
                }}
                onMouseEnter={(e) =>
                  (e.target.style.transform = "translateY(-2px)")
                }
                onMouseLeave={(e) =>
                  (e.target.style.transform = "translateY(0)")
                }
              >
                💾 Save Changes
              </button>
            </div>

            {/* Enhanced Statistics Card */}
            <div
              style={{
                backgroundColor: "rgba(30, 30, 53, 0.8)",
                backdropFilter: "blur(10px)",
                borderRadius: "20px",
                padding: "35px",
                border: "1px solid rgba(163, 80, 255, 0.2)",
                boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
              }}
            >
              <h2
                style={{
                  color: colors.textLight,
                  fontSize: "22px",
                  fontWeight: "700",
                  marginBottom: "25px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <FiActivity size={24} color={colors.neonGreen} /> Your
                Statistics
              </h2>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "15px",
                }}
              >
                <div
                  style={{
                    padding: "20px",
                    background:
                      "linear-gradient(135deg, rgba(163, 80, 255, 0.15) 0%, rgba(163, 80, 255, 0.05) 100%)",
                    borderRadius: "12px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    border: "1px solid rgba(163, 80, 255, 0.2)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <FiActivity size={20} color={colors.accentPurple} />
                    <span
                      style={{
                        color: colors.textLight,
                        fontSize: "15px",
                        fontWeight: "600",
                      }}
                    >
                      Total Emotion Scans
                    </span>
                  </div>
                  <span
                    style={{
                      color: colors.neonGreen,
                      fontSize: "24px",
                      fontWeight: "900",
                    }}
                  >
                    {stats.totalScans}
                  </span>
                </div>

                <div
                  style={{
                    padding: "20px",
                    background:
                      "linear-gradient(135deg, rgba(57, 255, 20, 0.15) 0%, rgba(57, 255, 20, 0.05) 100%)",
                    borderRadius: "12px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    border: "1px solid rgba(57, 255, 20, 0.2)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <FiMusic size={20} color={colors.neonGreen} />
                    <span
                      style={{
                        color: colors.textLight,
                        fontSize: "15px",
                        fontWeight: "600",
                      }}
                    >
                      Songs Played
                    </span>
                  </div>
                  <span
                    style={{
                      color: colors.neonGreen,
                      fontSize: "24px",
                      fontWeight: "900",
                    }}
                  >
                    {stats.songsPlayed}
                  </span>
                </div>

                <div
                  style={{
                    padding: "20px",
                    background:
                      "linear-gradient(135deg, rgba(255, 107, 107, 0.15) 0%, rgba(255, 107, 107, 0.05) 100%)",
                    borderRadius: "12px",
                    border: "1px solid rgba(255, 107, 107, 0.2)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      marginBottom: "12px",
                    }}
                  >
                    <FiTrendingUp size={20} color={colors.coralRed} />
                    <span
                      style={{
                        color: colors.textLight,
                        fontSize: "15px",
                        fontWeight: "600",
                      }}
                    >
                      Most Detected Emotion
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      justifyContent: "center",
                    }}
                  >
                    <span style={{ fontSize: "36px" }}>
                      {emotionEmojis[stats.mostDetectedEmotion]}
                    </span>
                    <span
                      style={{
                        color: colors.neonGreen,
                        fontSize: "20px",
                        fontWeight: "900",
                      }}
                    >
                      {stats.mostDetectedEmotion}
                    </span>
                  </div>
                </div>

                {/* Top 3 Emotions */}
                {getTopEmotions().length > 0 && (
                  <div
                    style={{
                      padding: "20px",
                      backgroundColor: colors.inputCardBgVisible,
                      borderRadius: "12px",
                      border: "1px solid rgba(163, 80, 255, 0.2)",
                    }}
                  >
                    <div
                      style={{
                        color: colors.textGray,
                        fontSize: "13px",
                        marginBottom: "12px",
                        fontWeight: "600",
                      }}
                    >
                      🏆 Top Detected Emotions
                    </div>
                    {getTopEmotions().map(([emotion, count], idx) => (
                      <div
                        key={emotion}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "8px 0",
                          borderBottom:
                            idx < getTopEmotions().length - 1
                              ? "1px solid rgba(163, 80, 255, 0.1)"
                              : "none",
                        }}
                      >
                        <span
                          style={{ color: colors.textLight, fontSize: "14px" }}
                        >
                          {emotionEmojis[emotion]} {emotion}
                        </span>
                        <span
                          style={{
                            color: colors.neonGreen,
                            fontWeight: "700",
                            fontSize: "14px",
                          }}
                        >
                          {count}x
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reset Stats Button */}
                <button
                  onClick={resetStats}
                  style={{
                    padding: "10px",
                    backgroundColor: colors.coralRed,
                    color: colors.textLight,
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: "600",
                    fontSize: "14px",
                    cursor: "pointer",
                    transition: "opacity 0.2s",
                    marginTop: "10px",
                  }}
                  onMouseEnter={(e) => (e.target.style.opacity = 0.8)}
                  onMouseLeave={(e) => (e.target.style.opacity = 1)}
                >
                  Reset All Statistics
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "30px" }}
          >
            {/* Music Preferences */}
            <div
              style={{
                backgroundColor: "rgba(30, 30, 53, 0.8)",
                backdropFilter: "blur(10px)",
                borderRadius: "20px",
                padding: "35px",
                border: "1px solid rgba(163, 80, 255, 0.2)",
                boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "25px",
                }}
              >
                <h2
                  style={{
                    color: colors.textLight,
                    fontSize: "22px",
                    fontWeight: "700",
                    margin: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  🎵 Music Preferences
                </h2>
                <button
                  onClick={() => setIsEditingLanguages(!isEditingLanguages)}
                  style={{
                    padding: "8px 18px",
                    background: isEditingLanguages
                      ? "linear-gradient(135deg, #ff6b6b 0%, #ff8787 100%)"
                      : "linear-gradient(135deg, #a350ff 0%, #d957ff 100%)",
                    color: colors.textLight,
                    border: "none",
                    borderRadius: "20px",
                    fontWeight: "700",
                    fontSize: "13px",
                    cursor: "pointer",
                    boxShadow: "0 5px 15px rgba(163, 80, 255, 0.3)",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) =>
                    (e.target.style.transform = "translateY(-2px)")
                  }
                  onMouseLeave={(e) =>
                    (e.target.style.transform = "translateY(0)")
                  }
                >
                  {isEditingLanguages ? "❌ Cancel" : "✏ Edit"}
                </button>
              </div>

              {isEditingLanguages ? (
                <div>
                  <p
                    style={{
                      color: colors.textGray,
                      fontSize: "14px",
                      marginBottom: "20px",
                    }}
                  >
                    Select up to 5 languages for personalized recommendations
                  </p>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(2, 1fr)",
                      gap: "12px",
                      marginBottom: "20px",
                    }}
                  >
                    {allLanguages.map((lang) => (
                      <div
                        key={lang}
                        onClick={() => handleLanguageToggle(lang)}
                        style={{
                          padding: "12px",
                          borderRadius: "12px",
                          backgroundColor: selectedLanguages.includes(lang)
                            ? colors.accentPurple
                            : colors.inputCardBgVisible,
                          border: selectedLanguages.includes(lang)
                            ? `2px solid ${colors.neonGreen}`
                            : "2px solid transparent",
                          color: colors.textLight,
                          cursor: "pointer",
                          fontSize: "14px",
                          fontWeight: "600",
                          textAlign: "center",
                          transition: "all 0.3s ease",
                          boxShadow: selectedLanguages.includes(lang)
                            ? "0 0 20px rgba(57, 255, 20, 0.3)"
                            : "none",
                        }}
                      >
                        {lang} {selectedLanguages.includes(lang) && "✓"}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={handleSaveLanguages}
                    style={{
                      width: "100%",
                      padding: "14px",
                      background:
                        "linear-gradient(135deg, #39ff14 0%, #2ecc71 100%)",
                      color: "#000",
                      border: "none",
                      borderRadius: "12px",
                      fontWeight: "700",
                      cursor: "pointer",
                      fontSize: "15px",
                      boxShadow: "0 5px 20px rgba(57, 255, 20, 0.3)",
                      transition: "all 0.3s ease",
                    }}
                  >
                    💾 Save Languages
                  </button>
                </div>
              ) : (
                <div
                  style={{
                    padding: "20px",
                    background:
                      "linear-gradient(135deg, rgba(163, 80, 255, 0.1) 0%, rgba(57, 255, 20, 0.1) 100%)",
                    borderRadius: "12px",
                    border: "1px solid rgba(163, 80, 255, 0.2)",
                  }}
                >
                  <div
                    style={{
                      color: colors.textGray,
                      fontSize: "13px",
                      marginBottom: "10px",
                      fontWeight: "600",
                    }}
                  >
                    Selected Languages ({selectedLanguages.length}/5)
                  </div>
                  <div
                    style={{
                      color: colors.neonGreen,
                      fontSize: "16px",
                      fontWeight: "600",
                    }}
                  >
                    {selectedLanguages.length > 0
                      ? selectedLanguages.join(", ")
                      : "No languages selected"}
                  </div>
                </div>
              )}
            </div>

            {/* Favorite Songs with Play & Remove */}
            <div
              style={{
                backgroundColor: "rgba(30, 30, 53, 0.8)",
                backdropFilter: "blur(10px)",
                borderRadius: "20px",
                padding: "35px",
                border: "1px solid rgba(163, 80, 255, 0.2)",
                boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
                maxHeight: "600px",
                overflowY: "auto",
              }}
            >
              <h2
                style={{
                  color: colors.textLight,
                  fontSize: "22px",
                  fontWeight: "700",
                  marginBottom: "25px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <FiHeart size={24} color={colors.coralRed} /> Favorite Songs
              </h2>

              {stats.favoriteSongs && stats.favoriteSongs.length > 0 ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  {stats.favoriteSongs.map((song, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: "15px",
                        backgroundColor: colors.inputCardBgVisible,
                        borderRadius: "10px",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        border:
                          playingSongId === song.id
                            ? `2px solid ${colors.neonGreen}`
                            : "1px solid rgba(163, 80, 255, 0.2)",
                        transition: "all 0.3s ease",
                      }}
                    >
                      {song.image_url ? (
                        <img
                          src={song.image_url}
                          alt={song.title}
                          style={{
                            width: "60px",
                            height: "60px",
                            borderRadius: "8px",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "60px",
                            height: "60px",
                            borderRadius: "8px",
                            background:
                              "linear-gradient(135deg, rgba(163, 80, 255, 0.3) 0%, rgba(163, 80, 255, 0.1) 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "24px",
                          }}
                        >
                          🎵
                        </div>
                      )}
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            color: colors.textLight,
                            fontWeight: "700",
                            fontSize: "14px",
                            marginBottom: "3px",
                          }}
                        >
                          {song.title}
                        </div>
                        <div
                          style={{
                            color: colors.textGray,
                            fontSize: "12px",
                            marginBottom: "3px",
                          }}
                        >
                          {song.artist}
                        </div>
                        {song.language && (
                          <div
                            style={{
                              color: colors.neonGreen,
                              fontSize: "11px",
                              fontWeight: "600",
                            }}
                          >
                            {song.language}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handlePlaySong(song.id)}
                        style={{
                          background: colors.accentPurple,
                          border: "none",
                          borderRadius: "50%",
                          width: "35px",
                          height: "35px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          transition: "background 0.2s",
                          boxShadow: "0 4px 15px rgba(163, 80, 255, 0.4)",
                        }}
                      >
                        <FiPlay size={18} color={colors.textLight} />
                      </button>
                      <button
                        onClick={() => handleRemoveFavorite(song.id)}
                        style={{
                          background: colors.coralRed,
                          border: "none",
                          borderRadius: "50%",
                          width: "35px",
                          height: "35px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          transition: "background 0.2s",
                          boxShadow: "0 4px 15px rgba(255, 107, 107, 0.4)",
                        }}
                      >
                        <FiTrash2 size={18} color={colors.textLight} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p
                  style={{
                    color: colors.textGray,
                    textAlign: "center",
                    padding: "20px",
                  }}
                >
                  No favorite songs yet. Start adding some tracks! ❤️
                </p>
              )}
            </div>

            {/* Account Settings */}
            <div
              style={{
                backgroundColor: "rgba(30, 30, 53, 0.8)",
                backdropFilter: "blur(10px)",
                borderRadius: "20px",
                padding: "35px",
                border: "1px solid rgba(163, 80, 255, 0.2)",
                boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
              }}
            >
              <h2
                style={{
                  color: colors.textLight,
                  fontSize: "22px",
                  fontWeight: "700",
                  marginBottom: "25px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                ⚙️ App Settings
              </h2>

              {/* AutoPlay Toggle */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "15px",
                  padding: "15px 0",
                  borderBottom: `1px solid ${colors.inputCardBgVisible}`,
                }}
              >
                <span style={{ color: colors.textLight, fontWeight: "600" }}>
                  Auto-Play Next Song
                </span>
                <label
                  style={{
                    position: "relative",
                    display: "inline-block",
                    width: "50px",
                    height: "28px",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={settings.autoPlay}
                    onChange={() => handleSettingToggle("autoPlay")}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span
                    style={{
                      position: "absolute",
                      cursor: "pointer",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: settings.autoPlay
                        ? colors.neonGreen
                        : colors.textGray,
                      transition: ".4s",
                      borderRadius: "28px",
                      boxShadow: settings.autoPlay
                        ? `0 0 10px ${colors.neonGreen}`
                        : "none",
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        content: '""',
                        height: "20px",
                        width: "20px",
                        left: "4px",
                        bottom: "4px",
                        backgroundColor: colors.darkBg,
                        transition: ".4s",
                        borderRadius: "50%",
                        transform: settings.autoPlay
                          ? "translateX(22px)"
                          : "translateX(0)",
                      }}
                    ></span>
                  </span>
                </label>
              </div>

              {/* Default Emotion Select */}
              <div style={{ marginBottom: "25px", padding: "15px 0" }}>
                <label
                  style={{
                    color: colors.textGray,
                    fontSize: "12px",
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "600",
                  }}
                >
                  Default Emotion Scan
                </label>
                <select
                  value={settings.defaultEmotion}
                  onChange={(e) =>
                    updateUserProfileData({
                      settings: { ...settings, defaultEmotion: e.target.value },
                    })
                  }
                  style={{
                    width: "100%",
                    padding: "12px 15px",
                    backgroundColor: colors.inputCardBgVisible,
                    border: `2px solid ${colors.accentPurple}`,
                    borderRadius: "10px",
                    color: colors.textLight,
                    fontSize: "15px",
                    boxSizing: "border-box",
                    outline: "none",
                  }}
                >
                  {Object.keys(emotionEmojis).map((emotion) => (
                    <option key={emotion} value={emotion}>
                      {emotionEmojis[emotion]} {emotion}
                    </option>
                  ))}
                </select>
              </div>

              {/* Logout and Delete */}
              <button
                onClick={handleLogout}
                style={{
                  width: "100%",
                  padding: "14px",
                  background: colors.textGray,
                  color: colors.darkBg,
                  border: "none",
                  borderRadius: "12px",
                  fontWeight: "700",
                  fontSize: "15px",
                  cursor: "pointer",
                  transition: "background 0.3s ease",
                  marginBottom: "15px",
                }}
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
