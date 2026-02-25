import { motion } from "framer-motion";

interface Props {
  onStart: () => void;
}

export default function WelcomeScreen({ onStart }: Props) {
  return (
    <motion.div
      className="screen welcome-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.6 }}
    >
      <div className="welcome-content">
        <motion.div
          className="welcome-badge"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
        >
          🎖️
        </motion.div>

        <motion.h1
          className="welcome-title"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          С Днём Защитника
          <br />
          <span className="highlight">Отечества!</span>
        </motion.h1>

        <motion.div
          className="welcome-stars"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          ⭐ ⭐ ⭐
        </motion.div>

        <motion.p
          className="welcome-subtitle"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.0, duration: 0.6 }}
        >
          Дорогие мальчики! Мы приготовили для вас
          <br />
          особенный сюрприз...
        </motion.p>

        <motion.p
          className="welcome-description"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.3, duration: 0.6 }}
        >
          Каждый мужчина — супергерой! 🦸‍♂️
          <br />
          Пройди тест и узнай, какой герой Marvel
          <br />
          скрывается в тебе!
        </motion.p>

        <motion.button
          className="btn-primary btn-glow"
          onClick={onStart}
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.6, duration: 0.5 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Начать! 🚀
        </motion.button>
      </div>
    </motion.div>
  );
}


