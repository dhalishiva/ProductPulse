interface InstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}
let pendingPrompt: InstallPromptEvent | null = null;
const standalone = window.matchMedia('(display-mode: standalone)');
let snapshot = { installed: standalone.matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone), canPrompt: false };
const listeners = new Set<() => void>();
const publish = () => { snapshot = { ...snapshot, canPrompt: Boolean(pendingPrompt) }; listeners.forEach(listener => listener()); };
// Register before React renders so a prompt event is never missed during navigation.
window.addEventListener('beforeinstallprompt', event => { event.preventDefault(); pendingPrompt = event as InstallPromptEvent; publish(); });
window.addEventListener('appinstalled', () => { pendingPrompt = null; snapshot.installed = true; publish(); });
standalone.addEventListener('change', event => { snapshot.installed = event.matches; publish(); });
export const subscribeInstall = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };
export const getInstallSnapshot = () => snapshot;
export async function promptInstall() {
  const prompt = pendingPrompt;
  if (!prompt) return 'unavailable';
  pendingPrompt = null; publish();
  try { await prompt.prompt(); return (await prompt.userChoice).outcome; } catch { return 'unavailable'; }
}
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' }).catch(error => console.warn('ProductPulse offline mode is unavailable.', error));
  });
}
