// src/main.jsx

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

// 1. IMPORT THE AUTH PROVIDER
import { AuthProvider } from "./context/AuthContext.jsx";

// Import the CSS (optional, based on your project setup)
// import './index.css';

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* 2. CRITICAL FIX: Wrap the entire application in AuthProvider. */}
    {/* This ensures the 'useAuth' hook in App.jsx and other components works. */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
