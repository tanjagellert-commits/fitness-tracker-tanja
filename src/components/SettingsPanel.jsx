import { useState, useEffect } from 'react';
import { ChevronLeft, Bell, BellOff, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

const REMINDER_KEY = 'ft_reminders';

export default function SettingsPanel({ onBack, onSignOut }) {
  const [remindersOn, setRemindersOn]         = useState(false);
  const [permissionStatus, setPermissionStatus] = useState('default');

  useEffect(() => {
    setRemindersOn(localStorage.getItem(REMINDER_KEY) === 'true');
    if ('Notification' in window) setPermissionStatus(Notification.permission);
  }, []);

  const handleToggle = async () => {
    if (!remindersOn && 'Notification' in window && Notification.permission !== 'granted') {
      const perm = await Notification.requestPermission();
      setPermissionStatus(perm);
      if (perm !== 'granted') return;
    }
    const next = !remindersOn;
    setRemindersOn(next);
    localStorage.setItem(REMINDER_KEY, String(next));
  };

  return (
    <div className="flex flex-col h-screen bg-f-bg max-w-lg mx-auto">
      <header className="flex items-center gap-3 px-4 pt-12 pb-6">
        <button onClick={onBack} className="p-2 rounded-xl active:bg-f-card">
          <ChevronLeft className="w-6 h-6 text-f-text" />
        </button>
        <h2 className="text-f-text font-bold text-xl">Einstellungen</h2>
      </header>

      <div className="px-5 flex flex-col gap-3">
        {/* Reminders */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-f-card border border-f-border rounded-2xl p-5"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {remindersOn
                ? <Bell className="w-5 h-5 text-f-accent" />
                : <BellOff className="w-5 h-5 text-f-muted" />
              }
              <div>
                <div className="text-f-text font-semibold text-sm">Erinnerungen</div>
                <div className="text-f-muted text-xs mt-0.5">Di+Fr morgens · Mi+Do mittags</div>
              </div>
            </div>
            {/* Toggle switch */}
            <button
              onClick={handleToggle}
              className={`relative w-12 h-6 rounded-full transition-colors duration-200
                ${remindersOn ? 'bg-f-accent' : 'bg-f-dim'}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md
                               transition-transform duration-200
                               ${remindersOn ? 'translate-x-6' : 'translate-x-0.5'}`}
              />
            </button>
          </div>

          {permissionStatus === 'denied' && (
            <p className="text-amber-400 text-xs mt-3 leading-relaxed">
              Benachrichtigungen sind blockiert. Bitte in den Browser-Einstellungen freigeben.
            </p>
          )}
          <p className="text-f-dim text-xs mt-3 leading-relaxed">
            Erinnerung erscheint wenn du heute noch nicht trainiert hast.
          </p>
        </motion.div>

        {/* Sign out */}
        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          onClick={onSignOut}
          className="bg-f-card border border-f-border rounded-2xl p-5 flex items-center gap-3
                     text-left active:border-red-500/40 transition-colors"
        >
          <LogOut className="w-5 h-5 text-f-muted" />
          <span className="text-f-text font-semibold text-sm">Abmelden</span>
        </motion.button>
      </div>
    </div>
  );
}
