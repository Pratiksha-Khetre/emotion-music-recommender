import React, { useState } from "react";
import axios from "axios";
import { Navigate } from "react-router-dom";

const EmotionPlayer = () => {
  const [emotion, setEmotion] = useState(null);
  const [songs, setSongs] = useState([]);
  const [playing, setPlaying] = useState(false);

  const handleCapture = async (imageData) => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/detect_emotion/",
        { image_data: imageData }
      );
      const detectedEmotion = response.data.emotion;
      setEmotion(detectedEmotion);

      const songsResponse = await axios.get(
        "http://127.0.0.1:8000/recommend_songs/",
        { params: { emotion: detectedEmotion } }
      );
      setSongs(songsResponse.data.songs);
    } catch (error) {
      console.error("Error detecting emotion:", error);
    }
  };

  const handlePlay = async (uri) => {
    try {
      await axios.post("http://127.0.0.1:8000/play_song/", { uri });
      setPlaying(true);
    } catch (error) {
      console.error("Error playing song:", error);
    }
  };

  return (
    <div>
      <h1>Emotion-Based Music Player</h1>
      <div>
        {/* Implement image capture/upload here */}
        <button onClick={() => handleCapture("image_data")}>
          Capture Image
        </button>
      </div>
      {emotion && <p>Detected Emotion: {emotion}</p>}
      {songs.length > 0 && (
        <div>
          <h2>Recommended Songs</h2>
          <ul>
            {songs.map((song) => (
              <li key={song.uri}>
                {song.name} by {song.artist}
                <button onClick={() => handlePlay(song.uri)}>Play</button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {playing && <p>Now Playing...</p>}
    </div>
  );
};

export default EmotionPlayer;
