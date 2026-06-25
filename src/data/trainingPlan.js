// dayOfWeek (0=So, 1=Mo, 2=Di, 3=Mi, 4=Do, 5=Fr, 6=Sa) → geplante Unit oder null (Ruhetag)
// Unit C (Laufen) ist vorbereitet – aktivieren nach Schuhkauf (06.06.2026)
export const PLAN = {
  0: null, // Sonntag:   Laufen (C) – TODO: auf 'C' setzen nach Schuhkauf
  1: null, // Montag:    Ruhetag
  2: 'B',  // Dienstag:  Einheit B (Office)
  3: null, // Mittwoch:  Ruhetag (C ab Woche 5 nach Lauf-Start)
  4: 'B',  // Donnerstag: Einheit B (Office)
  5: null, // Freitag:   Ruhetag
  6: 'A',  // Samstag:   Einheit A (Zuhause)
};

export function getTodayUnit() {
  return PLAN[new Date().getDay()] ?? null;
}

export function isPlannedDay(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return PLAN[d.getDay()] !== null;
}
