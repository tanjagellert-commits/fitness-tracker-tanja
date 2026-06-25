import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { saveFitnessEntry } from '../services/googleDrive';
import { updateStreak } from '../services/streak';

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')}`;
}

export default function FinishScreen({ unit, exercises, runData, onSaved, onSessionExpired }) {
  const [energy, setEnergy]   = useState(7);
  const [note, setNote]       = useState('');
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState(null);

  const energyColor = energy >= 8 ? '#4CAF50' : energy >= 5 ? '#00BCD4' : '#FF9800';
  const energyPct   = ((energy - 1) / 9) * 100;

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    const timeout = setTimeout(() => {
      setSaving(false);
      setError('Zeitüberschreitung – bitte nochmal versuchen.');
      console.error('[FitnessTracker] Save timed out after 15s');
    }, 15000);
    try {
      const today = todayStr();
      console.log('[FitnessTracker] Saving entry:', today, unit, exercises);
      await saveFitnessEntry(today, unit, exercises, runData, energy, note);
      console.log('[FitnessTracker] Save successful');
      clearTimeout(timeout);
      updateStreak(today);
      onSaved();
    } catch (e) {
      clearTimeout(timeout);
      console.error('[FitnessTracker] Save error:', e);
      if (e.message === 'SESSION_EXPIRED') {
        onSessionExpired?.();
        return;
      }
      setError(e.message || 'Unbekannter Fehler beim Speichern.');
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-f-bg max-w-lg mx-auto">
      <div className="flex-1 px-5 flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-8"
        >
          <div className="text-6xl mb-3">🎉</div>
          <h2 className="text-f-text font-bold text-2xl">Super gemacht!</h2>
          <p className="text-f-muted text-sm mt-1">
            {unit === 'C' ? 'Lauf geloggt' : `Einheit ${unit} abgeschlossen`}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="bg-f-card border border-f-border rounded-3xl p-6"
        >
          {/* Energy slider */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-f-text font-semibold text-sm">Energie danach</span>
              <span className="font-bold text-lg tabular-nums" style={{ color: energyColor }}>
                {energy}/10
              </span>
            </div>
            <input
              type="range"
              min="1" max="10"
              value={energy}
              onChange={e => setEnergy(Number(e.target.value))}
              className="energy-slider w-full"
              style={{
                background: `linear-gradient(to right, ${energyColor} ${energyPct}%, #2A2A2A ${energyPct}%)`
              }}
            />
          </div>

          {/* Note */}
          <div>
            <label className="block text-f-text font-semibold text-sm mb-2">
              Notiz <span className="text-f-muted font-normal">(optional)</span>
            </label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Wie hat es sich angefühlt?"
              rows={3}
              className="w-full bg-f-bg border border-f-border rounded-2xl px-4 py-3
                         text-f-text placeholder:text-f-dim text-sm resize-none
                         focus:outline-none focus:border-f-accent/50 transition-colors"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm mt-3">{error}</p>
          )}
        </motion.div>
      </div>

      <div className="px-5 pb-10 safe-bottom">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-f-accent text-f-bg font-bold text-lg py-5 rounded-3xl
                     shadow-xl shadow-f-accent/25 disabled:opacity-60
                     flex items-center justify-center gap-2 transition-opacity"
        >
          {saving && <Loader2 className="w-5 h-5 animate-spin" />}
          {saving ? 'Speichern...' : 'Speichern'}
        </button>
      </div>
    </div>
  );
}
