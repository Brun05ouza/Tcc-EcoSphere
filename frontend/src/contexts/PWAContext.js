import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Download, Share, PlusSquare, X, WifiOff, RefreshCw } from 'lucide-react';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

const PWAContext = createContext(null);
export const usePWA = () => useContext(PWAContext);
const standalone = () => window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

export function PWAProvider({ children }) {
  const [installed, setInstalled] = useState(standalone);
  const [prompt, setPrompt] = useState(null);
  const [showInstall, setShowInstall] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [installError, setInstallError] = useState('');
  const [offline, setOffline] = useState(!navigator.onLine);
  const [waitingWorker, setWaitingWorker] = useState(null);
  const dialog = useRef(null);
  const updateRequested = useRef(false);
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  useBodyScrollLock(showInstall);

  useEffect(() => {
    const onPrompt = event => { event.preventDefault(); setPrompt(event); };
    const onInstalled = () => { setInstalled(true); setPrompt(null); setShowInstall(false); };
    const onNetwork = () => setOffline(!navigator.onLine);
    const mode = window.matchMedia('(display-mode: standalone)');
    const onMode = () => setInstalled(standalone());
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    window.addEventListener('online', onNetwork);
    window.addEventListener('offline', onNetwork);
    mode.addEventListener('change', onMode);
    onNetwork();
    onMode();
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
      window.removeEventListener('online', onNetwork);
      window.removeEventListener('offline', onNetwork);
      mode.removeEventListener('change', onMode);
    };
  }, []);

  useEffect(() => {
    if (showInstall && dialog.current && !dialog.current.open) dialog.current.showModal();
  }, [showInstall]);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return undefined;
    const root = document.documentElement;
    let baseline = viewport.height;
    let width = viewport.width;
    const syncViewport = () => {
      const editing = document.activeElement?.matches('input:not([type="checkbox"]):not([type="radio"]), textarea, [contenteditable="true"]');
      if (Math.abs(viewport.width - width) > 80) { baseline = viewport.height; width = viewport.width; }
      if (!editing) baseline = Math.max(baseline, viewport.height);
      root.style.setProperty('--app-viewport-height', `${viewport.height}px`);
      root.style.setProperty('--app-viewport-top', `${viewport.offsetTop}px`);
      root.classList.toggle('app-keyboard-open', Boolean(editing && baseline - viewport.height > 150));
    };
    syncViewport();
    viewport.addEventListener('resize', syncViewport);
    viewport.addEventListener('scroll', syncViewport);
    document.addEventListener('focusin', syncViewport);
    document.addEventListener('focusout', syncViewport);
    return () => {
      viewport.removeEventListener('resize', syncViewport);
      viewport.removeEventListener('scroll', syncViewport);
      document.removeEventListener('focusin', syncViewport);
      document.removeEventListener('focusout', syncViewport);
      root.classList.remove('app-keyboard-open');
      root.style.removeProperty('--app-viewport-height');
      root.style.removeProperty('--app-viewport-top');
    };
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) return undefined;
    let disposed = false;
    let registration;
    let installingWorker;
    const onController = () => {
      if (updateRequested.current) window.location.reload();
    };
    const onState = () => {
      if (!disposed && installingWorker?.state === 'installed' && navigator.serviceWorker.controller) {
        setWaitingWorker(registration.waiting);
      }
    };
    const onUpdate = () => {
      installingWorker = registration.installing;
      installingWorker?.addEventListener('statechange', onState);
    };
    navigator.serviceWorker.addEventListener('controllerchange', onController);
    navigator.serviceWorker.register(`${process.env.PUBLIC_URL || ''}/service-worker.js`).then(value => {
      if (disposed) return;
      registration = value;
      if (registration.waiting) setWaitingWorker(registration.waiting);
      registration.addEventListener('updatefound', onUpdate);
    }).catch(error => console.warn('Não foi possível preparar o modo instalado:', error));
    return () => {
      disposed = true;
      navigator.serviceWorker.removeEventListener('controllerchange', onController);
      registration?.removeEventListener('updatefound', onUpdate);
      installingWorker?.removeEventListener('statechange', onState);
    };
  }, []);

  const install = async () => {
    if (!prompt || installing) return;
    setInstalling(true);
    setInstallError('');
    try {
      await prompt.prompt();
      const choice = await prompt.userChoice;
      setPrompt(null);
      if (choice.outcome === 'accepted') setShowInstall(false);
    } catch {
      setPrompt(null);
      setInstallError('Abra o menu do navegador para adicionar o EcoSphere à tela inicial.');
    } finally {
      setInstalling(false);
    }
  };

  return <PWAContext.Provider value={{ installed, openInstall: () => { setInstallError(''); setShowInstall(true); } }}>
    {children}
    {(offline || waitingWorker) && <div className="app-connection" role="status">
      {offline ? <><WifiOff size={15} /><span>Sem conexão. Dados novos precisam de internet.</span></> : <>
        <RefreshCw size={15} /><span>Uma nova versão está pronta.</span>
        <button onClick={() => { updateRequested.current = true; waitingWorker.postMessage({ type: 'SKIP_WAITING' }); }}>Atualizar</button>
      </>}
    </div>}
    {showInstall && createPortal(<dialog ref={dialog} className="app-dialog install-dialog" aria-labelledby="install-title" onClose={() => setShowInstall(false)} onClick={event => { if (event.target === event.currentTarget) dialog.current.close(); }}>
      <div className="app-dialog__body">
        <button className="app-icon-button app-dialog__close" aria-label="Fechar instalação" onClick={() => dialog.current.close()}><X size={21} /></button>
        <img className="install-dialog__icon" src={`${process.env.PUBLIC_URL || ''}/icons/app-192.png`} width="64" height="64" alt="" />
        <h2 id="install-title">EcoSphere sempre à mão</h2>
        <p>Adicione à tela inicial e abra em uma janela própria, como um app.</p>
        {prompt ? <button className="app-install-primary" disabled={installing} onClick={install}><Download size={19} />{installing ? 'Aguardando instalação…' : 'Instalar EcoSphere'}</button> : ios ? <ol className="install-steps">
          <li><Share size={21} /><span>No navegador, abra <strong>Compartilhar</strong>.</span></li>
          <li><PlusSquare size={21} /><span>Toque em <strong>Adicionar à Tela de Início</strong>.</span></li>
          <li><Download size={21} /><span>Confirme em <strong>Adicionar</strong>. Se aparecer “Abrir como app”, mantenha ativado.</span></li>
        </ol> : <div className="install-steps"><p>Abra o menu do navegador e procure <strong>Instalar aplicativo</strong> ou <strong>Adicionar à tela inicial</strong>.</p><p>Se a opção não aparecer, tente abrir este site no Chrome ou no Safari.</p></div>}
        {installError && <p role="alert">{installError}</p>}
        <p className="install-dialog__note">Você também pode continuar usando pelo navegador. Os serviços e os dados atualizados precisam de conexão.</p>
      </div>
    </dialog>, document.body)}
  </PWAContext.Provider>;
}

export function InstallAppButton({ className = '' }) {
  const { installed, openInstall } = usePWA();
  if (installed) return null;
  return <button type="button" className={`app-install-button ${className}`} onClick={openInstall}><Download size={19} aria-hidden="true" /><span>Instalar no celular</span></button>;
}
