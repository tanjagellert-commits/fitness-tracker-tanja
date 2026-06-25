import { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ExternalLink, Play, Pause } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { EXERCISES } from '../data/exercises';

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const CIRCUMFERENCE = 2 * Math.PI * 56;

export default function ExerciseFlow({ unit, onDone, onBack }) {
  const exercises = EXERCISES[unit];
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft]     = useState(exercises[0].duration);
  const [running, setRunning]       = useState(false);
  const [done, setDone]             = useState([]);
  const [direction, setDirection]   = useState(1);

  const timerStartRef = useRef(null);
  const timerBaseRef  = useRef(0);

  const current = exercises[currentIdx];

  useEffect(() => {
    setTimeLeft(current.duration);
    setRunning(false);
    timerStartRef.current = null;
    timerBaseRef.current  = 0;
  }, [currentIdx, current.duration]);

  // Real-time timer: survives screen-off + unlock correctly
  useEffect(() => {
    if (!running) return;
    timerStartRef.current = Date.now();
    const interval = setInterval(() => {
      const elapsed = timerBaseRef.current + Math.floor((Date.now() - timerStartRef.current) / 1000);
      setTimeLeft(Math.max(0, current.duration - elapsed));
    }, 200);
    return () => {
      clearInterval(interval);
      if (timerStartRef.current) {
        timerBaseRef.current += Math.floor((Date.now() - timerStartRef.current) / 1000);
        timerStartRef.current = null;
      }
    };
  }, [running, current.duration]);

  // Wake Lock: keep screen on during exercise
  useEffect(() => {
    if (!('wakeLock' in navigator)) return;
    let lock = null;
    navigator.wakeLock.request('screen').then(l => { lock = l; }).catch(() => {});
    return () => { if (lock) lock.release(); };
  }, []);

  const handleNext = useCallback(() => {
    const newDone = [...done, current.id];
    setDone(newDone);
    setDirection(1);
    if (currentIdx + 1 >= exercises.length) {
      onDone(newDone);
    } else {
      setCurrentIdx(i => i + 1);
    }
  }, [done, current.id, currentIdx, exercises.length, onDone]);

  const pct   = timeLeft / current.duration;
  const dash  = CIRCUMFERENCE * (1 - pct);
  const color = pct > 0.5 ? '#00BCD4' : pct > 0.25 ? '#FF9800' : '#f44336';
  const isLast = currentIdx + 1 >= exercises.length;

  return (
    <div className="flex flex-col h-screen bg-f-bg max-w-lg mx-auto">
      {/* Header + progress */}
      <div className="px-4 pt-12 pb-4 shrink-0">
        <div className="flex items-center gap-3 mb-5">
          <button onClick={onBack} className="p-2 rounded-xl active:bg-f-card">
            <ChevronLeft className="w-6 h-6 text-f-text" />
          </button>
          <span className="text-f-muted text-sm font-medium">
            Einheit {unit} · {currentIdx + 1}/{exercises.length}
          </span>
        </div>
        <div className="h-1.5 bg-f-card rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-f-accent rounded-full"
            animate={{ width: `${(currentIdx / exercises.length) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      {/* Exercise card */}
      <div className="flex-1 px-5 flex flex-col justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIdx}
            initial={{ opacity: 0, x: direction * 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -60 }}
            transition={{ duration: 0.22 }}
            className="bg-f-card border border-f-border rounded-3xl p-7"
          >
            <h2 className="text-f-text font-bold text-2xl mb-1">{current.name}</h2>
            <p className="text-f-muted text-sm mb-7">{current.note}</p>

            {/* Timer circle */}
            <div className="flex justify-center mb-7">
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 -rotate-90" viewBox="0 0 128 128">
                  <circle cx="64" cy="64" r="56" fill="none" stroke="#2A2A2A" strokeWidth="8" />
                  <circle
                    cx="64" cy="64" r="56"
                    fill="none"
                    stroke={color}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={CIRCUMFERENCE}
                    strokeDashoffset={dash}
                    style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s' }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-f-text font-bold text-2xl tabular-nums">
                    {formatTime(timeLeft)}
                  </span>
                </div>
              </div>
            </div>

            {/* Timer toggle */}
            <div className="flex justify-center mb-2">
              <button
                onClick={() => setRunning(r => !r)}
                className="flex items-center gap-2 bg-f-card-hi border border-f-border
                           rounded-2xl px-6 py-3 text-f-text text-sm font-medium active:scale-95 transition-transform"
              >
                {running
                  ? <><Pause className="w-4 h-4" /> Pause</>
                  : <><Play className="w-4 h-4" /> Start</>
                }
              </button>
            </div>

            {/* Video link */}
            {current.video && (
              <div className="flex justify-center mt-4">
                <a
                  href={current.video}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-f-accent text-sm py-1 active:opacity-70"
                >
                  <ExternalLink className="w-4 h-4" />
                  Video ansehen
                </a>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Next button */}
      <div className="px-5 pb-10 pt-4 safe-bottom">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleNext}
          className="w-full bg-f-accent text-f-bg font-bold text-lg py-5 rounded-3xl
                     shadow-xl shadow-f-accent/25"
        >
          {isLast ? '🎉 Fertig!' : 'Weiter →'}
        </motion.button>
      </div>
    </div>
  );
}
