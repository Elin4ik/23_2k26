import { useState, useCallback, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import ParticleBackground from "./components/ParticleBackground";
import WelcomeScreen from "./components/WelcomeScreen";
import NameScreen from "./components/NameScreen";
import QuizScreen from "./components/QuizScreen";
import ProcessingScreen from "./components/ProcessingScreen";
import RevealScreen from "./components/RevealScreen";
import AdminPanel from "./components/AdminPanel";
import { heroesMap, Hero } from "./data/heroes";
import { registerUser } from "./api";

type Screen = "welcome" | "name" | "quiz" | "processing" | "reveal" | "admin";

const ADMIN_PASSWORD = "marvel2302";
const STORAGE_KEY = "marvel23_result";

interface SavedResult {
  userName: string;
  heroId: string;
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [userName, setUserName] = useState("");
  const [hero, setHero] = useState<Hero | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data: SavedResult = JSON.parse(saved);
        const heroData = heroesMap[data.heroId];
        if (heroData) {
          setUserName(data.userName);
          setHero(heroData);
          setScreen("reveal");
        }
      } catch {}
    }
  }, []);

  const handleStart = () => setScreen("name");

  const handleNameSubmit = async (name: string) => {
    setUserName(name);
    setError(null);

    try {
      const result = await registerUser(name);
      const heroData = heroesMap[result.hero];

      if (!heroData) {
        throw new Error("Неизвестный герой");
      }

      setHero(heroData);

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ userName: name, heroId: result.hero })
      );

      if (result.already_assigned) {
        setScreen("reveal");
      } else {
        setScreen("quiz");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Ошибка соединения с сервером";
      setError(message);
    }
  };

  const handleQuizComplete = () => {
    setScreen("processing");
  };

  const handleProcessingDone = useCallback(() => {
    setScreen("reveal");
  }, []);

  const handleRestart = () => {
    setScreen("welcome");
    setUserName("");
    setHero(null);
    setError(null);
  };

  const handleAdminClick = () => {
    const pwd = prompt("Введите пароль администратора:");
    if (pwd === ADMIN_PASSWORD) {
      setScreen("admin");
    } else if (pwd !== null) {
      alert("Неверный пароль");
    }
  };

  return (
    <div className="app-container">
      <ParticleBackground />

      <div className="app-content">
        <AnimatePresence mode="wait">
          {screen === "welcome" && (
            <WelcomeScreen key="welcome" onStart={handleStart} />
          )}

          {screen === "name" && (
            <NameScreen
              key="name"
              onSubmit={handleNameSubmit}
            />
          )}

          {screen === "quiz" && (
            <QuizScreen key="quiz" onComplete={handleQuizComplete} />
          )}

          {screen === "processing" && (
            <ProcessingScreen key="processing" onDone={handleProcessingDone} />
          )}

          {screen === "reveal" && hero && (
            <RevealScreen
              key="reveal"
              hero={hero}
              userName={userName}
              onRestart={handleRestart}
            />
          )}

          {screen === "admin" && (
            <AdminPanel
              key="admin"
              onBack={() => setScreen("welcome")}
            />
          )}
        </AnimatePresence>

        {screen === "welcome" && (
          <button
            className="admin-secret-btn"
            onClick={handleAdminClick}
            title="Админ-панель"
          >
            ⚙️
          </button>
        )}

        {error && (
          <div className="error-overlay">
            <div className="glass-card error-card">
              <p className="error-emoji">😔</p>
              <p className="error-text">{error}</p>
              <button className="btn-primary" onClick={() => {
                setError(null);
                setScreen("name");
              }}>
                Попробовать снова
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
