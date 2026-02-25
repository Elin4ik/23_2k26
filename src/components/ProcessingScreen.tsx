import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const heroEmojis = ["💚", "💜", "❤️", "🕷️", "🔮", "⚡", "🐺", "🌿", "🚀", "💎", "🖤", "🌟"];

const messages = [
  "Анализируем твои суперспособности...",
  "Сканируем мультивселенную...",
  "Ищем совпадения в базе героев...",
  "Подбираем идеального героя...",
  "Почти готово...",
];

interface Props {
  onDone: () => void;
}

export default function ProcessingScreen({ onDone }: Props) {
  const [messageIdx, setMessageIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIdx((prev) => {
        if (prev < messages.length - 1) return prev + 1;
        return prev;
      });
    }, 800);

    const timeout = setTimeout(() => {
      onDone();
    }, 4000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [onDone]);

  return (
    <motion.div
      className="screen processing-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="processing-content">
        {/* Orbiting emojis */}
        <div className="orbit-container">
          {heroEmojis.map((emoji, i) => (
            <motion.div
              key={i}
              className="orbit-item"
              style={{
                position: "absolute",
              }}
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 3 + i * 0.3,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              <span
                style={{
                  display: "block",
                  transform: `translateY(-${60 + (i % 3) * 25}px)`,
                  fontSize: "24px",
                }}
              >
                {emoji}
              </span>
            </motion.div>
          ))}

          <motion.div
            className="center-pulse"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
            }}
          >
            ⚡
          </motion.div>
        </div>

        {/* Loading message */}
        <motion.p
          key={messageIdx}
          className="processing-text"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {messages[messageIdx]}
        </motion.p>

        {/* Loading dots */}
        <div className="loading-dots">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="loading-dot"
              animate={{
                y: [0, -10, 0],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.15,
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}


