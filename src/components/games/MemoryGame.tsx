import { motion } from "framer-motion";
import { useState, useEffect, useCallback, useRef } from "react";
import { playMemoryFlip, playMemoryMatch, playCorrect } from "../../sounds";

interface Props {
  onComplete: () => void;
}

interface Card {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const EMOJIS = ["⚡", "🔥", "💎", "🛡️", "🕸️", "🌟", "🔨", "🧲"];
const NUM_PAIRS = 4;

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function MemoryGame({ onComplete }: Props) {
  const [phase, setPhase] = useState<"intro" | "playing" | "result">("intro");
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matched, setMatched] = useState(0);
  const [canSkip, setCanSkip] = useState(false);
  const lockRef = useRef(false);

  const initGame = useCallback(() => {
    const selected = shuffleArray(EMOJIS).slice(0, NUM_PAIRS);
    const pairs = selected.flatMap((emoji, i) => [
      { id: i * 2, emoji, isFlipped: false, isMatched: false },
      { id: i * 2 + 1, emoji, isFlipped: false, isMatched: false },
    ]);
    setCards(shuffleArray(pairs));
    setFlippedIds([]);
    setMoves(0);
    setMatched(0);
    setCanSkip(false);
    lockRef.current = false;
    setPhase("playing");
    setTimeout(() => setCanSkip(true), 5000);
  }, []);

  const handleCardClick = useCallback(
    (id: number) => {
      if (lockRef.current) return;

      const card = cards.find((c) => c.id === id);
      if (!card || card.isFlipped || card.isMatched) return;

      const newFlipped = [...flippedIds, id];
      setFlippedIds(newFlipped);

      playMemoryFlip();
      setCards((prev) =>
        prev.map((c) => (c.id === id ? { ...c, isFlipped: true } : c))
      );

      if (newFlipped.length === 2) {
        lockRef.current = true;
        setMoves((m) => m + 1);

        const [firstId, secondId] = newFlipped;
        const first = cards.find((c) => c.id === firstId)!;
        const second = cards.find((c) => c.id === secondId)!;

        if (first.emoji === second.emoji) {
          playMemoryMatch();
          setTimeout(() => {
            setCards((prev) =>
              prev.map((c) =>
                c.id === firstId || c.id === secondId
                  ? { ...c, isMatched: true }
                  : c
              )
            );
            setMatched((m) => m + 1);
            setFlippedIds([]);
            lockRef.current = false;
          }, 400);
        } else {
          setTimeout(() => {
            setCards((prev) =>
              prev.map((c) =>
                c.id === firstId || c.id === secondId
                  ? { ...c, isFlipped: false }
                  : c
              )
            );
            setFlippedIds([]);
            lockRef.current = false;
          }, 800);
        }
      }
    },
    [cards, flippedIds]
  );

  useEffect(() => {
    if (matched === NUM_PAIRS && phase === "playing") {
      setTimeout(() => setPhase("result"), 500);
    }
  }, [matched, phase]);

  const getResultMessage = (m: number) => {
    if (m <= 5) return { text: "Феноменальная память! 🧠", emoji: "🏆" };
    if (m <= 8) return { text: "Отличная память! 💫", emoji: "🥇" };
    if (m <= 12) return { text: "Хорошо соображаешь! 👍", emoji: "🥈" };
    return { text: "Справился! 💪", emoji: "🥉" };
  };

  return (
    <motion.div
      className="game-container memory-game"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
    >
      {phase === "intro" && (
        <div className="game-intro">
          <div className="game-icon-big">🧠</div>
          <h2 className="game-title">Проверь память!</h2>
          <p className="game-desc">
            Найди все {NUM_PAIRS} пары карточек.
            <br />
            Запоминай расположение!
          </p>
          <motion.button
            className="btn-primary"
            onClick={initGame}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Поехали! 🎴
          </motion.button>
        </div>
      )}

      {phase === "playing" && (
        <div className="memory-board">
          <div className="memory-header">
            <span className="memory-moves">Ходы: {moves}</span>
            <span className="memory-pairs">
              Пары: {matched}/{NUM_PAIRS}
            </span>
          </div>
          <div className="memory-grid memory-grid-4">
            {cards.map((card) => (
              <motion.div
                key={card.id}
                className={`memory-card ${card.isFlipped || card.isMatched ? "flipped" : ""} ${card.isMatched ? "matched" : ""}`}
                onClick={() => handleCardClick(card.id)}
                whileHover={
                  !card.isFlipped && !card.isMatched ? { scale: 1.05 } : {}
                }
                whileTap={
                  !card.isFlipped && !card.isMatched ? { scale: 0.95 } : {}
                }
              >
                <div className="memory-card-inner">
                  <div className="memory-card-front">❓</div>
                  <div className="memory-card-back">{card.emoji}</div>
                </div>
              </motion.div>
            ))}
          </div>
          {(moves >= 10 || canSkip) && (
            <motion.button
              className="btn-skip"
              onClick={onComplete}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              whileHover={{ scale: 1.05 }}
            >
              Пропустить →
            </motion.button>
          )}
        </div>
      )}

      {phase === "result" && (
        <motion.div
          className="game-result"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className="result-emoji">{getResultMessage(moves).emoji}</div>
          <h2 className="result-time">За {moves} ходов!</h2>
          <p className="result-text">{getResultMessage(moves).text}</p>
          <motion.button
            className="btn-primary"
            onClick={onComplete}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Дальше ➜
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
}
