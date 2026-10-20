import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, CloudSun, ScanLine, Sparkles, Menu, X, UserRound, BookOpen, Gift, History, Gamepad2, CircleHelp, LogOut, ChevronRight, House } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { InstallAppButton } from '../contexts/PWAContext';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

const destinations = [
  { to: '/dashboard', label: 'Início', Icon: LayoutDashboard },
  { to: '/monitoramento', label: 'Clima', Icon: CloudSun },
  { to: '/classificar-residuos', label: 'Classificar', Icon: ScanLine, primary: true },
  { to: '/gamificacao', label: 'Pontos', Icon: Sparkles },
];
const more = [
  { to: '/perfil', label: 'Meu perfil', Icon: UserRound },
  { to: '/educacao', label: 'Aprender', Icon: BookOpen },
  { to: '/recompensas', label: 'Recompensas', Icon: Gift },
  { to: '/historico', label: 'Meu histórico', Icon: History },
  { to: '/eco-catcher', label: 'Eco Catcher', Icon: Gamepad2 },
  { to: '/guia', label: 'Guia sustentável', Icon: CircleHelp },
  { to: '/', label: 'Sobre o EcoSphere', Icon: House },
];
const titles = { '/dashboard': 'Seu impacto', '/monitoramento': 'Ambiente e clima', '/classificar-residuos': 'Descarte inteligente', '/gamificacao': 'Sua jornada', '/educacao': 'Aprender', '/perfil': 'Meu perfil', '/historico': 'Meu histórico', '/recompensas': 'Recompensas', '/eco-catcher': 'Eco Catcher', '/guia': 'Guia sustentável' };

export default function MobileNavigation() {
  const { pathname } = useLocation();
  const { user, logout } = useUser();
  const [open, setOpen] = useState(false);
  const menu = useRef(null);
  const trigger = useRef(null);
  useBodyScrollLock(open);
  useEffect(() => {
    menu.current?.close();
    setOpen(false);
  }, [pathname]);
  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)');
    const closeOnDesktop = () => { if (!media.matches) menu.current?.close(); };
    media.addEventListener('change', closeOnDesktop);
    return () => media.removeEventListener('change', closeOnDesktop);
  }, []);
  const openMenu = () => { menu.current.showModal(); setOpen(true); };
  const closeMenu = () => menu.current.close();
  const moreActive = !destinations.some(item => item.to === pathname);

  return <>
    <header className="mobile-topbar">
      <Link to="/dashboard" className="mobile-topbar__brand" aria-label="EcoSphere, início">
        <img src={`${process.env.PUBLIC_URL || ''}/favicon.svg`} width="35" height="35" alt="" />
        <span><strong>EcoSphere</strong><small>{titles[pathname] || 'Pequenas ações, grande impacto'}</small></span>
      </Link>
      <Link to="/perfil" className="app-icon-button mobile-topbar__profile" aria-label="Meu perfil"><UserRound size={21} /></Link>
    </header>
    <nav className="mobile-tabbar" aria-label="Navegação do aplicativo">
      {destinations.map(({ to, label, Icon, primary }) => <NavLink key={to} to={to} className={({ isActive }) => `mobile-tabbar__item${isActive ? ' is-active' : ''}${primary ? ' mobile-tabbar__scan' : ''}`}>
        <span className="mobile-tabbar__icon"><Icon size={22} strokeWidth={1.8} aria-hidden="true" /></span><span>{label}</span>
      </NavLink>)}
      <button ref={trigger} onClick={openMenu} className={`mobile-tabbar__item${open || moreActive ? ' is-active' : ''}`} aria-haspopup="dialog" aria-expanded={open} aria-controls="mobile-more-menu"><span className="mobile-tabbar__icon"><Menu size={22} strokeWidth={1.8} aria-hidden="true" /></span><span>Mais</span></button>
    </nav>
    <dialog ref={menu} id="mobile-more-menu" className="app-dialog mobile-menu" aria-labelledby="mobile-menu-title" onClose={() => { setOpen(false); trigger.current?.focus({ preventScroll: true }); }} onClick={event => { if (event.target === event.currentTarget) closeMenu(); }}>
      <div className="app-dialog__body">
        <div className="mobile-menu__heading"><div><p>SEU ECOSPHERE</p><h2 id="mobile-menu-title">Mais possibilidades</h2></div><button className="app-icon-button" aria-label="Fechar menu" onClick={closeMenu}><X size={22} /></button></div>
        <Link to="/perfil" onClick={closeMenu} className="mobile-menu__account"><span className="mobile-menu__avatar"><UserRound size={23} /></span><span><strong>{user?.name || 'Sua conta'}</strong><small>{Number(user?.ecoPoints || 0).toLocaleString('pt-BR')} EcoPoints</small></span><ChevronRight size={18} /></Link>
        <nav aria-label="Todas as áreas"><ul>{more.map(({ to, label, Icon }) => <li key={to}><NavLink to={to} end onClick={closeMenu}><Icon size={20} strokeWidth={1.7} /><span>{label}</span><ChevronRight size={15} /></NavLink></li>)}</ul></nav>
        <InstallAppButton />
        <button className="mobile-menu__logout" onClick={() => { closeMenu(); logout(); }}><LogOut size={19} />Sair da conta</button>
      </div>
    </dialog>
  </>;
}
