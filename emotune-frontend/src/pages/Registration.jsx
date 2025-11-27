// src/pages/Registration.jsx

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { AiOutlineMail, AiOutlineLock, AiOutlineUser } from "react-icons/ai"; // Added AiOutlineUser for name input

// Correct path resolution for utilities
import { auth } from "../utils/firebaseConfig";
import { initializeUserProfile } from "../utils/statsTracker";

// --- REPLICATED LOGIN STYLES ---
const styles = {
  container: {
    minHeight: "calc(100vh - 70px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "linear-gradient(135deg, #0f0f1c 0%, #1a1a2e 50%, #16213e 100%)",
    padding: "20px",
    position: "relative",
    overflow: "hidden",
  },
  backgroundCircle: {
    position: "absolute",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(163, 80, 255, 0.1) 0%, transparent 70%)",
    animation: "float 6s ease-in-out infinite",
  },
  formBox: {
    backgroundColor: "rgba(30, 30, 53, 0.95)",
    backdropFilter: "blur(10px)",
    padding: "50px 40px",
    borderRadius: "25px",
    boxShadow:
      "0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(163, 80, 255, 0.1)",
    width: "100%",
    maxWidth: "450px",
    border: "1px solid rgba(163, 80, 255, 0.2)",
    position: "relative",
    zIndex: 1,
  },
  title: {
    textAlign: "center",
    background: "linear-gradient(135deg, #a350ff 0%, #d957ff 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    marginBottom: "10px",
    fontSize: "36px",
    fontWeight: "900",
    letterSpacing: "1px",
  },
  subtitle: {
    textAlign: "center",
    color: "#b0b0c2",
    marginBottom: "35px",
    fontSize: "14px",
  },
  inputGroup: {
    position: "relative",
    marginBottom: "20px",
  },
  inputIcon: {
    position: "absolute",
    left: "15px",
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: "20px",
    color: "#a350ff",
    pointerEvents: "none",
  },
  input: {
    width: "100%",
    padding: "15px 15px 15px 50px",
    borderRadius: "12px",
    border: "2px solid rgba(163, 80, 255, 0.2)",
    backgroundColor: "rgba(43, 43, 75, 0.5)",
    color: "#f0f0f0",
    fontSize: "16px",
    boxSizing: "border-box",
    transition: "all 0.3s ease",
    outline: "none",
  },
  button: {
    width: "100%",
    padding: "15px",
    borderRadius: "12px",
    border: "none",
    background: "linear-gradient(135deg, #a350ff 0%, #d957ff 100%)",
    color: "white",
    fontSize: "18px",
    fontWeight: "700",
    cursor: "pointer",
    marginTop: "25px",
    transition: "all 0.3s ease",
    boxShadow: "0 5px 25px rgba(163, 80, 255, 0.4)",
  },
  linkText: {
    display: "block",
    textAlign: "center",
    marginTop: "25px",
    color: "#a0a0a0",
    fontSize: "14px",
  },
  purpleLink: {
    background: "linear-gradient(135deg, #a350ff 0%, #d957ff 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    textDecoration: "none",
    fontWeight: "700",
    marginLeft: "5px",
    transition: "all 0.3s ease",
  },
  errorMsg: {
    backgroundColor: "rgba(255, 107, 107, 0.2)",
    border: "1px solid rgba(255, 107, 107, 0.5)",
    color: "#ff6b6b",
    padding: "12px",
    borderRadius: "10px",
    marginBottom: "15px",
    fontSize: "14px",
    textAlign: "center",
  },
};
// ----------------------------

const Registration = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!formData.name || !formData.email || !formData.password) {
      setErrorMsg("All fields are required.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Firebase Auth Registration
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      let user = userCredential.user;

      // 2. Set Display Name on the Auth record
      await updateProfile(user, { displayName: formData.name });

      // Re-assign user to get the updated displayName property locally
      user = { ...user, displayName: formData.name };

      // 3. INITIALIZE FIRESTORE PROFILE DATA (Crucial step)
      await initializeUserProfile(user);

      // 4. Navigate to dashboard (or language selector, depending on your app flow)
      navigate("/dashboard", { replace: true });
    } catch (authError) {
      setIsSubmitting(false);
      let message = "Registration failed. Please try again.";
      if (authError.code === "auth/email-already-in-use") {
        message = "This email is already registered.";
      } else if (authError.code === "auth/weak-password") {
        message = "Password should be at least 6 characters.";
      }
      setErrorMsg(`❌ ${message}`);
      console.error("Registration Error:", authError);
    }
  };

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

  const isButtonDisabled =
    isSubmitting || !formData.name || !formData.email || !formData.password;

  return (
    <div style={styles.container}>
      {/* Animated background circles (using inline <style> tag for keyframes below) */}
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
      <div
        style={{
          ...styles.backgroundCircle,
          width: "300px",
          height: "300px",
          top: "-100px",
          left: "-100px",
        }}
      />
      <div
        style={{
          ...styles.backgroundCircle,
          width: "400px",
          height: "400px",
          bottom: "-150px",
          right: "-150px",
          animationDelay: "3s",
        }}
      />

      <form style={styles.formBox} onSubmit={handleSubmit}>
        <h2 style={styles.title}>Join the Vibe! ✨</h2>
        <p style={styles.subtitle}>Create your new account in seconds</p>

        {/* Error Message Display */}
        {errorMsg && <div style={styles.errorMsg}>{errorMsg}</div>}

        {/* 1. Name Input */}
        <div style={styles.inputGroup}>
          <AiOutlineUser style={styles.inputIcon} />
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            style={{
              ...styles.input,
              borderColor:
                focusedInput === "name" ? "#a350ff" : "rgba(163, 80, 255, 0.2)",
              boxShadow:
                focusedInput === "name"
                  ? "0 0 20px rgba(163, 80, 255, 0.3)"
                  : "none",
            }}
            value={formData.name}
            onChange={handleChange}
            onFocus={() => setFocusedInput("name")}
            onBlur={() => setFocusedInput(null)}
            required
          />
        </div>

        {/* 2. Email Input */}
        <div style={styles.inputGroup}>
          <AiOutlineMail style={styles.inputIcon} />
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            style={{
              ...styles.input,
              borderColor:
                focusedInput === "email"
                  ? "#a350ff"
                  : "rgba(163, 80, 255, 0.2)",
              boxShadow:
                focusedInput === "email"
                  ? "0 0 20px rgba(163, 80, 255, 0.3)"
                  : "none",
            }}
            value={formData.email}
            onChange={handleChange}
            onFocus={() => setFocusedInput("email")}
            onBlur={() => setFocusedInput(null)}
            required
          />
        </div>

        {/* 3. Password Input */}
        <div style={styles.inputGroup}>
          <AiOutlineLock style={styles.inputIcon} />
          <input
            type="password"
            name="password"
            placeholder="Password (min 6 characters)"
            style={{
              ...styles.input,
              borderColor:
                focusedInput === "password"
                  ? "#a350ff"
                  : "rgba(163, 80, 255, 0.2)",
              boxShadow:
                focusedInput === "password"
                  ? "0 0 20px rgba(163, 80, 255, 0.3)"
                  : "none",
            }}
            value={formData.password}
            onChange={handleChange}
            onFocus={() => setFocusedInput("password")}
            onBlur={() => setFocusedInput(null)}
            required
          />
        </div>

        <button
          type="submit"
          style={{
            ...styles.button,
            opacity: isButtonDisabled ? 0.7 : 1,
            transform: isSubmitting ? "scale(0.98)" : "scale(1)",
            cursor: isButtonDisabled ? "not-allowed" : "pointer",
          }}
          disabled={isButtonDisabled}
          onMouseEnter={(e) =>
            !isButtonDisabled && (e.target.style.transform = "translateY(-2px)")
          }
          onMouseLeave={(e) =>
            !isButtonDisabled && (e.target.style.transform = "translateY(0)")
          }
        >
          {isSubmitting ? "Creating Account... 🎵" : "Register Now 🚀"}
        </button>

        <p style={styles.linkText}>
          Already have an account?
          <Link to="/login" style={styles.purpleLink}>
            Log In
          </Link>
        </p>
      </form>

      {/* CSS for Keyframes (needed for the background animation) */}
      <style>
        {`
                    @keyframes float {
                        0%, 100% { transform: translateY(0px) rotate(0deg); }
                        50% { transform: translateY(-20px) rotate(5deg); }
                    }
                `}
      </style>
    </div>
  );
};

export default Registration;
