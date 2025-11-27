// src/components/Navbar.jsx (FINAL VISUAL CONSISTENCY CODE)
import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { onSnapshot, doc } from "firebase/firestore";
import { db } from "../utils/firebaseConfig";
import { getCurrentUser, logoutUser } from "../utils/authService";

// --- EXTERNAL COLORS OBJECT ---
const COLORS = {
  accentPurple: "#a350ff",
  deepCardPurple: "#381e5b", // Deeper purple color used in the main content cards (e.g., Songs 1-5)
  textGray: "#b0b0c2",
  textLight: "#f0f0f0",
  navBackground: "#1e1e35", // A dark, solid background for contrast
};

const styles = {
  // --- UPDATED COLORS ---
  color: COLORS,
  // --- NAVBAR STYLE (Matching the dark, solid base of the app) ---
  navbar: {
    // Using a deep, solid background color
    backgroundColor: COLORS.navBackground,
    boxShadow: "0 2px 15px rgba(0, 0, 0, 0.5)", // Darker, standard shadow
    padding: "0 30px",
    height: "70px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    position: "sticky",
    top: 0,
    zIndex: 1000,
    // Add the purple accent border/glow effect similar to the main cards
    borderBottom: `2px solid ${COLORS.accentPurple}55`,
  },
  // --- LOGO STYLE (Using Gradient) ---
  logoText: {
    fontSize: "26px",
    fontWeight: "900",
    letterSpacing: "4px",
    background: "linear-gradient(135deg, #a350ff 0%, #d957ff 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    textShadow: `0 0 12px rgba(163, 80, 255, 0.8)`,
    textDecoration: "none",
    transition: "transform 0.3s ease",
  },
  linkContainer: {
    display: "flex",
    alignItems: "center",
  },
  // --- NAV LINK STYLE ---
  navLink: {
    color: COLORS.textGray,
    textDecoration: "none",
    padding: "8px 12px",
    margin: "0 8px",
    fontWeight: "600",
    transition: "color 0.3s, border-bottom 0.3s",
    cursor: "pointer",
    textTransform: "uppercase",
  },
  // Function to apply hover/active styles
  getNavLinkStyle: (isActive) => ({
    color: isActive ? COLORS.accentPurple : COLORS.textGray,
    borderBottom: isActive ? `2px solid ${COLORS.accentPurple}` : "none",
  }),
  // --- PROFILE ICON STYLE ---
  profileIcon: (hasImage) => ({
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    backgroundColor: hasImage ? "transparent" : COLORS.accentPurple,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    fontSize: "20px",
    marginLeft: "15px",
    transition: "all 0.3s",
    border: `2px solid ${COLORS.accentPurple}`,
    color: COLORS.textLight,
    overflow: "hidden",
    boxShadow: `0 0 10px rgba(163, 80, 255, 0.4)`,
  }),
  profileImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  // --- DROPDOWN STYLE ---
  dropdown: {
    position: "absolute",
    top: "75px",
    right: "30px",
    backgroundColor: COLORS.navBackground, // Use dark nav background for dropdown
    borderRadius: "15px",
    padding: "15px",
    width: "250px",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.6)",
    border: `1px solid ${COLORS.accentPurple}77`,
    zIndex: 1000,
  },
  dropdownItem: {
    padding: "10px",
    color: COLORS.textLight,
    fontSize: "14px",
    cursor: "pointer",
    borderRadius: "8px",
    transition: "all 0.3s",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontWeight: "500",
  },
};

const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = getCurrentUser();
  const isAuthenticated = localStorage.getItem("isLoggedIn") === "true";
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [userData, setUserData] = useState({
    name: "User",
    email: "user@emotune.com",
    profilePic: null,
  });

  useEffect(() => {
    if (!currentUser || !isAuthenticated) return;

    const userDocRef = doc(db, "users", currentUser.uid);
    const unsubscribe = onSnapshot(
      userDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserData({
            name: data.name || "User",
            email: data.email || currentUser.email,
            profilePic: data.profilePic || null,
          });
        }
      },
      (error) => {
        console.error("Error fetching user data:", error);
      }
    );

    return () => unsubscribe();
  }, [currentUser, isAuthenticated]);

  const handleLogout = async () => {
    await logoutUser();
    navigate("/login", { replace: true });
  };

  const handleProfileClick = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  const handleNavigateToProfile = () => {
    setShowProfileDropdown(false);
    navigate("/profile");
  };

  // Function for dynamic hover/active styles
  const getDynamicNavLinkStyle = (path) => ({
    ...styles.navLink,
    ...styles.getNavLinkStyle(location.pathname === path),
  });

  // Reusable hover/leave handlers for links
  const handleLinkHover = (e, path) => {
    if (location.pathname !== path) {
      e.currentTarget.style.color = COLORS.accentPurple;
    }
  };

  const handleLinkLeave = (e, path) => {
    if (location.pathname !== path) {
      e.currentTarget.style.color = styles.navLink.color;
    }
  };

  // Reusable hover/leave handlers for dropdown items
  const handleDropdownHover = (e, isLogout = false) => {
    const color = isLogout
      ? "rgba(255, 107, 107, 0.2)"
      : "rgba(163, 80, 255, 0.2)";
    e.currentTarget.style.backgroundColor = color;
  };

  const handleDropdownLeave = (e) => {
    e.currentTarget.style.backgroundColor = "transparent";
  };

  return (
    <nav style={styles.navbar}>
      {/* Left Links (Simplified: Home, Languages) */}
      <div style={styles.linkContainer}>
        {isAuthenticated && (
          <>
            {/* HOME */}
            <Link
              to="/main"
              style={getDynamicNavLinkStyle("/main")}
              onMouseEnter={(e) => handleLinkHover(e, "/main")}
              onMouseLeave={(e) => handleLinkLeave(e, "/main")}
            >
              Home
            </Link>
            {/* LANGUAGES */}
            <Link
              to="/language"
              style={getDynamicNavLinkStyle("/language")}
              onMouseEnter={(e) => handleLinkHover(e, "/language")}
              onMouseLeave={(e) => handleLinkLeave(e, "/language")}
            >
              Languages
            </Link>
          </>
        )}
      </div>

      {/* Center Logo */}
      <Link
        to="/"
        style={styles.logoText}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        🎵 E M O T U N E 🎵
      </Link>

      {/* Right Icons */}
      <div style={styles.linkContainer}>
        {isAuthenticated ? (
          <>
            {/* Profile Icon */}
            <div
              style={styles.profileIcon(userData.profilePic)}
              onClick={handleProfileClick}
              title="Profile"
            >
              {userData.profilePic ? (
                <img
                  src={userData.profilePic}
                  alt="Profile"
                  style={styles.profileImage}
                />
              ) : (
                "👤"
              )}
            </div>

            {/* Profile Dropdown */}
            {showProfileDropdown && (
              <div style={styles.dropdown}>
                {/* User Info */}
                <div
                  style={{
                    marginBottom: "15px",
                    textAlign: "center",
                    borderBottom: `1px solid ${COLORS.textGray}1a`,
                    paddingBottom: "15px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "16px",
                      color: COLORS.textLight,
                      fontWeight: "700",
                      marginBottom: "5px",
                    }}
                  >
                    {userData.name}
                  </div>
                  <div style={{ fontSize: "12px", color: COLORS.textGray }}>
                    {userData.email}
                  </div>
                </div>

                {/* View Profile */}
                <div
                  style={styles.dropdownItem}
                  onClick={handleNavigateToProfile}
                  onMouseEnter={handleDropdownHover}
                  onMouseLeave={handleDropdownLeave}
                >
                  <span style={{ fontSize: "18px" }}>⚙️</span>
                  <span>Settings & Profile</span>
                </div>

                {/* Change Languages */}
                <div
                  style={styles.dropdownItem}
                  onClick={() => {
                    setShowProfileDropdown(false);
                    navigate("/language");
                  }}
                  onMouseEnter={handleDropdownHover}
                  onMouseLeave={handleDropdownLeave}
                >
                  <span style={{ fontSize: "18px" }}>💬</span>
                  <span>Change Languages</span>
                </div>

                {/* Logout */}
                <div
                  style={{
                    borderTop: `1px solid ${COLORS.textGray}1a`,
                    marginTop: "10px",
                    paddingTop: "10px",
                  }}
                >
                  <div
                    style={{ ...styles.dropdownItem, color: "#ff6b6b" }}
                    onClick={() => {
                      setShowProfileDropdown(false);
                      handleLogout();
                    }}
                    onMouseEnter={(e) => handleDropdownHover(e, true)}
                    onMouseLeave={handleDropdownLeave}
                  >
                    <span style={{ fontSize: "18px" }}>🚪</span>
                    <span>Logout</span>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <Link
            to="/login"
            style={styles.navLink}
            onMouseEnter={(e) => handleLinkHover(e, "/login")}
            onMouseLeave={(e) => handleLinkLeave(e, "/login")}
          >
            🔑 Login
          </Link>
        )}
      </div>

      {/* Overlay to close dropdown when clicking outside */}
      {showProfileDropdown && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999,
          }}
          onClick={() => setShowProfileDropdown(false)}
        />
      )}
    </nav>
  );
};

export default NavBar;
