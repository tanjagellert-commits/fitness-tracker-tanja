import { ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const UNITS = [
  {
    id: 'A',
    label: 'Einheit A',
    subtitle: 'Zuhause / Matte',
    icon: '🧘',
    desc: '15–20 Min · 7 Übungen',
  },
  {
    id: 'B',
    label: 'Einheit B',
    subtitle: 'Zug / ohne Matte',
    icon: '🚄',
    desc: '~6 Min · 4 Übungen',
  },
  {
    id: 'C',
    label: 'Laufen',
    subtitle: 'Garmin trackt Details',
    icon: '🏃',
    desc: 'Ab Schuhkauf · kurzes Log',
    comingSoon: true,
  },
];

export default function UnitSelect({ onSelect, onBack }) {
  return (
    <div className="flex flex-col h-screen bg-f-bg max-w-lg mx-auto">
      <header className="flex items-center gap-3 px-4 pt-12 pb-6">
        <button onClick={onBack} className="p-2 rounded-xl active:bg-f-card">
          <ChevronLeft className="w-6 h-6 text-f-text" />
        </button>
        <h2 className="text-f-text font-bold text-xl">Was machst du heute?</h2>
      </header>

      <div className="flex flex-col gap-4 px-5">
        {UNITS.map((unit, i) => (
          <motion.button
            key={unit.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            whileTap={!unit.comingSoon ? { scale: 0.97 } : {}}
            onClick={() => !unit.comingSoon && onSelect(unit.id)}
            className={`bg-f-card border rounded-3xl p-6 text-left relative overflow-hidden transition-colors
              ${unit.comingSoon
                ? 'border-f-border opacity-50 cursor-default'
                : 'border-f-border active:border-f-accent/50 cursor-pointer'
              }`}
          >
            <div className="text-4xl mb-3">{unit.icon}</div>
            <div className="text-f-text font-bold text-lg">{unit.label}</div>
            <div className="text-f-muted text-sm mt-0.5">{unit.subtitle}</div>
            <div className="text-f-dim text-xs mt-2">{unit.desc}</div>
            {unit.comingSoon && (
              <span className="absolute top-4 right-4 text-xs bg-f-bg border border-f-border
                               text-f-muted px-2.5 py-1 rounded-full">
                bald
              </span>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
