import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { heroesMap } from "../data/heroes";

interface Assignments {
  [name: string]: string;
}

interface Status {
  total: number;
  assigned: number;
  remaining: number;
  assignments: Assignments;
}

export default function AdminPanel({ onBack }: { onBack: () => void }) {
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/status");
      const data = await res.json();
      setStatus(data);
    } catch {
      console.error("Ошибка загрузки");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleReset = async () => {
    if (!confirm("⚠️ Сбросить ВСЕ назначения? Это действие нельзя отменить!")) return;
    await fetch("/api/reset", { method: "POST" });
    fetchStatus();
  };

  return (
    <motion.div
      className="screen admin-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="admin-content">
        <div className="admin-header">
          <motion.button
            className="btn-back"
            onClick={onBack}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            ← Назад
          </motion.button>
          <h1 className="admin-title">🎛️ Админ-панель</h1>
        </div>

        {/* Stats */}
        {status && (
          <div className="admin-stats">
            <div className="stat-card stat-total">
              <span className="stat-number">{status.total}</span>
              <span className="stat-label">Всего героев</span>
            </div>
            <div className="stat-card stat-assigned">
              <span className="stat-number">{status.assigned}</span>
              <span className="stat-label">Назначено</span>
            </div>
            <div className="stat-card stat-remaining">
              <span className="stat-number">{status.remaining}</span>
              <span className="stat-label">Свободно</span>
            </div>
          </div>
        )}

        {/* Assignments Table */}
        <div className="admin-table-wrapper glass-card">
          <h2 className="admin-subtitle">Назначения героев</h2>

          {loading ? (
            <p className="admin-loading">Загрузка...</p>
          ) : status && Object.keys(status.assignments).length > 0 ? (
            <div className="admin-table">
              <div className="table-header">
                <span>№</span>
                <span>Имя</span>
                <span>Герой</span>
                <span>Иконка</span>
              </div>
              {Object.entries(status.assignments).map(([name, heroId], idx) => {
                const hero = heroesMap[heroId];
                return (
                  <motion.div
                    key={name}
                    className="table-row"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <span className="row-num">{idx + 1}</span>
                    <span className="row-name">{name}</span>
                    <span className="row-hero">{hero?.name ?? heroId}</span>
                    <span className="row-icon">{hero?.icon ?? "?"}</span>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <p className="admin-empty">Пока никто не прошёл тест 🙈</p>
          )}
        </div>

        {/* Available heroes */}
        {status && status.remaining > 0 && (
          <div className="admin-available glass-card">
            <h2 className="admin-subtitle">Свободные герои</h2>
            <div className="available-grid">
              {Object.values(heroesMap)
                .filter(
                  (h) =>
                    !Object.values(status.assignments).includes(h.id)
                )
                .map((hero) => (
                  <div key={hero.id} className="available-chip">
                    <span>{hero.icon}</span>
                    <span>{hero.name}</span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="admin-actions">
          <motion.button
            className="btn-refresh"
            onClick={fetchStatus}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🔄 Обновить
          </motion.button>
          <motion.button
            className="btn-danger"
            onClick={handleReset}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🗑️ Сбросить всё
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}


