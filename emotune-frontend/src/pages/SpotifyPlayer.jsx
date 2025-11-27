import React, { useState, useEffect } from "react";

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

const emotions = [
  { name: "Angry", emoji: "😠" },
  { name: "Disgust", emoji: "🤢" },
  { name: "Fear", emoji: "😨" },
  { name: "Happy", emoji: "😊" },
  { name: "Neutral", emoji: "😐" },
  { name: "Sad", emoji: "😢" },
  { name: "Surprise", emoji: "😮" },
];

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

const SpotifyPlayer = () => {
  const [selectedEmotion, setSelectedEmotion] = useState("Happy");
  const [recommendations, setRecommendations] = useState([]);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [loading, setLoading] = useState(false);
  const [savedTracks, setSavedTracks] = useState([]);
  const [currentOffset, setCurrentOffset] = useState(0);
  const [displayLanguages, setDisplayLanguages] = useState([]);

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
    setDisplayLanguages(langs);
    console.log("[INIT] Languages:", langs);
    doFetch("Happy", 0, langs);
  }, []);

  const doFetch = async (emotion, offset, languagesToUse) => {
    setLoading(true);
    try {
      const langString = languagesToUse.join(",");
      const url = `${API_BASE_URL}/get_recommendations/?emotion=${emotion}&languages=${langString}&offset=${offset}`;

      console.log("[FETCH] URL:", url);
      console.log("[FETCH] Languages:", languagesToUse);

      const response = await fetch(url);
      const data = await response.json();

      console.log("[RESPONSE] Emotions:", data.emotion);
      console.log("[RESPONSE] Languages:", data.languages);
      console.log("[RESPONSE] Songs:", data.recommendations.length);

      setRecommendations(data.recommendations || []);
      if (data.recommendations?.length > 0) {
        setSelectedTrack(data.recommendations[0]);
      }
    } catch (err) {
      console.error("[ERROR]", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEmotionClick = (emotion) => {
    setSelectedEmotion(emotion);
    setCurrentOffset(0);
    setSelectedTrack(null);
    const langs = getLanguages();
    doFetch(emotion, 0, langs);
  };

  const handleRefresh = () => {
    const newOffset = currentOffset + 10;
    setCurrentOffset(newOffset);
    const langs = getLanguages();
    doFetch(selectedEmotion, newOffset, langs);
  };

  const handleTrackClick = (track) => {
    setSelectedTrack(track);
  };

  const handleSave = (trackId) => {
    setSavedTracks((prev) =>
      prev.includes(trackId)
        ? prev.filter((id) => id !== trackId)
        : [...prev, trackId]
    );
  };

  return (
    <div
      style={{
        backgroundColor: colors.darkBg,
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      {/* MOOD BAR */}
      <div
        style={{
          backgroundColor: colors.barBg,
          padding: "20px 30px",
          borderBottom: `2px solid ${colors.accentPurple}`,
          textAlign: "center",
          marginBottom: "40px",
          borderRadius: "15px",
        }}
      >
        <div
          style={{
            color: colors.accentPurple,
            fontSize: "24px",
            fontWeight: "700",
            marginBottom: "10px",
          }}
        >
          Select Your Mood
        </div>

        <div
          style={{
            color: colors.neonGreen,
            fontSize: "13px",
            marginBottom: "15px",
          }}
        >
          Languages:{" "}
          {displayLanguages.map((l) => `${languageFlags[l]} ${l}`).join(" • ")}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          {emotions.map((e) => (
            <button
              key={e.name}
              onClick={() => handleEmotionClick(e.name)}
              style={{
                padding: "10px 18px",
                borderRadius: "25px",
                border:
                  selectedEmotion === e.name
                    ? `2px solid ${colors.neonGreen}`
                    : "2px solid transparent",
                backgroundColor:
                  selectedEmotion === e.name ? colors.accentPurple : "#2b2b45",
                color: colors.textLight,
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              {e.emoji} {e.name}
            </button>
          ))}
        </div>
      </div>

      {/* GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "30px",
          maxWidth: "1600px",
          margin: "0 auto",
          padding: "0 20px",
        }}
      >
        {/* PLAYER */}
        <div
          style={{
            backgroundColor: colors.cardBg,
            borderRadius: "15px",
            padding: "25px",
          }}
        >
          <h2
            style={{
              color: colors.textLight,
              marginTop: 0,
              marginBottom: "20px",
              fontSize: "20px",
              fontWeight: "700",
            }}
          >
            Now Playing
          </h2>

          {selectedTrack ? (
            <div>
              <div
                style={{
                  borderRadius: "12px",
                  overflow: "hidden",
                  marginBottom: "20px",
                }}
              >
                <iframe
                  style={{
                    width: "100%",
                    height: "380px",
                    border: "none",
                    borderRadius: "12px",
                  }}
                  src={`https://open.spotify.com/embed/track/${selectedTrack.id}`}
                  allowFullScreen=""
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                />
              </div>

              <div
                style={{
                  backgroundColor: colors.inputCardBgVisible,
                  padding: "15px",
                  borderRadius: "8px",
                }}
              >
                <div
                  style={{
                    color: colors.textLight,
                    fontSize: "16px",
                    fontWeight: "700",
                    marginBottom: "5px",
                  }}
                >
                  {selectedTrack.title}
                </div>
                <div
                  style={{
                    color: colors.textGray,
                    fontSize: "14px",
                    marginBottom: "8px",
                  }}
                >
                  {selectedTrack.artist}
                </div>
                {selectedTrack.language && (
                  <div
                    style={{
                      color: colors.neonGreen,
                      fontSize: "13px",
                      marginBottom: "10px",
                    }}
                  >
                    {languageFlags[selectedTrack.language]}{" "}
                    {selectedTrack.language}
                  </div>
                )}
                <a
                  href={selectedTrack.external_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-block",
                    marginTop: "12px",
                    padding: "8px 16px",
                    backgroundColor: colors.neonGreen,
                    color: "#000",
                    borderRadius: "6px",
                    textDecoration: "none",
                    fontSize: "12px",
                    fontWeight: "700",
                  }}
                >
                  Open on Spotify
                </a>
              </div>
            </div>
          ) : (
            <div
              style={{
                textAlign: "center",
                color: colors.textGray,
                padding: "60px 20px",
              }}
            >
              {loading ? "Loading..." : "Select a song"}
            </div>
          )}
        </div>

        {/* RECOMMENDATIONS */}
        <div
          style={{
            backgroundColor: colors.cardBg,
            borderRadius: "15px",
            padding: "25px",
            display: "flex",
            flexDirection: "column",
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
            <h2
              style={{
                color: colors.textLight,
                marginTop: 0,
                marginBottom: 0,
                fontSize: "18px",
              }}
            >
              Top {Math.min(10, recommendations.length)} Songs
            </h2>

            <button
              onClick={handleRefresh}
              disabled={loading}
              style={{
                padding: "8px 16px",
                backgroundColor: loading ? colors.textGray : colors.neonGreen,
                color: "#000",
                border: "none",
                borderRadius: "8px",
                cursor: loading ? "not-allowed" : "pointer",
                fontWeight: "700",
              }}
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>

          {recommendations.length === 0 ? (
            <div style={{ textAlign: "center", color: colors.textGray }}>
              No songs found
            </div>
          ) : (
            <div
              style={{
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                flex: 1,
              }}
            >
              {recommendations.slice(0, 10).map((track, idx) => (
                <div
                  key={`${track.id}-${idx}`}
                  onClick={() => handleTrackClick(track)}
                  style={{
                    padding: "12px",
                    backgroundColor:
                      selectedTrack?.id === track.id
                        ? colors.accentPurple
                        : "#2b2b45",
                    borderRadius: "8px",
                    cursor: "pointer",
                    border:
                      selectedTrack?.id === track.id
                        ? `2px solid ${colors.neonGreen}`
                        : "none",
                  }}
                >
                  <div
                    style={{
                      color: colors.textLight,
                      fontWeight: "600",
                      marginBottom: "4px",
                    }}
                  >
                    {currentOffset + idx + 1}. {track.title}
                  </div>
                  <div
                    style={{
                      color: colors.textGray,
                      fontSize: "12px",
                      marginBottom: "4px",
                    }}
                  >
                    {track.artist}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    {track.language && (
                      <div
                        style={{ color: colors.neonGreen, fontSize: "11px" }}
                      >
                        {languageFlags[track.language]} {track.language}
                      </div>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSave(track.id);
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "16px",
                        padding: 0,
                      }}
                    >
                      {savedTracks.includes(track.id) ? "❤️" : "🤍"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div
            style={{
              marginTop: "15px",
              paddingTop: "15px",
              borderTop: `1px solid ${colors.textGray}`,
              color: colors.textGray,
              fontSize: "12px",
              textAlign: "center",
            }}
          >
            Songs {currentOffset + 1} to{" "}
            {currentOffset + Math.min(10, recommendations.length)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpotifyPlayer;
