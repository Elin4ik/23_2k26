import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface Dilemma {
  id: number;
  optionA: { text: string; emoji: string };
  optionB: { text: string; emoji: string };
}

const DILEMMAS: Dilemma[] = [
  {
    id: 1,
    optionA: { text: "Всегда знать, когда тебе врут", emoji: "🔍" },
    optionB: { text: "Уметь убедить кого угодно в чём угодно", emoji: "🗣️" },
  },
  {
    id: 2,
    optionA: { text: "Быть самым сильным на планете", emoji: "💪" },
    optionB: { text: "Быть самым умным на планете", emoji: "🧠" },
  },
  {
    id: 3,
    optionA: { text: "Драка 1 на 1 с медведем (у тебя меч)", emoji: "🐻" },
    optionB: { text: "Драка с 50 курицами (без оружия)", emoji: "🐔" },
  },
  {
    id: 4,
    optionA: { text: "Навсегда забыть пароли от всего", emoji: "🔑" },
    optionB: { text: "Навсегда потерять историю браузера", emoji: "🌐" },
  },
  {
    id: 5,
    optionA: { text: "Жить в мире Minecraft", emoji: "⛏️" },
    optionB: { text: "Жить в мире GTA", emoji: "🚗" },
  },
];

interface Props {
  onComplete: () => void;
}

export default function DilemmaGame({ onComplete }: Props) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<"A" | "B" | null>(null);
  const [results, setResults] = useState<string[]>([]);

  const dilemma = DILEMMAS[current];

  const handleSelect = (choice: "A" | "B") => {
    if (selected) return;
    setSelected(choice);
    setResults((r) => [...r, choice]);

    setTimeout(() => {
      if (current < DILEMMAS.length - 1) {
        setCurrent((c) => c + 1);
        setSelected(null);
      } else {
        onComplete();
      }
    }, 700);
  };

  return (
    <motion.div
      className="game-container dilemma-game"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="dilemma-header">
        <h2 className="game-title-small">Что бы ты выбрал? 🤔</h2>
        <span className="dilemma-counter">{current + 1} / {DILEMMAS.length}</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={dilemma.id}
          className="dilemma-cards"
          initial={{ x: 80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -80, opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          <motion.button
            className={`dilemma-option dilemma-a ${selected === "A" ? "chosen" : ""} ${selected === "B" ? "not-chosen" : ""}`}
            onClick={() => handleSelect("A")}
            whileHover={!selected ? { scale: 1.03, y: -4 } : {}}
            whileTap={!selected ? { scale: 0.97 } : {}}
          >
            <span className="dilemma-emoji">{dilemma.optionA.emoji}</span>
            <span className="dilemma-text">{dilemma.optionA.text}</span>
          </motion.button>

          <div className="dilemma-vs">
            <span>VS</span>
          </div>

          <motion.button
            className={`dilemma-option dilemma-b ${selected === "B" ? "chosen" : ""} ${selected === "A" ? "not-chosen" : ""}`}
            onClick={() => handleSelect("B")}
            whileHover={!selected ? { scale: 1.03, y: -4 } : {}}
            whileTap={!selected ? { scale: 0.97 } : {}}
          >
            <span className="dilemma-emoji">{dilemma.optionB.emoji}</span>
            <span className="dilemma-text">{dilemma.optionB.text}</span>
          </motion.button>
        </motion.div>
      </AnimatePresence>

      {/* Progress dots */}
      <div className="dilemma-dots">
        {DILEMMAS.map((_, i) => (
          <div
            key={i}
            className={`dilemma-dot ${i < current ? "done" : ""} ${i === current ? "active" : ""}`}
          />
        ))}
      </div>
    </motion.div>
  );
}

