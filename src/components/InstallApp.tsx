import { useState, useSyncExternalStore } from 'react';
import { Download, Share, Smartphone } from 'lucide-react';
import { Modal } from './UI';
import { getInstallSnapshot, promptInstall, subscribeInstall } from '../pwa';
export function InstallApp() {
  const { installed, canPrompt } = useSyncExternalStore(subscribeInstall, getInstallSnapshot);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (installed) return null;
  async function install() {
    if (!canPrompt) { setOpen(true); return; }
    setBusy(true);
    const result = await promptInstall();
    setBusy(false);
    if (result === 'unavailable') setOpen(true);
  }
  return <>
    <button type="button" className="button secondary install-button" onClick={() => void install()} disabled={busy}><Download size={16}/>{busy ? 'Opening installer…' : 'Install ProductPulse'}</button>
    <Modal open={open} title="ProductPulse, on your home screen." onClose={() => setOpen(false)}>
      <div className="install-intro"><Smartphone size={24}/><p>Open your workspace like an app, right from your phone or desktop.</p></div>
      {ios ? <><h3>On iPhone or iPad</h3><ol className="install-steps"><li>Open this website in Safari.</li><li>Tap <strong>Share</strong> <Share size={15}/> in the browser menu.</li><li>Choose <strong>Add to Home Screen</strong>. If shown, keep <strong>Open as Web App</strong> enabled.</li><li>Tap <strong>Add</strong>. ProductPulse will open directly to your workspace.</li></ol></> : <><h3>On Android</h3><ol className="install-steps"><li>Open this website in Chrome.</li><li>Open the browser’s <strong>⋮ menu</strong>.</li><li>Choose <strong>Install app</strong> or <strong>Add to Home screen</strong>, then confirm.</li></ol><h3>On desktop</h3><p className="install-help">Use your browser’s install icon in the address bar or its app-install option in the menu. Availability depends on your browser.</p></>}
      <p className="install-help">If you opened this link inside WhatsApp, open it in your regular browser first. Once loaded, the demo can open offline. Saved demo data stays on this device.</p>
      <div className="form-actions"><button className="button dark" onClick={() => setOpen(false)}>Got it</button></div>
    </Modal>
  </>;
}
