import { motion } from "framer-motion";
import { useState, useRef, useCallback, useEffect } from "react";
import { playReactionGo, playReactionHit } from "../../sounds";

interface Props {
  onComplete: () => void;
}

type Phase = "intro" | "waiting" | "ready" | "result";

export default function ReactionGame({ onComplete }: Props) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [reactionTime, setReactionTime] = useState(0);
  const [tooEarly, setTooEarly] = useState(false);
  const readyTimeRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const startGame = useCallback(() => {
    setPhase("waiting");
    setTooEarly(false);

    // Random delay 1.5-4 seconds
    const delay = 1500 + Math.random() * 2500;
    timerRef.current = setTimeout(() => {
      readyTimeRef.current = Date.now();
      playReactionGo();
      setPhase("ready");
    }, delay);
  }, []);

  const handleClick = useCallback(() => {
    if (phase === "waiting") {
      // Clicked too early!
      clearTimeout(timerRef.current);
      setTooEarly(true);
      setPhase("intro");
    } else if (phase === "ready") {
      const time = Date.now() - readyTimeRef.current;
      setReactionTime(time);
      playReactionHit();
      setPhase("result");
    }
  }, [phase]);

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  const getResultMessage = (ms: number) => {
    if (ms < 200) return { text: "Молниеносно! ⚡", emoji: "🏆" };
    if (ms < 300) return { text: "Отличный рефлекс! 🔥", emoji: "🥇" };
    if (ms < 400) return { text: "Хорошая реакция! 💪", emoji: "🥈" };
    return { text: "Неплохо, солдат! 👍", emoji: "🥉" };
  };

  return (
    <motion.div
      className="game-container reaction-game"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
    >
      {phase === "intro" && (
        <div className="game-intro">
          <div className="game-icon-big">⚡</div>
          <h2 className="game-title">Тест на реакцию</h2>
          <p className="game-desc">
            Экран станет <span className="text-green">зелёным</span> — жми как
            можно быстрее!
          </p>
          {tooEarly && (
            <motion.p
              className="game-warning"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
            >
              ⏳ Рано! Подожди зелёный сигнал!
            </motion.p>
          )}
          <motion.button
            className="btn-primary"
            onClick={startGame}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Готов! 🎯
          </motion.button>
        </div>
      )}

      {phase === "waiting" && (
        <motion.div
          className="reaction-zone reaction-waiting"
          onClick={handleClick}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="reaction-circle waiting">
            <span className="reaction-text-big">⏳</span>
            <p className="reaction-hint">Жди зелёный...</p>
          </div>
        </motion.div>
      )}

      {phase === "ready" && (
        <motion.div
          className="reaction-zone reaction-go"
          onClick={handleClick}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 15 }}
        >
          <div className="reaction-circle go">
            <span className="reaction-text-big">👆</span>
            <p className="reaction-hint-go">ЖМИИ!</p>
          </div>
        </motion.div>
      )}

      {phase === "result" && (
        <motion.div
          className="game-result"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className="result-emoji">{getResultMessage(reactionTime).emoji}</div>
          <h2 className="result-time">{reactionTime} мс</h2>
          <p className="result-text">{getResultMessage(reactionTime).text}</p>
          <motion.button
            className="btn-primary"
            onClick={onComplete}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            Дальше ➜
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
}


