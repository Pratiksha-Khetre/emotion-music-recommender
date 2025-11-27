// src/pages/ForgotPassword.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { AiOutlineMail } from "react-icons/ai";
import { resetPassword } from "../utils/authService"; // The real function

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
  message: {
    padding: "12px",
    borderRadius: "10px",
    marginBottom: "15px",
    fontSize: "14px",
    textAlign: "center",
  },
  errorMsg: {
    backgroundColor: "rgba(255, 107, 107, 0.2)",
    border: "1px solid rgba(255, 107, 107, 0.5)",
    color: "#ff6b6b",
  },
  successMsg: {
    backgroundColor: "rgba(80, 250, 123, 0.2)",
    border: "1px solid rgba(80, 250, 123, 0.5)",
    color: "#50fa7b",
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
  },
};

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [focusedInput, setFocusedInput] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      await resetPassword(email); // Use the Firebase function
      setSuccessMsg(
        `✅ Password reset link sent to ${email}. Check your inbox!`
      );
    } catch (error) {
      // Firebase specific error handling
      let message = "An unknown error occurred.";
      if (error.code === "auth/user-not-found") {
        message = "No account found with this email.";
      } else if (error.code === "auth/invalid-email") {
        message = "Please enter a valid email address.";
      } else {
        message = error.message;
      }
      setErrorMsg(`❌ ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <form style={styles.formBox} onSubmit={handleSubmit}>
        <h2 style={styles.title}>Forgot Password?</h2>
        <p style={styles.subtitle}>
          Enter your email to receive a password reset link.
        </p>

        {errorMsg && (
          <div style={{ ...styles.message, ...styles.errorMsg }}>
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div style={{ ...styles.message, ...styles.successMsg }}>
            {successMsg}
          </div>
        )}

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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={() => setFocusedInput("email")}
            onBlur={() => setFocusedInput(null)}
            required
          />
        </div>

        <button
          type="submit"
          style={{
            ...styles.button,
            opacity: isSubmitting ? 0.7 : 1,
            transform: isSubmitting ? "scale(0.98)" : "scale(1)",
          }}
          disabled={isSubmitting}
          onMouseEnter={(e) =>
            !isSubmitting && (e.target.style.transform = "translateY(-2px)")
          }
          onMouseLeave={(e) =>
            !isSubmitting && (e.target.style.transform = "translateY(0)")
          }
        >
          {isSubmitting ? "Sending Link... 📧" : "Send Reset Link"}
        </button>

        <p style={styles.linkText}>
          Remember your password?
          <Link to="/login" style={styles.purpleLink}>
            Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default ForgotPassword;
