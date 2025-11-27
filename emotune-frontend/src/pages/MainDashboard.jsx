// // src/pages/MainDashboard.jsx
// import React, { useState, useRef, useEffect } from "react";
// import {
//   incrementScans,
//   incrementSongsPlayed,
//   recordEmotion,
//   addFavoriteSong,
// } from "../utils/statsTracker";
// import { FiRefreshCw, FiHeart } from "react-icons/fi";

// const API_BASE_URL = "http://127.0.0.1:8000";

// const colors = {
//   darkBg: "#0f0f1c",
//   cardBg: "#1e1e35",
//   accentPurple: "#a350ff",
//   neonGreen: "#39ff14",
//   textLight: "#f0f0f0",
//   textGray: "#b0b0c2",
//   coralRed: "#ff6b6b",
//   barBg: "#15152a",
//   inputCardBgVisible: "#3a1f50",
// };

// const emotions = [
//   { name: "Angry", emoji: "😠" },
//   { name: "Disgust", emoji: "🤢" },
//   { name: "Fear", emoji: "😨" },
//   { name: "Happy", emoji: "😊" },
//   { name: "Neutral", emoji: "😐" },
//   { name: "Sad", emoji: "😢" },
//   { name: "Surprise", emoji: "😮" },
// ];

// const emotionEmojis = {
//   Angry: "😠",
//   Disgust: "🤢",
//   Fear: "😨",
//   Happy: "😊",
//   Neutral: "😐",
//   Sad: "😢",
//   Surprise: "😮",
// };

// const languageFlags = {
//   Hindi: "🇮🇳",
//   English: "🇬🇧",
//   Marathi: "🇮🇳",
//   Telugu: "🇮🇳",
//   Tamil: "🇮🇳",
//   Gujarati: "🇮🇳",
//   Urdu: "🇵🇰",
//   Kannada: "🇮🇳",
//   Bengali: "🇧🇩",
//   Malayalam: "🇮🇳",
// };

// export default function MainDashboard() {
//   const [selectedEmotion, setSelectedEmotion] = useState("Neutral");
//   const [predictedEmotion, setPredictedEmotion] = useState(null);
//   const [confidenceScore, setConfidenceScore] = useState(null);
//   const [mediaStream, setMediaStream] = useState(null);
//   const [isAnalyzing, setIsAnalyzing] = useState(false);
//   const [recommendations, setRecommendations] = useState([]);
//   const [analyzedImageSrc, setAnalyzedImageSrc] = useState(null);
//   const [selectedTrack, setSelectedTrack] = useState(null);
//   const [detectionMethod, setDetectionMethod] = useState(null);
//   const [userLanguages, setUserLanguages] = useState([]);
//   const [currentOffset, setCurrentOffset] = useState(0);
//   const [isRefreshing, setIsRefreshing] = useState(false);
//   const [favoriteSongs, setFavoriteSongs] = useState([]);

//   const videoRef = useRef(null);
//   const isStreaming = !!mediaStream;

//   const getLanguages = () => {
//     const stored = localStorage.getItem("user_languages");
//     if (stored) {
//       try {
//         return JSON.parse(stored);
//       } catch (e) {
//         return ["English"];
//       }
//     }
//     return ["English"];
//   };

//   useEffect(() => {
//     const langs = getLanguages();
//     setUserLanguages(langs);

//     // Load favorite songs from localStorage
//     const stats = localStorage.getItem("user_stats");
//     if (stats) {
//       const parsedStats = JSON.parse(stats);
//       setFavoriteSongs(parsedStats.favoriteSongs || []);
//     }
//   }, []);

//   const fetchRecommendations = async (emotion, offset = 0) => {
//     try {
//       const langs = getLanguages();
//       const langString = langs.join(",");
//       const url = `${API_BASE_URL}/get_recommendations/?emotion=${emotion}&languages=${langString}&offset=${offset}`;

//       console.log("📡 Fetching recommendations:");
//       console.log("   URL:", url);
//       console.log("   Emotion:", emotion);
//       console.log("   Languages:", langString);
//       console.log("   Offset:", offset);

//       const response = await fetch(url);
//       const data = await response.json();

//       console.log("📥 Received data:");
//       console.log("   Total available:", data.total_available);
//       console.log("   Returned count:", data.returned_count);

//       setRecommendations(data.recommendations || []);
//       setCurrentOffset(offset);
//       if (data.recommendations?.length > 0) {
//         setSelectedTrack(data.recommendations[0]);
//       }
//     } catch (err) {
//       console.error("Failed to fetch recommendations:", err);
//     }
//   };

//   const handleSelectEmotion = (emotionName) => {
//     handleStopWebcam();
//     setSelectedEmotion(emotionName);
//     setPredictedEmotion(null);
//     setConfidenceScore(null);
//     setDetectionMethod(null);
//     fetchRecommendations(emotionName, 0);
//   };

//   const handleWebcamClick = async () => {
//     if (isStreaming) {
//       runAnalysis();
//       return;
//     }

//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: { facingMode: "user" },
//       });
//       setMediaStream(stream);
//     } catch (err) {
//       alert("Could not access webcam. Check permissions.");
//     }
//   };

//   const runAnalysis = async () => {
//     if (!isStreaming || isAnalyzing) return;

//     setIsAnalyzing(true);
//     const video = videoRef.current;

//     if (!video || video.readyState < 2) {
//       alert("Webcam not ready");
//       setIsAnalyzing(false);
//       return;
//     }

//     const canvas = document.createElement("canvas");
//     canvas.width = video.videoWidth;
//     canvas.height = video.videoHeight;
//     const ctx = canvas.getContext("2d");

//     ctx.translate(canvas.width, 0);
//     ctx.scale(-1, 1);
//     ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
//     ctx.setTransform(1, 0, 0, 1, 0, 0);

//     canvas.toBlob(
//       async (blob) => {
//         if (!blob) {
//           setIsAnalyzing(false);
//           return;
//         }

//         const formData = new FormData();
//         formData.append("file", blob, "webcam_frame.jpeg");

//         try {
//           const response = await fetch(`${API_BASE_URL}/analyze_emotion/`, {
//             method: "POST",
//             body: formData,
//           });

//           const data = await response.json();
//           const newEmotion = data.predicted_emotion;
//           const confidence = data.confidence;

//           setAnalyzedImageSrc(data.processed_image_b64);
//           setPredictedEmotion(newEmotion);
//           setConfidenceScore(confidence);
//           setSelectedEmotion(newEmotion);
//           setDetectionMethod("Webcam");

//           // Track the emotion detection
//           incrementScans();
//           recordEmotion(newEmotion);

//           fetchRecommendations(newEmotion, 0);
//         } catch (err) {
//           alert(`Analysis failed: ${err.message}`);
//         } finally {
//           setIsAnalyzing(false);
//         }
//       },
//       "image/jpeg",
//       0.9
//     );
//   };

//   const handleStopWebcam = () => {
//     if (mediaStream) {
//       mediaStream.getTracks().forEach((track) => track.stop());
//     }
//     setMediaStream(null);
//     setAnalyzedImageSrc(null);
//   };

//   const handleImageUpload = (e) => {
//     handleStopWebcam();
//     const file = e.target.files[0];
//     if (!file) return;

//     const formData = new FormData();
//     formData.append("file", file);

//     fetch(`${API_BASE_URL}/analyze_emotion/`, {
//       method: "POST",
//       body: formData,
//     })
//       .then((r) => r.json())
//       .then((data) => {
//         const newEmotion = data.predicted_emotion;
//         const confidence = data.confidence;

//         setAnalyzedImageSrc(data.processed_image_b64);
//         setPredictedEmotion(newEmotion);
//         setConfidenceScore(confidence);
//         setSelectedEmotion(newEmotion);
//         setDetectionMethod("Image");

//         // Track the emotion detection
//         incrementScans();
//         recordEmotion(newEmotion);

//         fetchRecommendations(newEmotion, 0);
//       })
//       .catch((err) => alert(`Upload failed: ${err.message}`));
//   };

//   const handleRefreshSongs = async () => {
//     setIsRefreshing(true);
//     try {
//       const newOffset = currentOffset + 5;
//       console.log(
//         "Refresh: current offset =",
//         currentOffset,
//         "new offset =",
//         newOffset
//       );
//       await fetchRecommendations(selectedEmotion, newOffset);
//       console.log("Refresh complete");
//     } catch (err) {
//       console.error("Refresh failed:", err);
//     } finally {
//       setIsRefreshing(false);
//     }
//   };

//   const handleClearMood = () => {
//     handleStopWebcam();
//     setSelectedEmotion("Neutral");
//     setPredictedEmotion(null);
//     setConfidenceScore(null);
//     setDetectionMethod(null);
//     setSelectedTrack(null);
//     setRecommendations([]);
//   };

//   const handleToggleFavorite = (track) => {
//     const isFavorite = favoriteSongs.some((s) => s.id === track.id);

//     if (isFavorite) {
//       // Remove from favorites
//       const stats = JSON.parse(localStorage.getItem("user_stats") || "{}");
//       stats.favoriteSongs = (stats.favoriteSongs || []).filter(
//         (s) => s.id !== track.id
//       );
//       localStorage.setItem("user_stats", JSON.stringify(stats));
//       setFavoriteSongs(stats.favoriteSongs);
//     } else {
//       // Add to favorites
//       addFavoriteSong(track);
//       const stats = JSON.parse(localStorage.getItem("user_stats") || "{}");
//       setFavoriteSongs(stats.favoriteSongs || []);
//     }
//   };

//   const isFavorite = (trackId) => {
//     return favoriteSongs.some((s) => s.id === trackId);
//   };

//   useEffect(() => {
//     if (isStreaming && mediaStream && videoRef.current) {
//       videoRef.current.srcObject = mediaStream;
//       videoRef.current.play().catch((err) => console.error("Play error:", err));
//     }
//   }, [isStreaming, mediaStream]);

//   useEffect(() => {
//     return () => {
//       handleStopWebcam();
//     };
//   }, []);

//   // Track when a song is played
//   useEffect(() => {
//     if (selectedTrack) {
//       incrementSongsPlayed();
//     }
//   }, [selectedTrack]);

//   return (
//     <div
//       style={{
//         background: "linear-gradient(135deg, #0f0f1c 0%, #1a1a2e 100%)",
//         minHeight: "100vh",
//         padding: "20px",
//       }}
//     >
//       {/* MOOD BAR */}
//       <div
//         style={{
//           backgroundColor: "rgba(21, 21, 42, 0.8)",
//           backdropFilter: "blur(10px)",
//           padding: "25px 35px",
//           borderBottom: `3px solid ${colors.accentPurple}`,
//           textAlign: "center",
//           marginBottom: "40px",
//           borderRadius: "20px",
//           border: "1px solid rgba(163, 80, 255, 0.2)",
//           boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
//         }}
//       >
//         <div
//           style={{
//             background: "linear-gradient(135deg, #a350ff 0%, #d957ff 100%)",
//             WebkitBackgroundClip: "text",
//             WebkitTextFillColor: "transparent",
//             fontSize: "28px",
//             fontWeight: "900",
//             marginBottom: "12px",
//             letterSpacing: "1px",
//           }}
//         >
//           🎭 Select Your Mood
//         </div>

//         {userLanguages.length > 0 && (
//           <div
//             style={{
//               color: colors.neonGreen,
//               fontSize: "13px",
//               marginBottom: "18px",
//               fontWeight: "600",
//             }}
//           >
//             🌍 Languages:{" "}
//             {userLanguages.map((l) => `${languageFlags[l]} ${l}`).join(" • ")}
//           </div>
//         )}

//         <div
//           style={{
//             display: "flex",
//             justifyContent: "center",
//             gap: "15px",
//             flexWrap: "wrap",
//           }}
//         >
//           {emotions.map((e) => (
//             <button
//               key={e.name}
//               onClick={() => handleSelectEmotion(e.name)}
//               style={{
//                 padding: "12px 22px",
//                 borderRadius: "30px",
//                 border:
//                   selectedEmotion === e.name
//                     ? `3px solid ${colors.neonGreen}`
//                     : "3px solid transparent",
//                 background:
//                   selectedEmotion === e.name
//                     ? "linear-gradient(135deg, #a350ff 0%, #d957ff 100%)"
//                     : "rgba(43, 43, 75, 0.5)",
//                 color: colors.textLight,
//                 cursor: "pointer",
//                 fontSize: "15px",
//                 fontWeight: "700",
//                 transition: "all 0.3s ease",
//                 boxShadow:
//                   selectedEmotion === e.name
//                     ? "0 0 25px rgba(57, 255, 20, 0.5)"
//                     : "none",
//               }}
//               onMouseEnter={(e) => {
//                 if (
//                   selectedEmotion !== e.currentTarget.textContent.split(" ")[1]
//                 ) {
//                   e.currentTarget.style.backgroundColor =
//                     "rgba(163, 80, 255, 0.3)";
//                 }
//               }}
//               onMouseLeave={(e) => {
//                 if (
//                   selectedEmotion !== e.currentTarget.textContent.split(" ")[1]
//                 ) {
//                   e.currentTarget.style.backgroundColor =
//                     "rgba(43, 43, 75, 0.5)";
//                 }
//               }}
//             >
//               {e.emoji} {e.name}
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* MAIN GRID */}
//       <div
//         style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px" }}
//       >
//         {/* LEFT */}
//         <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
//           {/* WEBCAM/UPLOAD */}
//           <div
//             style={{
//               backgroundColor: "rgba(30, 30, 53, 0.8)",
//               backdropFilter: "blur(10px)",
//               borderRadius: "20px",
//               padding: "30px",
//               border: "1px solid rgba(163, 80, 255, 0.2)",
//               boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
//             }}
//           >
//             {isStreaming ? (
//               <div>
//                 <div
//                   style={{
//                     position: "relative",
//                     width: "100%",
//                     minHeight: "300px",
//                     borderRadius: "15px",
//                     overflow: "hidden",
//                     backgroundColor: "#000",
//                     marginBottom: "20px",
//                     border: `4px solid ${colors.neonGreen}`,
//                     boxShadow: "0 0 30px rgba(57, 255, 20, 0.4)",
//                   }}
//                 >
//                   {analyzedImageSrc ? (
//                     <img
//                       src={analyzedImageSrc}
//                       alt="Analyzed"
//                       style={{
//                         width: "100%",
//                         height: "100%",
//                         objectFit: "cover",
//                       }}
//                     />
//                   ) : (
//                     <video
//                       ref={videoRef}
//                       style={{
//                         width: "100%",
//                         height: "100%",
//                         objectFit: "cover",
//                         transform: "scaleX(-1)",
//                       }}
//                       autoPlay
//                       playsInline
//                       muted
//                     />
//                   )}
//                   <div
//                     style={{
//                       position: "absolute",
//                       top: "12px",
//                       left: "12px",
//                       background:
//                         "linear-gradient(135deg, #ff6b6b 0%, #ff8787 100%)",
//                       color: colors.textLight,
//                       padding: "8px 15px",
//                       borderRadius: "20px",
//                       fontSize: "13px",
//                       fontWeight: "900",
//                       boxShadow: "0 5px 20px rgba(255, 107, 107, 0.5)",
//                     }}
//                   >
//                     🔴 LIVE
//                   </div>
//                 </div>
//                 <div style={{ display: "flex", gap: "15px" }}>
//                   <button
//                     onClick={handleWebcamClick}
//                     disabled={isAnalyzing}
//                     style={{
//                       flex: 1,
//                       padding: "15px",
//                       background: isAnalyzing
//                         ? "linear-gradient(135deg, #5a5a70 0%, #3a3a50 100%)"
//                         : "linear-gradient(135deg, #39ff14 0%, #2ecc71 100%)",
//                       color: isAnalyzing ? colors.textLight : "#000",
//                       border: "none",
//                       borderRadius: "12px",
//                       fontWeight: "900",
//                       fontSize: "15px",
//                       cursor: isAnalyzing ? "not-allowed" : "pointer",
//                       boxShadow: isAnalyzing
//                         ? "none"
//                         : "0 5px 20px rgba(57, 255, 20, 0.4)",
//                       transition: "all 0.3s ease",
//                     }}
//                   >
//                     {isAnalyzing ? "🔄 Analyzing..." : "🎯 Start Analysis"}
//                   </button>
//                   <button
//                     onClick={handleStopWebcam}
//                     style={{
//                       flex: 1,
//                       padding: "15px",
//                       background:
//                         "linear-gradient(135deg, #ff6b6b 0%, #ff8787 100%)",
//                       color: colors.textLight,
//                       border: "none",
//                       borderRadius: "12px",
//                       fontWeight: "900",
//                       fontSize: "15px",
//                       cursor: "pointer",
//                       boxShadow: "0 5px 20px rgba(255, 107, 107, 0.4)",
//                       transition: "all 0.3s ease",
//                     }}
//                     onMouseEnter={(e) =>
//                       (e.target.style.transform = "translateY(-2px)")
//                     }
//                     onMouseLeave={(e) =>
//                       (e.target.style.transform = "translateY(0)")
//                     }
//                   >
//                     ⏹️ Stop
//                   </button>
//                 </div>
//               </div>
//             ) : (
//               <div style={{ display: "flex", gap: "20px" }}>
//                 <button
//                   onClick={handleWebcamClick}
//                   style={{
//                     flex: 1,
//                     padding: "60px 25px",
//                     background:
//                       "linear-gradient(135deg, rgba(163, 80, 255, 0.2) 0%, rgba(163, 80, 255, 0.1) 100%)",
//                     border: "3px dashed rgba(163, 80, 255, 0.5)",
//                     borderRadius: "15px",
//                     color: colors.textLight,
//                     cursor: "pointer",
//                     fontSize: "20px",
//                     fontWeight: "800",
//                     transition: "all 0.3s ease",
//                   }}
//                   onMouseEnter={(e) => {
//                     e.target.style.background =
//                       "linear-gradient(135deg, rgba(163, 80, 255, 0.3) 0%, rgba(163, 80, 255, 0.2) 100%)";
//                     e.target.style.borderColor = colors.accentPurple;
//                   }}
//                   onMouseLeave={(e) => {
//                     e.target.style.background =
//                       "linear-gradient(135deg, rgba(163, 80, 255, 0.2) 0%, rgba(163, 80, 255, 0.1) 100%)";
//                     e.target.style.borderColor = "rgba(163, 80, 255, 0.5)";
//                   }}
//                 >
//                   📷 Start Live Scan
//                 </button>
//                 <label
//                   style={{
//                     flex: 1,
//                     padding: "60px 25px",
//                     background:
//                       "linear-gradient(135deg, rgba(57, 255, 20, 0.2) 0%, rgba(57, 255, 20, 0.1) 100%)",
//                     border: "3px dashed rgba(57, 255, 20, 0.5)",
//                     borderRadius: "15px",
//                     color: colors.textLight,
//                     cursor: "pointer",
//                     fontSize: "20px",
//                     fontWeight: "800",
//                     textAlign: "center",
//                     transition: "all 0.3s ease",
//                   }}
//                   onMouseEnter={(e) => {
//                     e.target.style.background =
//                       "linear-gradient(135deg, rgba(57, 255, 20, 0.3) 0%, rgba(57, 255, 20, 0.2) 100%)";
//                     e.target.style.borderColor = colors.neonGreen;
//                   }}
//                   onMouseLeave={(e) => {
//                     e.target.style.background =
//                       "linear-gradient(135deg, rgba(57, 255, 20, 0.2) 0%, rgba(57, 255, 20, 0.1) 100%)";
//                     e.target.style.borderColor = "rgba(57, 255, 20, 0.5)";
//                   }}
//                 >
//                   📤 Upload Image
//                   <input
//                     type="file"
//                     accept="image/*"
//                     onChange={handleImageUpload}
//                     style={{ display: "none" }}
//                   />
//                 </label>
//               </div>
//             )}
//           </div>

//           {/* EMOTION STATUS */}
//           <div
//             style={{
//               backgroundColor: "rgba(30, 30, 53, 0.8)",
//               backdropFilter: "blur(10px)",
//               borderRadius: "20px",
//               padding: "30px",
//               textAlign: "center",
//               border: predictedEmotion
//                 ? `3px solid ${colors.neonGreen}`
//                 : "1px solid rgba(163, 80, 255, 0.2)",
//               boxShadow: predictedEmotion
//                 ? "0 0 40px rgba(57, 255, 20, 0.3)"
//                 : "0 10px 40px rgba(0, 0, 0, 0.3)",
//             }}
//           >
//             <div
//               style={{
//                 color: colors.neonGreen,
//                 fontSize: "14px",
//                 marginBottom: "12px",
//                 fontWeight: "700",
//                 letterSpacing: "1px",
//               }}
//             >
//               CURRENT EMOTION
//             </div>
//             <div style={{ fontSize: "64px", marginBottom: "10px" }}>
//               {emotionEmojis[selectedEmotion]}
//             </div>
//             <div
//               style={{
//                 fontSize: "36px",
//                 marginBottom: "10px",
//                 background: "linear-gradient(135deg, #a350ff 0%, #d957ff 100%)",
//                 WebkitBackgroundClip: "text",
//                 WebkitTextFillColor: "transparent",
//                 fontWeight: "900",
//               }}
//             >
//               {selectedEmotion}
//             </div>

//             {predictedEmotion && confidenceScore !== null && (
//               <div
//                 style={{
//                   background:
//                     "linear-gradient(135deg, rgba(163, 80, 255, 0.2) 0%, rgba(57, 255, 20, 0.2) 100%)",
//                   padding: "15px",
//                   borderRadius: "12px",
//                   marginBottom: "15px",
//                   border: "1px solid rgba(163, 80, 255, 0.3)",
//                 }}
//               >
//                 <div
//                   style={{
//                     color: colors.neonGreen,
//                     fontSize: "13px",
//                     marginBottom: "8px",
//                     fontWeight: "700",
//                   }}
//                 >
//                   CONFIDENCE SCORE
//                 </div>
//                 <div
//                   style={{
//                     color: colors.neonGreen,
//                     fontSize: "24px",
//                     fontWeight: "900",
//                   }}
//                 >
//                   {(confidenceScore * 100).toFixed(1)}%
//                 </div>
//               </div>
//             )}

//             <div
//               style={{
//                 color: colors.textGray,
//                 fontSize: "14px",
//                 marginTop: "12px",
//                 marginBottom: "20px",
//                 fontWeight: "600",
//               }}
//             >
//               {predictedEmotion
//                 ? `✨ Detected via ${detectionMethod}`
//                 : "🎯 Manually Selected"}
//             </div>
//             <button
//               onClick={handleClearMood}
//               style={{
//                 padding: "12px 25px",
//                 background: "linear-gradient(135deg, #ff6b6b 0%, #ff8787 100%)",
//                 color: colors.textLight,
//                 border: "none",
//                 borderRadius: "25px",
//                 cursor: "pointer",
//                 fontWeight: "900",
//                 fontSize: "14px",
//                 boxShadow: "0 5px 20px rgba(255, 107, 107, 0.4)",
//                 transition: "all 0.3s ease",
//               }}
//               onMouseEnter={(e) =>
//                 (e.target.style.transform = "translateY(-2px)")
//               }
//               onMouseLeave={(e) => (e.target.style.transform = "translateY(0)")}
//             >
//               🗑️ Clear Mood
//             </button>
//           </div>
//         </div>

//         {/* RIGHT */}
//         <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
//           {/* TOP 5 SONGS */}
//           <div
//             style={{
//               backgroundColor: "rgba(30, 30, 53, 0.8)",
//               backdropFilter: "blur(10px)",
//               borderRadius: "20px",
//               padding: "30px",
//               border: "1px solid rgba(163, 80, 255, 0.2)",
//               boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
//             }}
//           >
//             <div
//               style={{
//                 display: "flex",
//                 justifyContent: "space-between",
//                 alignItems: "center",
//                 marginBottom: "20px",
//               }}
//             >
//               <h3
//                 style={{
//                   color: colors.textLight,
//                   margin: "0",
//                   fontSize: "20px",
//                   fontWeight: "900",
//                   display: "flex",
//                   alignItems: "center",
//                   gap: "10px",
//                 }}
//               >
//                 🎵 Songs {currentOffset + 1} - {currentOffset + 5}
//               </h3>
//               <button
//                 onClick={handleRefreshSongs}
//                 disabled={isRefreshing}
//                 style={{
//                   padding: "8px 18px",
//                   background: isRefreshing
//                     ? "linear-gradient(135deg, #5a5a70 0%, #3a3a50 100%)"
//                     : "linear-gradient(135deg, #39ff14 0%, #2ecc71 100%)",
//                   color: isRefreshing ? colors.textLight : "#000",
//                   border: "none",
//                   borderRadius: "20px",
//                   cursor: isRefreshing ? "not-allowed" : "pointer",
//                   fontWeight: "900",
//                   fontSize: "13px",
//                   opacity: isRefreshing ? 0.6 : 1,
//                   boxShadow: isRefreshing
//                     ? "none"
//                     : "0 5px 15px rgba(57, 255, 20, 0.3)",
//                   display: "flex",
//                   alignItems: "center",
//                   gap: "6px",
//                   transition: "all 0.3s ease",
//                 }}
//                 onMouseEnter={(e) =>
//                   !isRefreshing &&
//                   (e.target.style.transform = "translateY(-2px)")
//                 }
//                 onMouseLeave={(e) =>
//                   !isRefreshing && (e.target.style.transform = "translateY(0)")
//                 }
//               >
//                 <FiRefreshCw size={14} />
//                 {isRefreshing ? "Loading..." : "Refresh"}
//               </button>
//             </div>

//             {recommendations.length === 0 ? (
//               <div
//                 style={{
//                   padding: "60px 20px",
//                   textAlign: "center",
//                   color: colors.textGray,
//                   backgroundColor: colors.inputCardBgVisible,
//                   borderRadius: "15px",
//                 }}
//               >
//                 <div style={{ fontSize: "64px", marginBottom: "15px" }}>🎧</div>
//                 <div style={{ fontSize: "16px", fontWeight: "600" }}>
//                   Select a mood to get recommendations!
//                 </div>
//               </div>
//             ) : (
//               <div
//                 style={{
//                   display: "grid",
//                   gridTemplateColumns: "repeat(5, 1fr)",
//                   gap: "12px",
//                 }}
//               >
//                 {recommendations.slice(0, 5).map((track, idx) => (
//                   <div
//                     key={`${track.id}-${idx}-${currentOffset}`}
//                     onClick={() => setSelectedTrack(track)}
//                     style={{
//                       cursor: "pointer",
//                       borderRadius: "12px",
//                       overflow: "hidden",
//                       border:
//                         selectedTrack?.id === track.id
//                           ? `3px solid ${colors.neonGreen}`
//                           : "3px solid transparent",
//                       transition: "all 0.3s ease",
//                       transform:
//                         selectedTrack?.id === track.id
//                           ? "scale(1.05)"
//                           : "scale(1)",
//                       boxShadow:
//                         selectedTrack?.id === track.id
//                           ? "0 0 25px rgba(57, 255, 20, 0.5)"
//                           : "0 5px 15px rgba(0, 0, 0, 0.3)",
//                       position: "relative",
//                     }}
//                   >
//                     {track.image_url ? (
//                       <img
//                         src={track.image_url}
//                         alt={track.title}
//                         style={{
//                           width: "100%",
//                           height: "120px",
//                           objectFit: "cover",
//                           marginBottom: "8px",
//                           borderRadius: "8px",
//                         }}
//                       />
//                     ) : (
//                       <div
//                         style={{
//                           width: "100%",
//                           height: "120px",
//                           background:
//                             "linear-gradient(135deg, rgba(163, 80, 255, 0.3) 0%, rgba(163, 80, 255, 0.1) 100%)",
//                           display: "flex",
//                           alignItems: "center",
//                           justifyContent: "center",
//                           fontSize: "36px",
//                           marginBottom: "8px",
//                           borderRadius: "8px",
//                         }}
//                       >
//                         🎵
//                       </div>
//                     )}
//                     <button
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         handleToggleFavorite(track);
//                       }}
//                       style={{
//                         position: "absolute",
//                         top: "8px",
//                         right: "8px",
//                         background: isFavorite(track.id)
//                           ? "linear-gradient(135deg, #ff6b6b 0%, #ff8787 100%)"
//                           : "rgba(0, 0, 0, 0.6)",
//                         border: "none",
//                         borderRadius: "50%",
//                         width: "32px",
//                         height: "32px",
//                         display: "flex",
//                         alignItems: "center",
//                         justifyContent: "center",
//                         cursor: "pointer",
//                         transition: "all 0.3s ease",
//                         boxShadow: "0 3px 10px rgba(0, 0, 0, 0.3)",
//                       }}
//                       onMouseEnter={(e) =>
//                         (e.target.style.transform = "scale(1.1)")
//                       }
//                       onMouseLeave={(e) =>
//                         (e.target.style.transform = "scale(1)")
//                       }
//                     >
//                       <FiHeart
//                         size={16}
//                         color={isFavorite(track.id) ? "#fff" : "#ff6b6b"}
//                         fill={isFavorite(track.id) ? "#fff" : "none"}
//                       />
//                     </button>
//                     <div style={{ padding: "0 8px 8px" }}>
//                       <div
//                         style={{
//                           color: colors.textLight,
//                           fontWeight: "700",
//                           fontSize: "12px",
//                           whiteSpace: "nowrap",
//                           overflow: "hidden",
//                           textOverflow: "ellipsis",
//                           marginBottom: "3px",
//                         }}
//                       >
//                         {track.title}
//                       </div>
//                       <div
//                         style={{
//                           color: colors.textGray,
//                           fontSize: "10px",
//                           whiteSpace: "nowrap",
//                           overflow: "hidden",
//                           textOverflow: "ellipsis",
//                           marginBottom: "4px",
//                         }}
//                       >
//                         {track.artist}
//                       </div>
//                       {track.language && (
//                         <div
//                           style={{
//                             color: colors.neonGreen,
//                             fontSize: "9px",
//                             fontWeight: "600",
//                           }}
//                         >
//                           {languageFlags[track.language]} {track.language}
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* NOW PLAYING */}
//           {selectedTrack && (
//             <div
//               style={{
//                 backgroundColor: "rgba(30, 30, 53, 0.8)",
//                 backdropFilter: "blur(10px)",
//                 borderRadius: "20px",
//                 padding: "30px",
//                 border: "1px solid rgba(163, 80, 255, 0.2)",
//                 boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
//               }}
//             >
//               <div
//                 style={{
//                   display: "flex",
//                   justifyContent: "space-between",
//                   alignItems: "center",
//                   marginBottom: "20px",
//                 }}
//               >
//                 <h3
//                   style={{
//                     color: colors.textLight,
//                     margin: "0",
//                     fontSize: "20px",
//                     fontWeight: "900",
//                     display: "flex",
//                     alignItems: "center",
//                     gap: "10px",
//                   }}
//                 >
//                   🎧 Now Playing
//                 </h3>
//                 <button
//                   onClick={() => handleToggleFavorite(selectedTrack)}
//                   style={{
//                     padding: "10px 20px",
//                     background: isFavorite(selectedTrack.id)
//                       ? "linear-gradient(135deg, #ff6b6b 0%, #ff8787 100%)"
//                       : "linear-gradient(135deg, rgba(255, 107, 107, 0.2) 0%, rgba(255, 107, 107, 0.1) 100%)",
//                     color: colors.textLight,
//                     border: isFavorite(selectedTrack.id)
//                       ? "2px solid #ff6b6b"
//                       : "2px solid rgba(255, 107, 107, 0.5)",
//                     borderRadius: "25px",
//                     cursor: "pointer",
//                     fontWeight: "900",
//                     fontSize: "13px",
//                     display: "flex",
//                     alignItems: "center",
//                     gap: "8px",
//                     transition: "all 0.3s ease",
//                     boxShadow: isFavorite(selectedTrack.id)
//                       ? "0 5px 20px rgba(255, 107, 107, 0.4)"
//                       : "none",
//                   }}
//                   onMouseEnter={(e) =>
//                     (e.target.style.transform = "translateY(-2px)")
//                   }
//                   onMouseLeave={(e) =>
//                     (e.target.style.transform = "translateY(0)")
//                   }
//                 >
//                   <FiHeart
//                     size={16}
//                     fill={isFavorite(selectedTrack.id) ? "#e80c0cff" : "none"}
//                   />
//                   {isFavorite(selectedTrack.id)
//                     ? "Remove from Favorites"
//                     : "Add to Favorites"}
//                 </button>
//               </div>
//               <div
//                 style={{
//                   borderRadius: "15px",
//                   overflow: "hidden",
//                   boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
//                 }}
//               >
//                 <iframe
//                   style={{
//                     width: "100%",
//                     height: "352px",
//                     border: "none",
//                     borderRadius: "15px",
//                   }}
//                   src={`https://open.spotify.com/embed/track/${selectedTrack.id}`}
//                   allowFullScreen=""
//                   allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
//                   loading="lazy"
//                 />
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// src/pages/MainDashboard.jsx
import React, { useState, useRef, useEffect } from "react";
import {
  incrementScans,
  incrementSongsPlayed,
  recordEmotion,
  addFavoriteSong,
} from "../utils/statsTracker";
import { FiRefreshCw, FiHeart, FiItalic } from "react-icons/fi";

const API_BASE_URL = "http://127.0.0.1:8000";

const colors = {
  darkBg: "#0f0f1c",
  cardBg: "#1e1e35",
  accentPurple: "#a350ff",
  neonGreen: "#39ff14",
  textLight: "#f0f0f0",
  textGray: "#b0b0c2",
  coralRed: "#ff6b6b",
  barBg: "#15152a",
  inputCardBgVisible: "#3a1f50",
};

<div
  style={{
    background:
      "linear-gradient(135deg, #1a0b2e 0%, #2d1b4e 25%, #1e3a5f 50%, #2d1b4e 75%, #1a0b2e 100%)",
    minHeight: "100vh",
    width: "100%",
    margin: 0,
    padding: "20px",
    position: "relative",
    overflow: "hidden",
  }}
></div>;

const emotions = [
  { name: "Angry", emoji: "😠" },
  { name: "Disgust", emoji: "🤢" },
  { name: "Fear", emoji: "😨" },
  { name: "Happy", emoji: "😊" },
  { name: "Neutral", emoji: "😐" },
  { name: "Sad", emoji: "😢" },
  { name: "Surprise", emoji: "😮" },
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

const languageFlags = {
  Hindi: "🇮🇳",
  English: "🇬🇧",
  Marathi: "🇮🇳",
  Telugu: "🇮🇳",
  Tamil: "🇮🇳",
  Gujarati: "🇮🇳",
  Urdu: "🇵🇰",
  Kannada: "🇮🇳",
  Bengali: "🇧🇩",
  Malayalam: "🇮🇳",
};

// Floating emojis for background
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

export default function MainDashboard() {
  const [selectedEmotion, setSelectedEmotion] = useState("Neutral");
  const [predictedEmotion, setPredictedEmotion] = useState(null);
  const [confidenceScore, setConfidenceScore] = useState(null);
  const [mediaStream, setMediaStream] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [analyzedImageSrc, setAnalyzedImageSrc] = useState(null);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [detectionMethod, setDetectionMethod] = useState(null);
  const [userLanguages, setUserLanguages] = useState([]);
  const [currentOffset, setCurrentOffset] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [favoriteSongs, setFavoriteSongs] = useState([]);

  const videoRef = useRef(null);
  const isStreaming = !!mediaStream;

  const getLanguages = () => {
    const stored = localStorage.getItem("user_languages");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        return ["English"];
      }
    }
    return ["English"];
  };

  useEffect(() => {
    const langs = getLanguages();
    setUserLanguages(langs);

    // Load favorite songs from localStorage
    const stats = localStorage.getItem("user_stats");
    if (stats) {
      const parsedStats = JSON.parse(stats);
      setFavoriteSongs(parsedStats.favoriteSongs || []);
    }
  }, []);

  const fetchRecommendations = async (emotion, offset = 0) => {
    try {
      const langs = getLanguages();
      const langString = langs.join(",");
      const url = `${API_BASE_URL}/get_recommendations/?emotion=${emotion}&languages=${langString}&offset=${offset}`;

      console.log("📡 Fetching recommendations:");
      console.log("   URL:", url);
      console.log("   Emotion:", emotion);
      console.log("   Languages:", langString);
      console.log("   Offset:", offset);

      const response = await fetch(url);
      const data = await response.json();

      console.log("📥 Received data:");
      console.log("   Total available:", data.total_available);
      console.log("   Returned count:", data.returned_count);

      setRecommendations(data.recommendations || []);
      setCurrentOffset(offset);
      if (data.recommendations?.length > 0) {
        setSelectedTrack(data.recommendations[0]);
      }
    } catch (err) {
      console.error("Failed to fetch recommendations:", err);
    }
  };

  const handleSelectEmotion = (emotionName) => {
    handleStopWebcam();
    setSelectedEmotion(emotionName);
    setPredictedEmotion(null);
    setConfidenceScore(null);
    setDetectionMethod(null);
    fetchRecommendations(emotionName, 0);
  };

  const handleWebcamClick = async () => {
    if (isStreaming) {
      runAnalysis();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      setMediaStream(stream);
    } catch (err) {
      alert("Could not access webcam. Check permissions.");
    }
  };

  const runAnalysis = async () => {
    if (!isStreaming || isAnalyzing) return;

    setIsAnalyzing(true);
    const video = videoRef.current;

    if (!video || video.readyState < 2) {
      alert("Webcam not ready");
      setIsAnalyzing(false);
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");

    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          setIsAnalyzing(false);
          return;
        }

        const formData = new FormData();
        formData.append("file", blob, "webcam_frame.jpeg");

        try {
          const response = await fetch(`${API_BASE_URL}/analyze_emotion/`, {
            method: "POST",
            body: formData,
          });

          const data = await response.json();
          const newEmotion = data.predicted_emotion;
          const confidence = data.confidence;

          setAnalyzedImageSrc(data.processed_image_b64);
          setPredictedEmotion(newEmotion);
          setConfidenceScore(confidence);
          setSelectedEmotion(newEmotion);
          setDetectionMethod("Webcam");

          // Track the emotion detection
          incrementScans();
          recordEmotion(newEmotion);

          fetchRecommendations(newEmotion, 0);
        } catch (err) {
          alert(`Analysis failed: ${err.message}`);
        } finally {
          setIsAnalyzing(false);
        }
      },
      "image/jpeg",
      0.9
    );
  };

  const handleStopWebcam = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
    }
    setMediaStream(null);
    setAnalyzedImageSrc(null);
  };

  const handleImageUpload = (e) => {
    handleStopWebcam();
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    fetch(`${API_BASE_URL}/analyze_emotion/`, {
      method: "POST",
      body: formData,
    })
      .then((r) => r.json())
      .then((data) => {
        const newEmotion = data.predicted_emotion;
        const confidence = data.confidence;

        setAnalyzedImageSrc(data.processed_image_b64);
        setPredictedEmotion(newEmotion);
        setConfidenceScore(confidence);
        setSelectedEmotion(newEmotion);
        setDetectionMethod("Image");

        // Track the emotion detection
        incrementScans();
        recordEmotion(newEmotion);

        fetchRecommendations(newEmotion, 0);
      })
      .catch((err) => alert(`Upload failed: ${err.message}`));
  };

  const handleRefreshSongs = async () => {
    setIsRefreshing(true);
    try {
      const newOffset = currentOffset + 5;
      console.log(
        "Refresh: current offset =",
        currentOffset,
        "new offset =",
        newOffset
      );
      await fetchRecommendations(selectedEmotion, newOffset);
      console.log("Refresh complete");
    } catch (err) {
      console.error("Refresh failed:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleClearMood = () => {
    handleStopWebcam();
    setSelectedEmotion("Neutral");
    setPredictedEmotion(null);
    setConfidenceScore(null);
    setDetectionMethod(null);
    setSelectedTrack(null);
    setRecommendations([]);
  };

  const handleToggleFavorite = (track) => {
    const isFavorite = favoriteSongs.some((s) => s.id === track.id);

    if (isFavorite) {
      // Remove from favorites
      const stats = JSON.parse(localStorage.getItem("user_stats") || "{}");
      stats.favoriteSongs = (stats.favoriteSongs || []).filter(
        (s) => s.id !== track.id
      );
      localStorage.setItem("user_stats", JSON.stringify(stats));
      setFavoriteSongs(stats.favoriteSongs);
    } else {
      // Add to favorites
      addFavoriteSong(track);
      const stats = JSON.parse(localStorage.getItem("user_stats") || "{}");
      setFavoriteSongs(stats.favoriteSongs || []);
    }
  };

  const isFavorite = (trackId) => {
    return favoriteSongs.some((s) => s.id === trackId);
  };

  useEffect(() => {
    if (isStreaming && mediaStream && videoRef.current) {
      videoRef.current.srcObject = mediaStream;
      videoRef.current.play().catch((err) => console.error("Play error:", err));
    }
  }, [isStreaming, mediaStream]);

  useEffect(() => {
    return () => {
      handleStopWebcam();
    };
  }, []);

  // Track when a song is played
  useEffect(() => {
    if (selectedTrack) {
      incrementSongsPlayed();
    }
  }, [selectedTrack]);

  return (
    <div
      style={{
        background:
          "linear-gradient(135deg, #1a0b2e 0%, #2d1b4e 25%, #1e3a5f 50%, #2d1b4e 75%, #1a0b2e 100%)",
        minHeight: "100vh",
        padding: "20px",
        position: "relative",
        overflow: "hidden",
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

      {/* MOOD BAR */}
      <div
        style={{
          backgroundColor: "rgba(21, 21, 42, 0.8)",
          backdropFilter: "blur(10px)",
          padding: "25px 35px",
          borderBottom: `3px solid ${colors.accentPurple}`,
          textAlign: "center",
          marginBottom: "40px",
          borderRadius: "20px",
          border: "1px solid rgba(163, 80, 255, 0.2)",
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, #a350ff 0%, #d957ff 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontSize: "28px",
            fontWeight: "900",
            marginBottom: "12px",
            letterSpacing: "1px",
          }}
        >
          🎭 Select Your Mood
        </div>

        {userLanguages.length > 0 && (
          <div
            style={{
              color: colors.neonGreen,
              fontSize: "13px",
              marginBottom: "18px",
              fontWeight: "600",
            }}
          >
            🌍 Languages:{" "}
            {userLanguages.map((l) => `${languageFlags[l]} ${l}`).join(" • ")}
          </div>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "15px",
            flexWrap: "wrap",
          }}
        >
          {emotions.map((e) => (
            <button
              key={e.name}
              onClick={() => handleSelectEmotion(e.name)}
              style={{
                padding: "12px 22px",
                borderRadius: "30px",
                border:
                  selectedEmotion === e.name
                    ? `3px solid ${colors.neonGreen}`
                    : "3px solid transparent",
                background:
                  selectedEmotion === e.name
                    ? "linear-gradient(135deg, #a350ff 0%, #d957ff 100%)"
                    : "rgba(43, 43, 75, 0.5)",
                color: colors.textLight,
                cursor: "pointer",
                fontSize: "15px",
                fontWeight: "700",
                transition: "all 0.3s ease",
                boxShadow:
                  selectedEmotion === e.name
                    ? "0 0 25px rgba(57, 255, 20, 0.5)"
                    : "none",
              }}
              onMouseEnter={(e) => {
                if (
                  selectedEmotion !== e.currentTarget.textContent.split(" ")[1]
                ) {
                  e.currentTarget.style.backgroundColor =
                    "rgba(163, 80, 255, 0.3)";
                }
              }}
              onMouseLeave={(e) => {
                if (
                  selectedEmotion !== e.currentTarget.textContent.split(" ")[1]
                ) {
                  e.currentTarget.style.backgroundColor =
                    "rgba(43, 43, 75, 0.5)";
                }
              }}
            >
              {e.emoji} {e.name}
            </button>
          ))}
        </div>
      </div>

      {/* MAIN GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "30px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* LEFT */}
        <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
          {/* WEBCAM/UPLOAD */}
          <div
            style={{
              backgroundColor: "rgba(30, 30, 53, 0.8)",
              backdropFilter: "blur(10px)",
              borderRadius: "20px",
              padding: "30px",
              border: "1px solid rgba(163, 80, 255, 0.2)",
              boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
            }}
          >
            {isStreaming ? (
              <div>
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    minHeight: "300px",
                    borderRadius: "15px",
                    overflow: "hidden",
                    backgroundColor: "#000",
                    marginBottom: "20px",
                    border: `4px solid ${colors.neonGreen}`,
                    boxShadow: "0 0 30px rgba(57, 255, 20, 0.4)",
                  }}
                >
                  {analyzedImageSrc ? (
                    <img
                      src={analyzedImageSrc}
                      alt="Analyzed"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <video
                      ref={videoRef}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        transform: "scaleX(-1)",
                      }}
                      autoPlay
                      playsInline
                      muted
                    />
                  )}
                  <div
                    style={{
                      position: "absolute",
                      top: "12px",
                      left: "12px",
                      background:
                        "linear-gradient(135deg, #ff6b6b 0%, #ff8787 100%)",
                      color: colors.textLight,
                      padding: "8px 15px",
                      borderRadius: "20px",
                      fontSize: "13px",
                      fontWeight: "900",
                      boxShadow: "0 5px 20px rgba(255, 107, 107, 0.5)",
                    }}
                  >
                    🔴 LIVE
                  </div>
                </div>
                <div style={{ display: "flex", gap: "15px" }}>
                  <button
                    onClick={handleWebcamClick}
                    disabled={isAnalyzing}
                    style={{
                      flex: 1,
                      padding: "15px",
                      background: isAnalyzing
                        ? "linear-gradient(135deg, #5a5a70 0%, #3a3a50 100%)"
                        : "linear-gradient(135deg, #39ff14 0%, #2ecc71 100%)",
                      color: isAnalyzing ? colors.textLight : "#000",
                      border: "none",
                      borderRadius: "12px",
                      fontWeight: "900",
                      fontSize: "15px",
                      cursor: isAnalyzing ? "not-allowed" : "pointer",
                      boxShadow: isAnalyzing
                        ? "none"
                        : "0 5px 20px rgba(57, 255, 20, 0.4)",
                      transition: "all 0.3s ease",
                    }}
                  >
                    {isAnalyzing ? "🔄 Analyzing..." : "🎯 Start Analysis"}
                  </button>
                  <button
                    onClick={handleStopWebcam}
                    style={{
                      flex: 1,
                      padding: "15px",
                      background:
                        "linear-gradient(135deg, #ff6b6b 0%, #ff8787 100%)",
                      color: colors.textLight,
                      border: "none",
                      borderRadius: "12px",
                      fontWeight: "900",
                      fontSize: "15px",
                      cursor: "pointer",
                      boxShadow: "0 5px 20px rgba(255, 107, 107, 0.4)",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) =>
                      (e.target.style.transform = "translateY(-2px)")
                    }
                    onMouseLeave={(e) =>
                      (e.target.style.transform = "translateY(0)")
                    }
                  >
                    ⏹️ Stop
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", gap: "20px" }}>
                <button
                  onClick={handleWebcamClick}
                  style={{
                    flex: 1,
                    padding: "60px 25px",
                    background:
                      "linear-gradient(135deg, rgba(163, 80, 255, 0.2) 0%, rgba(163, 80, 255, 0.1) 100%)",
                    border: "3px dashed rgba(163, 80, 255, 0.5)",
                    borderRadius: "15px",
                    color: colors.textLight,
                    cursor: "pointer",
                    fontSize: "20px",
                    fontWeight: "800",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background =
                      "linear-gradient(135deg, rgba(163, 80, 255, 0.3) 0%, rgba(163, 80, 255, 0.2) 100%)";
                    e.target.style.borderColor = colors.accentPurple;
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background =
                      "linear-gradient(135deg, rgba(163, 80, 255, 0.2) 0%, rgba(163, 80, 255, 0.1) 100%)";
                    e.target.style.borderColor = "rgba(163, 80, 255, 0.5)";
                  }}
                >
                  📷 Start Live Scan
                </button>
                <label
                  style={{
                    flex: 1,
                    padding: "60px 25px",
                    background:
                      "linear-gradient(135deg, rgba(57, 255, 20, 0.2) 0%, rgba(57, 255, 20, 0.1) 100%)",
                    border: "3px dashed rgba(57, 255, 20, 0.5)",
                    borderRadius: "15px",
                    color: colors.textLight,
                    cursor: "pointer",
                    fontSize: "20px",
                    fontWeight: "800",
                    textAlign: "center",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background =
                      "linear-gradient(135deg, rgba(57, 255, 20, 0.3) 0%, rgba(57, 255, 20, 0.2) 100%)";
                    e.target.style.borderColor = colors.neonGreen;
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background =
                      "linear-gradient(135deg, rgba(57, 255, 20, 0.2) 0%, rgba(57, 255, 20, 0.1) 100%)";
                    e.target.style.borderColor = "rgba(57, 255, 20, 0.5)";
                  }}
                >
                  📤 Upload Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: "none" }}
                  />
                </label>
              </div>
            )}
          </div>

          {/* EMOTION STATUS */}
          <div
            style={{
              backgroundColor: "rgba(30, 30, 53, 0.8)",
              backdropFilter: "blur(10px)",
              borderRadius: "20px",
              padding: "30px",
              textAlign: "center",
              border: predictedEmotion
                ? `3px solid ${colors.neonGreen}`
                : "1px solid rgba(163, 80, 255, 0.2)",
              boxShadow: predictedEmotion
                ? "0 0 40px rgba(57, 255, 20, 0.3)"
                : "0 10px 40px rgba(0, 0, 0, 0.3)",
            }}
          >
            <div
              style={{
                color: colors.neonGreen,
                fontSize: "14px",
                marginBottom: "12px",
                fontWeight: "700",
                letterSpacing: "1px",
              }}
            >
              CURRENT EMOTION
            </div>
            <div style={{ fontSize: "64px", marginBottom: "10px" }}>
              {emotionEmojis[selectedEmotion]}
            </div>
            <div
              style={{
                fontSize: "36px",
                marginBottom: "10px",
                background: "linear-gradient(135deg, #a350ff 0%, #d957ff 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontWeight: "900",
              }}
            >
              {selectedEmotion}
            </div>

            {predictedEmotion && confidenceScore !== null && (
              <div
                style={{
                  background:
                    "linear-gradient(135deg, rgba(163, 80, 255, 0.2) 0%, rgba(57, 255, 20, 0.2) 100%)",
                  padding: "15px",
                  borderRadius: "12px",
                  marginBottom: "15px",
                  border: "1px solid rgba(163, 80, 255, 0.3)",
                }}
              >
                <div
                  style={{
                    color: colors.neonGreen,
                    fontSize: "13px",
                    marginBottom: "8px",
                    fontWeight: "700",
                  }}
                >
                  CONFIDENCE SCORE
                </div>
                <div
                  style={{
                    color: colors.neonGreen,
                    fontSize: "24px",
                    fontWeight: "900",
                  }}
                >
                  {(confidenceScore * 100).toFixed(1)}%
                </div>
              </div>
            )}

            {/* <p>Your smile is the rhythm — let the music be the melody.</p> */}
            <p
              style={{
                color: colors.textLight,
                fontSize: "20px",
                fontStyle: "italic",
              }}
            >
              Your smile is the rhythm — let the music be the melody.
            </p>

            <div
              style={{
                color: colors.textGray,
                fontSize: "14px",
                marginTop: "12px",
                marginBottom: "20px",
                fontWeight: "600",
              }}
            >
              {predictedEmotion
                ? `✨ Detected via ${detectionMethod}`
                : "🎯 Manually Selected"}
            </div>
            <button
              onClick={handleClearMood}
              style={{
                padding: "12px 25px",
                background: "linear-gradient(135deg, #ff6b6b 0%, #ff8787 100%)",
                color: colors.textLight,
                border: "none",
                borderRadius: "25px",
                cursor: "pointer",
                fontWeight: "900",
                fontSize: "14px",
                boxShadow: "0 5px 20px rgba(255, 107, 107, 0.4)",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) =>
                (e.target.style.transform = "translateY(-2px)")
              }
              onMouseLeave={(e) => (e.target.style.transform = "translateY(0)")}
            >
              🗑️ Clear Mood
            </button>
          </div>
        </div>

        {/* RIGHT */}
        <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
          {/* TOP 5 SONGS */}
          <div
            style={{
              backgroundColor: "rgba(30, 30, 53, 0.8)",
              backdropFilter: "blur(10px)",
              borderRadius: "20px",
              padding: "30px",
              border: "1px solid rgba(163, 80, 255, 0.2)",
              boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h3
                style={{
                  color: colors.textLight,
                  margin: "0",
                  fontSize: "20px",
                  fontWeight: "900",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                🎵 Songs {currentOffset + 1} - {currentOffset + 5}
              </h3>
              <button
                onClick={handleRefreshSongs}
                disabled={isRefreshing}
                style={{
                  padding: "8px 18px",
                  background: isRefreshing
                    ? "linear-gradient(135deg, #5a5a70 0%, #3a3a50 100%)"
                    : "linear-gradient(135deg, #39ff14 0%, #2ecc71 100%)",
                  color: isRefreshing ? colors.textLight : "#000",
                  border: "none",
                  borderRadius: "20px",
                  cursor: isRefreshing ? "not-allowed" : "pointer",
                  fontWeight: "900",
                  fontSize: "13px",
                  opacity: isRefreshing ? 0.6 : 1,
                  boxShadow: isRefreshing
                    ? "none"
                    : "0 5px 15px rgba(57, 255, 20, 0.3)",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) =>
                  !isRefreshing &&
                  (e.target.style.transform = "translateY(-2px)")
                }
                onMouseLeave={(e) =>
                  !isRefreshing && (e.target.style.transform = "translateY(0)")
                }
              >
                <FiRefreshCw size={14} />
                {isRefreshing ? "Loading..." : "Refresh"}
              </button>
            </div>

            {recommendations.length === 0 ? (
              <div
                style={{
                  padding: "60px 20px",
                  textAlign: "center",
                  color: colors.textGray,
                  backgroundColor: colors.inputCardBgVisible,
                  borderRadius: "15px",
                }}
              >
                <div style={{ fontSize: "64px", marginBottom: "15px" }}>🎧</div>
                <div style={{ fontSize: "16px", fontWeight: "600" }}>
                  Select a mood to get recommendations!
                </div>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(5, 1fr)",
                  gap: "12px",
                }}
              >
                {recommendations.slice(0, 5).map((track, idx) => (
                  <div
                    key={`${track.id}-${idx}-${currentOffset}`}
                    onClick={() => setSelectedTrack(track)}
                    style={{
                      cursor: "pointer",
                      borderRadius: "12px",
                      overflow: "hidden",
                      border:
                        selectedTrack?.id === track.id
                          ? `3px solid ${colors.neonGreen}`
                          : "3px solid transparent",
                      transition: "all 0.3s ease",
                      transform:
                        selectedTrack?.id === track.id
                          ? "scale(1.05)"
                          : "scale(1)",
                      boxShadow:
                        selectedTrack?.id === track.id
                          ? "0 0 25px rgba(57, 255, 20, 0.5)"
                          : "0 5px 15px rgba(0, 0, 0, 0.3)",
                      position: "relative",
                    }}
                  >
                    {track.image_url ? (
                      <img
                        src={track.image_url}
                        alt={track.title}
                        style={{
                          width: "100%",
                          height: "120px",
                          objectFit: "cover",
                          marginBottom: "8px",
                          borderRadius: "8px",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "120px",
                          background:
                            "linear-gradient(135deg, rgba(163, 80, 255, 0.3) 0%, rgba(163, 80, 255, 0.1) 100%)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "36px",
                          marginBottom: "8px",
                          borderRadius: "8px",
                        }}
                      >
                        🎵
                      </div>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFavorite(track);
                      }}
                      style={{
                        position: "absolute",
                        top: "8px",
                        right: "8px",
                        background: isFavorite(track.id)
                          ? "linear-gradient(135deg, #ff6b6b 0%, #ff8787 100%)"
                          : "rgba(0, 0, 0, 0.6)",
                        border: "none",
                        borderRadius: "50%",
                        width: "32px",
                        height: "32px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        boxShadow: "0 3px 10px rgba(0, 0, 0, 0.3)",
                      }}
                      onMouseEnter={(e) =>
                        (e.target.style.transform = "scale(1.1)")
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.transform = "scale(1)")
                      }
                    >
                      <FiHeart
                        size={16}
                        color={isFavorite(track.id) ? "#fff" : "#ff6b6b"}
                        fill={isFavorite(track.id) ? "#fff" : "none"}
                      />
                    </button>
                    <div style={{ padding: "0 8px 8px" }}>
                      <div
                        style={{
                          color: colors.textLight,
                          fontWeight: "700",
                          fontSize: "12px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          marginBottom: "3px",
                        }}
                      >
                        {track.title}
                      </div>
                      <div
                        style={{
                          color: colors.textGray,
                          fontSize: "10px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          marginBottom: "4px",
                        }}
                      >
                        {track.artist}
                      </div>
                      {track.language && (
                        <div
                          style={{
                            color: colors.neonGreen,
                            fontSize: "9px",
                            fontWeight: "600",
                          }}
                        >
                          {languageFlags[track.language]} {track.language}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* NOW PLAYING */}
          {selectedTrack && (
            <div
              style={{
                backgroundColor: "rgba(30, 30, 53, 0.8)",
                backdropFilter: "blur(10px)",
                borderRadius: "20px",
                padding: "30px",
                border: "1px solid rgba(163, 80, 255, 0.2)",
                boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "20px",
                }}
              >
                <h3
                  style={{
                    color: colors.textLight,
                    margin: "0",
                    fontSize: "20px",
                    fontWeight: "900",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  🎧 Now Playing
                </h3>
                <button
                  onClick={() => handleToggleFavorite(selectedTrack)}
                  style={{
                    padding: "10px 20px",
                    background: isFavorite(selectedTrack.id)
                      ? "linear-gradient(135deg, #ff6b6b 0%, #ff8787 100%)"
                      : "linear-gradient(135deg, rgba(255, 107, 107, 0.2) 0%, rgba(255, 107, 107, 0.1) 100%)",
                    color: colors.textLight,
                    border: isFavorite(selectedTrack.id)
                      ? "2px solid #ff6b6b"
                      : "2px solid rgba(255, 107, 107, 0.5)",
                    borderRadius: "25px",
                    cursor: "pointer",
                    fontWeight: "900",
                    fontSize: "13px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    transition: "all 0.3s ease",
                    boxShadow: isFavorite(selectedTrack.id)
                      ? "0 5px 20px rgba(255, 107, 107, 0.4)"
                      : "none",
                  }}
                  onMouseEnter={(e) =>
                    (e.target.style.transform = "translateY(-2px)")
                  }
                  onMouseLeave={(e) =>
                    (e.target.style.transform = "translateY(0)")
                  }
                >
                  <FiHeart
                    size={16}
                    fill={isFavorite(selectedTrack.id) ? "#e80c0cff" : "none"}
                  />
                  {isFavorite(selectedTrack.id)
                    ? "Remove from Favorites"
                    : "Add to Favorites"}
                </button>
              </div>
              <div
                style={{
                  borderRadius: "15px",
                  overflow: "hidden",
                  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
                }}
              >
                <iframe
                  style={{
                    width: "100%",
                    height: "232px",
                    border: "none",
                    borderRadius: "15px",
                  }}
                  src={`https://open.spotify.com/embed/track/${selectedTrack.id}`}
                  allowFullScreen=""
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
