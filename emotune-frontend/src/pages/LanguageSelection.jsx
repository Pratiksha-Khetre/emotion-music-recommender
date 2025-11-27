// src/pages/LanguageSelection.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiCheckCircle } from "react-icons/fi";

const styles = {
  color: {
    darkBg: "#0f0f1c",
    cardBg: "#1e1e35",
    accentPurple: "#a350ff",
    textLight: "#f0f0f0",
    textGray: "#b0b0c2",
    successGreen: "#39ff14",
  },
  container: {
    minHeight: "calc(100vh - 70px)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0f0f1c",
    padding: "20px",
  },
  selectionBox: {
    backgroundColor: "#1e1e35",
    padding: "40px 60px",
    borderRadius: "20px",
    boxShadow: "0 15px 40px rgba(0, 0, 0, 0.5)",
    width: "100%",
    maxWidth: "850px",
    border: "1px solid rgba(255, 255, 255, 0.05)",
  },
  title: {
    textAlign: "center",
    color: "#a350ff",
    marginBottom: "10px",
    fontSize: "36px",
    fontWeight: "800",
    textShadow: "0 0 10px rgba(163, 80, 255, 0.4)",
  },
  subtitle: {
    textAlign: "center",
    color: "#b0b0c2",
    marginBottom: "30px",
    fontSize: "18px",
  },
  languageGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "20px",
    marginBottom: "30px",
  },
  languageItem: (isSelected) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "15px 25px",
    borderRadius: "12px",
    cursor: "pointer",
    border: isSelected ? "2px solid #39ff14" : "2px solid transparent",
    backgroundColor: isSelected ? "#2a2a4f" : "#1e1e35",
    color: isSelected ? "#39ff14" : "#f0f0f0",
    boxShadow: isSelected
      ? "0 0 15px rgba(57, 255, 20, 0.5)"
      : "0 4px 10px rgba(0, 0, 0, 0.3)",
    transition: "all 0.3s ease",
    fontWeight: "600",
    fontSize: "18px",
    transform: isSelected ? "scale(1.02)" : "scale(1)",

    ...(isSelected
      ? {}
      : {
          ":hover": {
            backgroundColor: "#252540",
            boxShadow: "0 4px 20px rgba(163, 80, 255, 0.3)", // Subtle hover glow
          },
        }),
  }),

  checkIcon: {
    color: "#39ff14",
    fontSize: "24px",
  },

  button: (isDisabled) => ({
    width: "100%",
    padding: "15px",
    borderRadius: "10px",
    border: "none",
    backgroundColor: isDisabled ? "#5a5a70" : "#a350ff",
    color: "white",
    fontSize: "18px",
    fontWeight: "700",
    cursor: isDisabled ? "not-allowed" : "pointer",
    marginTop: "20px",
    opacity: isDisabled ? 0.6 : 1,
    transition: "all 0.3s ease",
    boxShadow: isDisabled ? "none" : "0 5px 20px rgba(163, 80, 255, 0.5)",

    ...(!isDisabled && {
      ":hover": {
        backgroundColor: "#b571ff",
        boxShadow: "0 5px 25px rgba(181, 113, 255, 0.7)",
      },
    }),
  }),
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

const LanguageSelection = () => {
  const navigate = useNavigate();
  const [selectedLanguages, setSelectedLanguages] = useState([]);

  const toggleLanguage = (language) => {
    setSelectedLanguages((prev) => {
      if (prev.includes(language)) {
        // Deselect language
        return prev.filter((lang) => lang !== language);
      } else if (prev.length < 5) {
        return [...prev, language];
      }
      return prev;
    });
  };

  const handleProceed = () => {
    if (selectedLanguages.length > 0) {
      localStorage.setItem("user_languages", JSON.stringify(selectedLanguages));
      localStorage.setItem("languages_set", "true");

      navigate("/main");
    }
  };

  const isProceedDisabled = selectedLanguages.length === 0;

  return (
    <div style={styles.container}>
      {/* Add CSS keyframes for floating animation */}
      {/* <style>
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
      </style> */}

      {/* Floating Emojis Background */}
      {/* {floatingEmojis.map((emoji, index) => (
        <FloatingEmoji
          key={index}
          emoji={emoji}
          delay={index * 0.5}
          duration={8 + (index % 5)}
          startX={Math.random() * 100}
          endX={Math.random() * 100}
          startY={Math.random() * 100}
        />
      ))} */}
      <div style={styles.selectionBox}>
        <h2 style={styles.title}>Select Your Languages</h2>
        <p style={styles.subtitle}>
          Your soundtrack begins here. Choose up to 5 languages to unlock
          personalized music recommendations
        </p>

        <div style={styles.languageGrid}>
          {allLanguages.map((lang) => {
            const isSelected = selectedLanguages.includes(lang);
            return (
              <div
                key={lang}
                style={styles.languageItem(isSelected)}
                onClick={() => toggleLanguage(lang)}
              >
                <span>{lang}</span>
                {isSelected && <FiCheckCircle style={styles.checkIcon} />}
              </div>
            );
          })}
        </div>

        <button
          style={styles.button(isProceedDisabled)}
          onClick={handleProceed}
          disabled={isProceedDisabled}
        >
          Proceed to Dashboard ({selectedLanguages.length} / 5 selected)
        </button>
        {selectedLanguages.length === 5 && (
          <p
            style={{
              textAlign: "center",
              color: styles.color.successGreen,
              marginTop: "10px",
              fontWeight: "600",
            }}
          >
            Maximum languages selected!
          </p>
        )}
      </div>
    </div>
  );
};

export default LanguageSelection;

// // src/pages/LanguageSelection.jsx
// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { FiCheckCircle } from "react-icons/fi";
// import { updateUserProfileData } from "../utils/statsTracker";
// import { getCurrentUser } from "../utils/authService";
// import { doc, getDoc } from "firebase/firestore";
// import { db } from "../utils/firebaseConfig";

// const styles = {
//   color: {
//     darkBg: "#0f0f1c",
//     cardBg: "#1e1e35",
//     accentPurple: "#a350ff",
//     textLight: "#f0f0f0",
//     textGray: "#b0b0c2",
//     successGreen: "#39ff14",
//   },
//   container: {
//     minHeight: "calc(100vh - 70px)",
//     display: "flex",
//     flexDirection: "column",
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: "#0f0f1c",
//     padding: "20px",
//   },
//   selectionBox: {
//     backgroundColor: "#1e1e35",
//     padding: "40px 60px",
//     borderRadius: "20px",
//     boxShadow: "0 15px 40px rgba(0, 0, 0, 0.5)",
//     width: "100%",
//     maxWidth: "850px",
//     border: "1px solid rgba(255, 255, 255, 0.05)",
//   },
//   title: {
//     textAlign: "center",
//     color: "#a350ff",
//     marginBottom: "10px",
//     fontSize: "36px",
//     fontWeight: "800",
//     textShadow: "0 0 10px rgba(163, 80, 255, 0.4)",
//   },
//   subtitle: {
//     textAlign: "center",
//     color: "#b0b0c2",
//     marginBottom: "30px",
//     fontSize: "18px",
//   },
//   languageGrid: {
//     display: "grid",
//     gridTemplateColumns: "repeat(2, 1fr)",
//     gap: "20px",
//     marginBottom: "30px",
//   },
//   languageItem: (isSelected) => ({
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "space-between",
//     padding: "15px 25px",
//     borderRadius: "12px",
//     cursor: "pointer",
//     border: isSelected ? "2px solid #39ff14" : "2px solid transparent",
//     backgroundColor: isSelected ? "#2a2a4f" : "#1e1e35",
//     color: isSelected ? "#39ff14" : "#f0f0f0",
//     boxShadow: isSelected
//       ? "0 0 15px rgba(57, 255, 20, 0.5)"
//       : "0 4px 10px rgba(0, 0, 0, 0.3)",
//     transition: "all 0.3s ease",
//     fontWeight: "600",
//     fontSize: "18px",
//     transform: isSelected ? "scale(1.02)" : "scale(1)",
//   }),

//   checkIcon: {
//     color: "#39ff14",
//     fontSize: "24px",
//   },

//   button: (isDisabled) => ({
//     width: "100%",
//     padding: "15px",
//     borderRadius: "10px",
//     border: "none",
//     backgroundColor: isDisabled ? "#5a5a70" : "#a350ff",
//     color: "white",
//     fontSize: "18px",
//     fontWeight: "700",
//     cursor: isDisabled ? "not-allowed" : "pointer",
//     marginTop: "20px",
//     opacity: isDisabled ? 0.6 : 1,
//     transition: "all 0.3s ease",
//     boxShadow: isDisabled ? "none" : "0 5px 20px rgba(163, 80, 255, 0.5)",
//   }),
// };

// const allLanguages = [
//   "Hindi",
//   "English",
//   "Marathi",
//   "Telugu",
//   "Tamil",
//   "Gujarati",
//   "Urdu",
//   "Kannada",
//   "Bengali",
//   "Malayalam",
// ];

// const LanguageSelection = () => {
//   const navigate = useNavigate();
//   const currentUser = getCurrentUser();
//   const [selectedLanguages, setSelectedLanguages] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);

//   // Load existing languages from Firestore
//   useEffect(() => {
//     const loadLanguages = async () => {
//       if (!currentUser) {
//         setIsLoading(false);
//         return;
//       }

//       try {
//         const userDocRef = doc(db, "users", currentUser.uid);
//         const docSnap = await getDoc(userDocRef);

//         if (docSnap.exists()) {
//           const data = docSnap.data();
//           const existingLanguages = data.selectedLanguages || [];
//           setSelectedLanguages(existingLanguages);
//         }
//       } catch (error) {
//         console.error("Error loading languages:", error);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     loadLanguages();
//   }, [currentUser]);

//   const toggleLanguage = (language) => {
//     setSelectedLanguages((prev) => {
//       if (prev.includes(language)) {
//         // Deselect language
//         return prev.filter((lang) => lang !== language);
//       } else if (prev.length < 5) {
//         return [...prev, language];
//       } else {
//         alert("You can select maximum 5 languages!");
//       }
//       return prev;
//     });
//   };

//   const handleProceed = async () => {
//     if (selectedLanguages.length === 0) {
//       alert("Please select at least one language!");
//       return;
//     }

//     try {
//       // Save to Firestore
//       await updateUserProfileData({ selectedLanguages });

//       // Also save to localStorage for backward compatibility
//       localStorage.setItem("user_languages", JSON.stringify(selectedLanguages));
//       localStorage.setItem("languages_set", "true");

//       navigate("/main");
//     } catch (error) {
//       console.error("Error saving languages:", error);
//       alert("Failed to save languages. Please try again.");
//     }
//   };

//   const isProceedDisabled = selectedLanguages.length === 0;

//   if (isLoading) {
//     return (
//       <div style={styles.container}>
//         <div style={styles.selectionBox}>
//           <h2 style={styles.title}>Loading...</h2>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div style={styles.container}>
//       <div style={styles.selectionBox}>
//         <h2 style={styles.title}>Select Your Languages</h2>
//         <p style={styles.subtitle}>
//           Your soundtrack begins here. Choose up to 5 languages to unlock
//           personalized music recommendations
//         </p>

//         <div style={styles.languageGrid}>
//           {allLanguages.map((lang) => {
//             const isSelected = selectedLanguages.includes(lang);
//             return (
//               <div
//                 key={lang}
//                 style={styles.languageItem(isSelected)}
//                 onClick={() => toggleLanguage(lang)}
//                 onMouseEnter={(e) => {
//                   if (!isSelected) {
//                     e.currentTarget.style.backgroundColor = "#252540";
//                     e.currentTarget.style.boxShadow =
//                       "0 4px 20px rgba(163, 80, 255, 0.3)";
//                   }
//                 }}
//                 onMouseLeave={(e) => {
//                   if (!isSelected) {
//                     e.currentTarget.style.backgroundColor = "#1e1e35";
//                     e.currentTarget.style.boxShadow =
//                       "0 4px 10px rgba(0, 0, 0, 0.3)";
//                   }
//                 }}
//               >
//                 <span>{lang}</span>
//                 {isSelected && <FiCheckCircle style={styles.checkIcon} />}
//               </div>
//             );
//           })}
//         </div>

//         <button
//           style={styles.button(isProceedDisabled)}
//           onClick={handleProceed}
//           disabled={isProceedDisabled}
//           onMouseEnter={(e) => {
//             if (!isProceedDisabled) {
//               e.target.style.backgroundColor = "#b571ff";
//               e.target.style.boxShadow = "0 5px 25px rgba(181, 113, 255, 0.7)";
//             }
//           }}
//           onMouseLeave={(e) => {
//             if (!isProceedDisabled) {
//               e.target.style.backgroundColor = "#a350ff";
//               e.target.style.boxShadow = "0 5px 20px rgba(163, 80, 255, 0.5)";
//             }
//           }}
//         >
//           Proceed to Dashboard ({selectedLanguages.length} / 5 selected)
//         </button>
//         {selectedLanguages.length === 5 && (
//           <p
//             style={{
//               textAlign: "center",
//               color: styles.color.successGreen,
//               marginTop: "10px",
//               fontWeight: "600",
//             }}
//           >
//             Maximum languages selected!
//           </p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default LanguageSelection;
