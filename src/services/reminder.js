const REMINDER_TAG  = 'fitness-reminder';
const REMINDER_HOUR = 12;

export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  try {
    await navigator.serviceWorker.register('/sw.js');
  } catch (e) {
    console.warn('SW registration failed:', e);
  }
}

export async function scheduleReminder({ promptPermission = false } = {}) {
  if (!('serviceWorker' in navigator) || !('Notification' in window)) return;

  let permission = Notification.permission;
  if (permission !== 'granted') {
    if (!promptPermission) return;
    permission = await Notification.requestPermission();
  }
  if (permission !== 'granted') return;

  const target = new Date();
  target.setHours(REMINDER_HOUR, 0, 0, 0);
  if (target <= new Date()) return; // bereits vorbei

  const reg = await navigator.serviceWorker.ready;

  const existing = await reg.getNotifications({ tag: REMINDER_TAG });
  existing.forEach(n => n.close());

  if ('TimestampTrigger' in window) {
    await reg.showNotification('Fitness Tracker', {
      body: 'Zeit für dein Training 💪',
      icon: '/icon.svg',
      tag: REMINDER_TAG,
      showTrigger: new TimestampTrigger(target.getTime()),
    });
  } else {
    const delay = target - new Date();
    setTimeout(() => {
      new Notification('Fitness Tracker', {
        body: 'Zeit für dein Training 💪',
        icon: '/icon.svg',
        tag: REMINDER_TAG,
      });
    }, delay);
  }
}

export async function cancelReminder() {
  if (!('serviceWorker' in navigator)) return;
  try {
    const reg = await navigator.serviceWorker.ready;
    const existing = await reg.getNotifications({ tag: REMINDER_TAG });
    existing.forEach(n => n.close());
  } catch {}
}
