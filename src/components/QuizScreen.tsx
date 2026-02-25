import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback } from "react";
import ReactionGame from "./games/ReactionGame";
import MemoryGame from "./games/MemoryGame";
import BombGame from "./games/BombGame";
import DilemmaGame from "./games/DilemmaGame";

interface Props {
  onComplete: () => void;
}

type ChallengeType =
  | { kind: "reaction" }
  | { kind: "memory" }
  | { kind: "bomb" }
  | { kind: "dilemma" };

const CHALLENGES: ChallengeType[] = [
  { kind: "reaction" },
  { kind: "memory" },
  { kind: "bomb" },
  { kind: "dilemma" },
];

export default function QuizScreen({ onComplete }: Props) {
  const [step, setStep] = useState(0);

  const challenge = CHALLENGES[step];
  const progress = (step / CHALLENGES.length) * 100;

  const handleNext = useCallback(() => {
    if (step >= CHALLENGES.length - 1) {
      onComplete();
    } else {
      setStep((s) => s + 1);
    }
  }, [step, onComplete]);

  return (
    <motion.div
      className="screen quiz-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="quiz-content">
        <div className="progress-container">
          <div className="progress-bar">
            <motion.div
              className="progress-fill"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <span className="progress-text">
            {step + 1} / {CHALLENGES.length}
          </span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ x: 80, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -80, opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            {challenge.kind === "reaction" && (
              <ReactionGame onComplete={handleNext} />
            )}
            {challenge.kind === "memory" && (
              <MemoryGame onComplete={handleNext} />
            )}
            {challenge.kind === "bomb" && (
              <BombGame onComplete={handleNext} />
            )}
            {challenge.kind === "dilemma" && (
              <DilemmaGame onComplete={handleNext} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
