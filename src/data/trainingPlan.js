// dayOfWeek (0=So, 1=Mo, 2=Di, 3=Mi, 4=Do, 5=Fr, 6=Sa) → geplante Unit oder null (Ruhetag)
export const PLAN = {
  0: 'C',   // Sonntag:    Laufen (aktiv seit 19.06.2026)
  1: null,  // Montag:     Ruhetag
  2: 'B',   // Dienstag:   Einheit B (Zug/Office)
  3: null,  // Mittwoch:   Ruhetag (C ab ca. 24.07. – Woche 5 nach Lauf-Start)
  4: 'B',   // Donnerstag: Einheit B (Zug/Office)
  5: null,  // Freitag:    Ruhetag
  6: 'A',   // Samstag:    Einheit A (Zuhause)
};

export function getTodayUnit() {
  return PLAN[new Date().getDay()] ?? null;
}

export function isPlannedDay(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return PLAN[d.getDay()] !== null;
}
