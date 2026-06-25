import { useEffect, useState } from 'react';
import { initGapi, initTokenClient, requestAccessToken, isTokenValid } from '../services/googleDrive';
import { Zap, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login({ onLoginSuccess }) {
  const [ready, setReady]     = useState(false);
  const [error, setError]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initGapi()
      .then(() => {
        if (isTokenValid()) {
          onLoginSuccess(false);
          return;
        }
        initTokenClient(
          () => onLoginSuccess(true),
          (e) => setError(`Login fehlgeschlagen: ${e.error || 'Unbekannter Fehler'}`)
        );
        setReady(true);
      })
      .catch((e) => setError(`Google API Fehler: ${e.message}`))
      .finally(() => setLoading(false));
  }, [onLoginSuccess]);

  return (
    <div className="min-h-screen bg-f-bg flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center mb-10"
      >
        <div className="w-24 h-24 bg-f-card border border-f-border rounded-3xl
                        flex items-center justify-center mb-6 shadow-xl">
          <Zap className="w-11 h-11 text-f-accent" />
        </div>
        <h1 className="text-3xl font-bold text-f-text tracking-tight">Fitness Tracker</h1>
        <p className="text-f-muted mt-2 text-center text-sm leading-relaxed">
          Life of Tanja · Bewegung &amp; Gesundheit
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="bg-f-card border border-f-border rounded-3xl p-6 w-full max-w-sm shadow-xl"
      >
        {error && (
          <div className="bg-red-900/30 border border-red-700/40 rounded-2xl p-3 mb-4 text-red-300 text-sm">
            {error}
          </div>
        )}
        {loading && (
          <div className="flex items-center justify-center gap-2 text-f-muted py-2 mb-4">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Initialisiere...</span>
          </div>
        )}

        <button
          onClick={requestAccessToken}
          disabled={!ready}
          className="w-full flex items-center justify-center gap-3 bg-f-accent text-f-bg
                     rounded-2xl py-4 text-base font-semibold
                     disabled:opacity-40 disabled:cursor-not-allowed
                     active:scale-95 transition-transform shadow-lg shadow-f-accent/20"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#0D0D0D" fillOpacity=".9"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#0D0D0D" fillOpacity=".8"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#0D0D0D" fillOpacity=".7"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#0D0D0D" fillOpacity=".6"/>
          </svg>
          Mit Google anmelden
        </button>

        <p className="text-f-muted text-xs text-center mt-4">
          Einträge werden in deinem Google Drive gespeichert
        </p>
      </motion.div>
    </div>
  );
}
