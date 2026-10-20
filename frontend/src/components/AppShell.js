import React, { useEffect, useState } from 'react';
import Navbar from './Navbar';
import MobileNavigation from './MobileNavigation';
import Footer from './Footer';
import ChatBot from './ChatBot';

export default function AppShell({ children }) {
  const [desktop, setDesktop] = useState(() => window.matchMedia('(min-width: 768px)').matches);
  useEffect(() => {
    const media = window.matchMedia('(min-width: 768px)');
    const update = () => setDesktop(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  return <div className="app-shell flex flex-col min-h-screen">
    <a href="#main-content" className="app-skip-link">Ir para o conteúdo</a>
    {desktop ? <Navbar /> : <MobileNavigation />}
    <main id="main-content" className="app-content flex-1 bg-surface-50 min-h-screen">{children}</main>
    {desktop && <Footer />}
    <ChatBot />
  </div>;
}
