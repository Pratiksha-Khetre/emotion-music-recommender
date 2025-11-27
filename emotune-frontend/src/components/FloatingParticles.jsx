import React, { useRef, useEffect } from "react";

// --- EMOJI & SYMBOL DEFINITIONS ---
// Symbols used in the background based on the current emotion
const emotionSymbols = {
  Angry: ["🔥", "💢", "💥", "😡", "😠", "👿", "🤬"],
  Disgust: ["🤢", "🤮", "❌", "🦠", "🤧", "🙅‍♂️", "🙅‍♀️"],
  Fear: ["😨", "👻", "🥶", "😱", "😰", "😖", "😧"],
  Happy: [
    "😊",
    "😄",
    "🎶",
    "🎵",
    "🎧",
    "😁",
    "😃",
    "😆",
    "🥳",
    "🤩",
    "🌞",
    "🌸",
  ],
  Neutral: ["⚫", "⚪", "🔘", "😐", "😑", "🤔", "🔹", "⚪"],
  Sad: ["😢", "🌧️", "💧", "😞", "😔", "😭", "☔", "🕯️", "🥀"],
  Surprise: ["😮", "🤯", "✨", "😲", "😳", "😵", "🤭", "🎇"],
};

// -----------------------------------------------------------

// CRITICAL: Accepts both 'emotion' (to get the right symbols)
// and 'currentTheme' (to get the colors for drawing)
export default function FloatingParticles({ emotion, currentTheme }) {
  // Get the array of symbols based on the emotion prop
  const symbols = emotionSymbols[emotion] || emotionSymbols.Neutral;

  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setCanvasSize();

    const particles = [];
    const particleCount = 40;
    const fontSize = 16;

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 0.8 + 0.4;
        this.speedX = Math.random() * 0.6 * this.size - 0.3 * this.size;
        this.speedY = Math.random() * 0.6 * this.size - 0.3 * this.size;
        this.opacity = Math.random() * 0.5 + 0.5;
        this.symbol = symbols[Math.floor(Math.random() * symbols.length)];
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Wrap around the screen
        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;
      }

      draw() {
        // Use currentTheme.particles for the color, though emojis ignore this,
        // it's kept for potential fallback logic if needed
        ctx.font = `${fontSize * this.size}px Arial`;
        ctx.globalAlpha = this.opacity;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(this.symbol, this.x, this.y);
      }
    }

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    let animationFrameId;

    function animate() {
      // Background fade effect using the theme's color1
      ctx.fillStyle = currentTheme.color1 + "10";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          // Connect if particles are close
          if (distance < 150) {
            ctx.strokeStyle = currentTheme.particles; // Use theme color for lines
            ctx.globalAlpha = 0.3 * (1 - distance / 150);
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1; // Reset alpha before drawing symbols

      particles.forEach((particle) => {
        particle.update();
        particle.draw();
      });

      animationFrameId = requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      setCanvasSize();
      // Reinitialize particles on resize
      particles.length = 0;
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };

    window.addEventListener("resize", handleResize);

    // Cleanup function
    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
    // Dependencies include the theme object which triggers re-render on emotion change
  }, [emotion, symbols, currentTheme]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}
