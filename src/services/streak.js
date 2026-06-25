import { isPlannedDay } from '../data/trainingPlan';

const KEY = 'ft_streak';

function toStr(d) {
  return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')}`;
}

function todayStr() {
  return toStr(new Date());
}

function hadMissedDay(lastDate, today) {
  if (!lastDate) return false;
  const check = new Date(lastDate + 'T12:00:00');
  const end   = new Date(today   + 'T12:00:00');
  check.setDate(check.getDate() + 1);
  while (check < end) {
    if (isPlannedDay(toStr(check))) return true;
    check.setDate(check.getDate() + 1);
  }
  return false;
}

export function getStreak() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { count: 0, lastDate: null };
    return JSON.parse(raw);
  } catch {
    return { count: 0, lastDate: null };
  }
}

export function isTodayLogged() {
  return getStreak().lastDate === todayStr();
}

export function updateStreak(dateStr) {
  const current = getStreak();
  if (current.lastDate === dateStr) return current.count;
  const newCount = hadMissedDay(current.lastDate, dateStr) ? 1 : (current.count || 0) + 1;
  localStorage.setItem(KEY, JSON.stringify({ count: newCount, lastDate: dateStr }));
  return newCount;
}
