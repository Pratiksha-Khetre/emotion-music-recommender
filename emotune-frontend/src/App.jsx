// src/App.jsx

import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
} from "react-router-dom";

// IMPORT THE AUTH HOOK FROM YOUR CONTEXT
import { useAuth } from "./context/AuthContext.jsx";

// Component Imports (Ensure these paths are correct in your project)
import Register from "./pages/Registration.jsx";
import Login from "./pages/Login.jsx";
import Navbar from "./components/Navbar.jsx";
import LanguageSelection from "./pages/LanguageSelection.jsx";
import MainDashboard from "./pages/MainDashboard.jsx";
import SpotifyPlayer from "./pages/SpotifyPlayer.jsx";
import Profile from "./pages/Profile.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";

// --- PLACEHOLDER COMPONENTS ---

const ContactPage = () => (
  <div
    style={{
      padding: "50px",
      textAlign: "center",
      minHeight: "calc(100vh - 70px)",
      backgroundColor: "#0f0f1c",
      color: "#f0f0f0",
    }}
  >
    <h1 style={{ color: "#a350ff" }}>Contact Us</h1>
    <p>This is the Contact Page placeholder.</p>
    <Link to="/main" style={{ color: "#8a2be2", textDecoration: "none" }}>
      Go to Dashboard
    </Link>
  </div>
);

// --- PROTECTED ROUTE COMPONENT ---
// This handles the authentication check for all protected routes.
const ProtectedRoute = ({ children }) => {
  // Uses the context provided by main.jsx
  const { isAuthenticated, loading } = useAuth();

  // 1. Loading State: Display while Firebase checks the session
  if (loading) {
    return (
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
    );
  }

  // 2. Redirect: If not authenticated, go to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 3. Render: If authenticated, render the children
  return children;
};

// --- MAIN APP COMPONENT ---
function App() {
  // Access the current authentication state from the context
  const { isAuthenticated } = useAuth();

  // Define the target dashboard page (LanguageSelection is the new default after login/register)
  const AUTH_REDIRECT_PATH = "/language"; // <-- CHANGED THIS

  return (
    <Router>
      <Navbar />

      <Routes>
        {/* Default Route: Redirect based on auth status */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              // Redirect authenticated user to the language selection page
              <Navigate to={AUTH_REDIRECT_PATH} replace /> // <-- CHANGED THIS
            ) : (
              // Redirect unauthenticated user to login
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Public Routes: Login, Register, Forgot Password (redirect if logged in) */}
        <Route
          path="/login"
          element={
            // If logged in, redirect to the language selection page
            isAuthenticated ? (
              <Navigate to={AUTH_REDIRECT_PATH} replace />
            ) : (
              <Login />
            ) // <-- CHANGED THIS
          }
        />
        <Route
          path="/register"
          element={
            // If logged in, redirect to the language selection page
            isAuthenticated ? (
              <Navigate to={AUTH_REDIRECT_PATH} replace />
            ) : (
              <Register />
            ) // <-- CHANGED THIS
          }
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected Routes: Use the <ProtectedRoute> wrapper */}
        <Route
          path="/language"
          element={
            <ProtectedRoute>
              <LanguageSelection />
            </ProtectedRoute>
          }
        />
        <Route
          path="/main"
          element={
            <ProtectedRoute>
              <MainDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/spotify-player"
          element={
            <ProtectedRoute>
              <SpotifyPlayer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/contact"
          element={
            <ProtectedRoute>
              <ContactPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* 404 Not Found Route */}
        <Route
          path="*"
          element={
            <div
              style={{
                padding: "50px",
                textAlign: "center",
                minHeight: "100vh",
                backgroundColor: "#0f0f1c",
                color: "#f0f0f0",
              }}
            >
              <h1>404: Not Found</h1>
              <p>The page you are looking for does not exist.</p>
              <Link to="/" style={{ color: "#8a2be2", textDecoration: "none" }}>
                Go to Home
              </Link>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
