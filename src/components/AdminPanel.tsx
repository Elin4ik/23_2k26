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
  const [manualName, setManualName] = useState("");
  const [manualHero, setManualHero] = useState("");

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

  const assignedHeroIds = status ? new Set(Object.values(status.assignments)) : new Set();
  const freeHeroes = Object.values(heroesMap).filter((h) => !assignedHeroIds.has(h.id));

  const handleManualAssign = async () => {
    const name = manualName.trim();
    if (!name || !manualHero) return;
    try {
      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignments: { [name.toLowerCase()]: manualHero } }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.detail);
      setManualName("");
      setManualHero("");
      fetchStatus();
    } catch (err) {
      alert(`Ошибка: ${err instanceof Error ? err.message : "Не удалось назначить"}`);
    }
  };

  const handleExport = async () => {
    try {
      const res = await fetch("/api/export");
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `marvel23-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Ошибка экспорта данных");
    }
  };

  const handleImport = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const parsed = JSON.parse(text);
        const assignments = parsed.assignments || parsed;
        if (typeof assignments !== "object") throw new Error("Неверный формат");
        if (!confirm(`Импортировать ${Object.keys(assignments).length} назначений?`)) return;
        const res = await fetch("/api/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ assignments }),
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.detail);
        alert(result.message);
        fetchStatus();
      } catch (err) {
        alert(`Ошибка импорта: ${err instanceof Error ? err.message : "Неверный файл"}`);
      }
    };
    input.click();
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

        {/* Manual assign */}
        {status && freeHeroes.length > 0 && (
          <div className="admin-manual glass-card">
            <h2 className="admin-subtitle">Вручную назначить героя</h2>
            <div className="manual-form">
              <input
                type="text"
                className="manual-input"
                placeholder="Имя участника"
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
              />
              <select
                className="manual-select"
                value={manualHero}
                onChange={(e) => setManualHero(e.target.value)}
              >
                <option value="">Выбрать героя...</option>
                {freeHeroes.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.icon} {h.name}
                  </option>
                ))}
              </select>
              <motion.button
                className="btn-primary manual-btn"
                onClick={handleManualAssign}
                disabled={!manualName.trim() || !manualHero}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Назначить
              </motion.button>
            </div>
          </div>
        )}

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
            className="btn-secondary"
            onClick={handleExport}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            📥 Экспорт данных
          </motion.button>
          <motion.button
            className="btn-secondary"
            onClick={handleImport}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            📤 Импорт данных
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


