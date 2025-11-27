// emotune-frontend\src\utils\firebaseConfig.js

// import { initializeApp } from "firebase/app";
// import { getAuth } from "firebase/auth";
// import { getFirestore } from "firebase/firestore"; // Import getFirestore for DB

// // **REPLACE WITH YOUR ACTUAL CONFIG**
// const firebaseConfig = {
//   apiKey: "AIzaSyBLy745pVUsppAWwIe61g8HO2VSO_oBkxo",
//   authDomain: "emotune-1011.firebaseapp.com",
//   projectId: "emotune-1011",
//   storageBucket: "emotune-1011.firebasestorage.app",
//   messagingSenderId: "526004228805",
//   appId: "1:526004228805:web:b3948d714108d4022656ac",
//   measurementId: "G-MJ0SZJ3F8T",
// };

const firebaseConfig = {
  apiKey: "REMOVED",
  authDomain: "REMOVED",
  databaseURL: "REMOVED",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Services
export const auth = getAuth(app);
export const db = getFirestore(app); // Initialize and export Firestore

export default app;
