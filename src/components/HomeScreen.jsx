import { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { getStreak, isTodayLogged } from '../services/streak';
import { getTodayUnit } from '../data/trainingPlan';

const UNIT_LABELS = {
  A: { icon: '🧘', label: 'Einheit A', sub: 'Zuhause · ~18 Min' },
  B: { icon: '🏢', label: 'Einheit B', sub: 'Office · ~6 Min' },
  C: { icon: '🏃', label: 'Laufen',    sub: 'Walk-Run Einstieg' },
};

export default function HomeScreen({ onStart, onSettings }) {
  const [streak, setStreak]     = useState(0);
  const [todayDone, setTodayDone] = useState(false);
  const todayUnit = getTodayUnit();
  const unitInfo  = todayUnit ? UNIT_LABELS[todayUnit] : null;

  useEffect(() => {
    const s = getStreak();
    setStreak(s.count);
    setTodayDone(isTodayLogged());
  }, []);

  return (
    <div className="flex flex-col h-screen bg-f-bg max-w-lg mx-auto">
      <header className="flex items-center justify-between px-5 pt-14 pb-4">
        <h1 className="text-f-text font-bold text-xl">Fitness</h1>
        <button onClick={onSettings} className="p-2 rounded-xl active:bg-f-card">
          <Settings className="w-5 h-5 text-f-muted" />
        </button>
      </header>

      {/* Streak card */}
      <div className="mx-5 mt-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-f-card border border-f-border rounded-3xl p-8 text-center"
        >
          <div className="text-7xl font-bold text-f-text mb-2 tabular-nums">
            {streak}
          </div>
          <div className="flex items-center justify-center gap-1.5 text-f-muted text-sm">
            <span className="text-lg">🔥</span>
            <span>Tage in Folge</span>
          </div>
        </motion.div>
      </div>

      {/* Today plan + status */}
      <div className="mx-5 mt-4 space-y-2">
        {unitInfo && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="rounded-2xl px-4 py-3 bg-f-card border border-f-border flex items-center gap-3"
          >
            <span className="text-2xl">{unitInfo.icon}</span>
            <div>
              <div className="text-f-text text-sm font-semibold">{unitInfo.label}</div>
              <div className="text-f-muted text-xs">{unitInfo.sub}</div>
            </div>
            <span className="ml-auto text-xs text-f-muted">heute geplant</span>
          </motion.div>
        )}
        {!unitInfo && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="rounded-2xl px-4 py-3 bg-f-card border border-f-border text-center text-f-muted text-sm"
          >
            😴 Ruhetag – kein Training geplant
          </motion.div>
        )}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`rounded-2xl px-4 py-3 text-sm font-medium text-center border
            ${todayDone
              ? 'bg-f-success/10 border-f-success/25 text-f-success'
              : 'bg-f-accent/8 border-f-accent/20 text-f-accent'
            }`}
        >
          {todayDone ? '✅ Heute erledigt – gut gemacht!' : 'Noch nicht trainiert heute'}
        </motion.div>
      </div>

      <div className="flex-1" />

      {/* CTA */}
      <div className="mx-5 pb-10 safe-bottom">
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={onStart}
          whileTap={{ scale: 0.97 }}
          className="w-full bg-f-accent text-f-bg font-bold text-lg py-5 rounded-3xl
                     shadow-xl shadow-f-accent/25 active:bg-f-accent-dk"
        >
          {todayDone ? 'Nochmal trainieren' : 'Einheit starten'}
        </motion.button>
      </div>
    </div>
  );
}
