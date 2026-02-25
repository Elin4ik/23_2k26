import { motion } from "framer-motion";
import { useState } from "react";

interface Props {
  onSubmit: (name: string) => void;
}

export default function NameScreen({ onSubmit }: Props) {
  const [name, setName] = useState("");
  const [shake, setShake] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) {
      setShake(true);
      setTimeout(() => setShake(false), 600);
      return;
    }
    onSubmit(name.trim());
  };

  return (
    <motion.div
      className="screen name-screen"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.5 }}
    >
      <div className="name-content">
        <motion.div
          className="name-emoji"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
        >
          🦸‍♂️
        </motion.div>

        <motion.h2
          className="screen-title"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Укажи своё настоящее имя
        </motion.h2>

        <motion.form
          onSubmit={handleSubmit}
          className={`name-form ${shake ? "shake" : ""}`}
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="input-wrapper">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Имя и фамилия..."
              className="name-input"
              autoFocus
              maxLength={30}
            />
            <div className="input-glow" />
          </div>

          <motion.button
            type="submit"
            className="btn-primary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={name.trim().length < 2}
          >
            Далее ➜
          </motion.button>
        </motion.form>

        <motion.p
          className="name-hint"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          Важно указать настоящее имя — от этого зависит твой герой!
        </motion.p>
      </div>
    </motion.div>
  );
}


