import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { Hero } from "../data/heroes";
import { playConfettiReveal } from "../sounds";

interface Props {
  hero: Hero;
  userName: string;
  onRestart: () => void;
}

export default function RevealScreen({ hero, userName, onRestart }: Props) {
  const [showProfile, setShowProfile] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const confettiFired = useRef(false);

  useEffect(() => {
    if (!confettiFired.current) {
      confettiFired.current = true;

      setTimeout(() => {
        playConfettiReveal();
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#e23636", "#f0b323", "#518cca", "#9C27B0", "#4CAF50"],
        });
      }, 800);

      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ["#e23636", "#f0b323", "#FFD700"],
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ["#518cca", "#9C27B0", "#4CAF50"],
        });
      }, 1200);

      setTimeout(() => setShowProfile(true), 1800);
    }
  }, []);

  return (
    <motion.div
      className="screen reveal-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="reveal-content">
        <motion.p
          className="reveal-greeting"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {userName}, твой герой Marvel —
        </motion.p>

        <motion.div
          className="hero-name-block"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 18, delay: 0.4 }}
        >
          <h1 className="hero-big-name" style={{ textShadow: `0 0 40px ${hero.shadowColor}` }}>
            {hero.name}
          </h1>
          <p className="hero-profile-realname">{hero.realName}</p>
          <p className="hero-profile-quote">«{hero.quote}»</p>
        </motion.div>

        <motion.div
          className="hero-photo-wrapper"
          initial={{ scale: 0.5, opacity: 0, rotateY: 180 }}
          animate={{ scale: 1, opacity: 1, rotateY: 0 }}
          transition={{ type: "spring", stiffness: 150, damping: 20, delay: 0.6 }}
        >
          <div
            className="hero-photo-glow"
            style={{ background: hero.gradient, boxShadow: `0 0 80px ${hero.shadowColor}` }}
          />
          <img
            className={`hero-photo ${imgLoaded ? "loaded" : ""}`}
            src={hero.imageUrl}
            alt={hero.name}
            onLoad={() => setImgLoaded(true)}
            onError={(e) => {
              const target = e.currentTarget;
              target.style.display = "none";
            }}
          />
        </motion.div>

        {showProfile && (
          <motion.div
            className="hero-profile-details"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="glass-card hero-bio-card">
              <div className="hero-section-label">
                <span className="section-icon">📖</span>
                <span>О персонаже</span>
              </div>
              <p className="hero-bio-text">{hero.bio}</p>
            </div>

            <motion.div
              className="glass-card hero-why-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="hero-section-label">
                <span className="section-icon">🎯</span>
                <span>Почему именно ты?</span>
              </div>
              <p className="hero-why-text">{hero.whyYou}</p>
            </motion.div>

            <motion.div
              className="hero-gift-note"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <p>🎁 Тебя ждёт подарок с твоим героем!</p>
            </motion.div>

          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
