import { useState, useCallback } from "react";
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

export default function App() {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [userName, setUserName] = useState("");
  const [hero, setHero] = useState<Hero | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleStart = () => setScreen("name");

  const handleNameSubmit = async (name: string) => {
    setUserName(name);
    setError(null);

    try {
      // Register user on backend immediately to reserve a hero
      const result = await registerUser(name);
      const heroData = heroesMap[result.hero];

      if (!heroData) {
        throw new Error("Неизвестный герой");
      }

      setHero(heroData);

      // If user was already assigned, skip quiz and show result directly
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

        {/* Admin button (hidden in corner) */}
        {screen === "welcome" && (
          <button
            className="admin-secret-btn"
            onClick={() => setScreen("admin")}
            title="Админ-панель"
          >
            ⚙️
          </button>
        )}

        {/* Error overlay */}
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

