import { motion } from "framer-motion";
import { useState, useEffect, useCallback, useRef } from "react";
import { playWireShow, playWireClick, playCorrect, playBoom, playTick } from "../../sounds";

interface Props {
  onComplete: () => void;
}

const WIRE_COLORS = [
  { color: "#e23636", glow: "rgba(226,54,54,0.5)" },
  { color: "#518cca", glow: "rgba(81,140,202,0.5)" },
  { color: "#4CAF50", glow: "rgba(76,175,80,0.5)" },
  { color: "#f0b323", glow: "rgba(240,179,35,0.5)" },
  { color: "#9C27B0", glow: "rgba(156,39,176,0.5)" },
];

type Phase = "intro" | "showing" | "input" | "correct" | "boom" | "result";

const MAX_ROUNDS = 6;
const TIME_PER_WIRE = 3;

export default function BombGame({ onComplete }: Props) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerInput, setPlayerInput] = useState<number[]>([]);
  const [round, setRound] = useState(0);
  const [showIdx, setShowIdx] = useState(-1);
  const [activeWire, setActiveWire] = useState(-1);
  const [score, setScore] = useState(0);
  const [canSkip, setCanSkip] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const skipTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const tickRef = useRef<ReturnType<typeof setInterval>>();

  const startGame = useCallback(() => {
    const first = [
      Math.floor(Math.random() * 5),
      Math.floor(Math.random() * 5),
    ];
    setSequence(first);
    setRound(1);
    setScore(0);
    setPlayerInput([]);
    setCanSkip(false);
    setPhase("showing");
    skipTimerRef.current = setTimeout(() => setCanSkip(true), 15000);
  }, []);

  // Show sequence with sound
  useEffect(() => {
    if (phase !== "showing") return;

    let i = 0;
    setShowIdx(-1);
    const showSpeed = Math.max(350, 600 - round * 40);
    const gapSpeed = Math.max(200, 300 - round * 20);

    const showNext = () => {
      if (i < sequence.length) {
        setShowIdx(sequence[i]);
        playWireShow(sequence[i]);
        timerRef.current = setTimeout(() => {
          setShowIdx(-1);
          i++;
          timerRef.current = setTimeout(showNext, gapSpeed);
        }, showSpeed);
      } else {
        const totalTime = sequence.length * TIME_PER_WIRE;
        setTimeLeft(totalTime);
        setPhase("input");
        setPlayerInput([]);
      }
    };

    timerRef.current = setTimeout(showNext, 400);
    return () => clearTimeout(timerRef.current);
  }, [phase, sequence, round]);

  // Countdown timer during input
  useEffect(() => {
    if (phase !== "input") {
      clearInterval(tickRef.current);
      return;
    }

    tickRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(tickRef.current);
          playBoom();
          setPhase("boom");
          setTimeout(() => setPhase("result"), 1500);
          return 0;
        }
        if (t <= 4) playTick();
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(tickRef.current);
  }, [phase]);

  const handleWireClick = useCallback(
    (wireIdx: number) => {
      if (phase !== "input") return;

      playWireClick(wireIdx);
      setActiveWire(wireIdx);
      setTimeout(() => setActiveWire(-1), 150);

      const newInput = [...playerInput, wireIdx];
      setPlayerInput(newInput);

      const step = newInput.length - 1;

      if (wireIdx !== sequence[step]) {
        clearInterval(tickRef.current);
        playBoom();
        setPhase("boom");
        setTimeout(() => setPhase("result"), 1500);
        return;
      }

      if (newInput.length === sequence.length) {
        clearInterval(tickRef.current);
        setScore((s) => s + 1);
        playCorrect();

        if (round >= MAX_ROUNDS) {
          setPhase("correct");
          setTimeout(() => setPhase("result"), 1200);
        } else {
          setPhase("correct");
          setTimeout(() => {
            const next = [...sequence, Math.floor(Math.random() * 5)];
            setSequence(next);
            setRound((r) => r + 1);
            setPhase("showing");
          }, 900);
        }
      }
    },
    [phase, playerInput, sequence, round]
  );

  useEffect(() => {
    return () => {
      clearTimeout(timerRef.current);
      clearTimeout(skipTimerRef.current);
      clearInterval(tickRef.current);
    };
  }, []);

  const getResultMessage = (s: number) => {
    if (s >= 6) return { text: "Легенда! Бомба обезврежена! 🧨", emoji: "🏆" };
    if (s >= 4) return { text: "Сапёр-профессионал! 🔥", emoji: "🥇" };
    if (s >= 2) return { text: "Неплохо, есть потенциал! 💪", emoji: "🥈" };
    return { text: "Бомба рванула! 💥", emoji: "💣" };
  };

  return (
    <motion.div
      className="game-container bomb-game"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
    >
      {phase === "intro" && (
        <div className="game-intro">
          <div className="game-icon-big">💣</div>
          <h2 className="game-title">Разминируй бомбу!</h2>
          <p className="game-desc">
            Запоминай последовательность проводов
            <br />и повтори в точном порядке!
            <br />
            <span style={{ color: "var(--accent-red-light)", fontWeight: 600 }}>
              С каждым раундом сложнее и быстрее!
            </span>
          </p>
          <motion.button
            className="btn-primary"
            onClick={startGame}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Приступить! 🔧
          </motion.button>
        </div>
      )}

      {(phase === "showing" ||
        phase === "input" ||
        phase === "correct" ||
        phase === "boom") && (
        <div className="bomb-board">
          <div className="bomb-header">
            <span className="bomb-round">
              Раунд {round}/{MAX_ROUNDS}
            </span>
            {phase === "input" && (
              <span className={`bomb-timer-count ${timeLeft <= 3 ? "danger" : ""}`}>
                ⏱ {timeLeft}с
              </span>
            )}
            <span className="bomb-status">
              {phase === "showing" && "👀 Запоминай..."}
              {phase === "input" && "👆 Повтори!"}
              {phase === "correct" && "✅ Верно!"}
              {phase === "boom" && "💥 БУМ!"}
            </span>
          </div>

          <div className="bomb-visual">
            <motion.div
              className={`bomb-body ${phase === "boom" ? "exploded" : ""}`}
              animate={
                phase === "boom"
                  ? { scale: [1, 1.3, 0.8], rotate: [0, 5, -5, 0] }
                  : phase === "correct"
                    ? { scale: [1, 1.05, 1] }
                    : {}
              }
            >
              <span className="bomb-emoji">
                {phase === "boom" ? "💥" : "💣"}
              </span>
              <div className="bomb-timer-display">
                {phase === "showing" && `${sequence.length} проводов`}
                {phase === "input" &&
                  `${playerInput.length}/${sequence.length}`}
                {phase === "correct" && "✓"}
                {phase === "boom" && "✗"}
              </div>
            </motion.div>
          </div>

          <div className="bomb-wires bomb-wires-5">
            {WIRE_COLORS.map((wire, idx) => (
              <motion.button
                key={idx}
                className={`bomb-wire ${showIdx === idx ? "flash" : ""} ${activeWire === idx ? "active" : ""}`}
                style={{
                  backgroundColor: wire.color,
                  boxShadow:
                    showIdx === idx || activeWire === idx
                      ? `0 0 20px ${wire.glow}, 0 0 40px ${wire.glow}`
                      : "none",
                }}
                onClick={() => handleWireClick(idx)}
                disabled={phase !== "input"}
                whileHover={phase === "input" ? { scale: 1.08, y: -3 } : {}}
                whileTap={phase === "input" ? { scale: 0.92 } : {}}
                animate={
                  showIdx === idx
                    ? { scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }
                    : { scale: 1, opacity: phase === "input" ? 1 : 0.4 }
                }
              />
            ))}
          </div>

          <div className="bomb-progress">
            {Array.from({ length: MAX_ROUNDS }).map((_, i) => (
              <div
                key={i}
                className={`bomb-dot ${i < score ? "done" : ""} ${i === score && phase === "correct" ? "current" : ""}`}
              />
            ))}
          </div>

          {canSkip && (
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
          <div className="result-emoji">{getResultMessage(score).emoji}</div>
          <h2 className="result-time">
            {score}/{MAX_ROUNDS} раундов
          </h2>
          <p className="result-text">{getResultMessage(score).text}</p>
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
