import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Sparkles, User, X, ArrowRight } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { AppIcon } from './ui/AppIcon';
import EcoGlobeLogo from './ui/EcoGlobeLogo';
import { InstallAppButton } from '../contexts/PWAContext';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifications] = useState(3);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showEcoPointsModal, setShowEcoPointsModal] = useState(false);
  const { user, logout } = useUser();
  const location = useLocation();
  const navigate = useNavigate();

  useBodyScrollLock(showEcoPointsModal || menuOpen);

  useEffect(() => {
    setMenuOpen(false);
    setShowNotifications(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!showEcoPointsModal && !menuOpen) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowEcoPointsModal(false);
        setMenuOpen(false);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [showEcoPointsModal, menuOpen]);

  const ecoTips = [
    { iconName: 'leaf', text: 'Já plantou uma árvore hoje?', action: 'Plante uma muda!' },
    { iconName: 'recycle', text: 'Separou o lixo reciclável?', action: 'Recicle agora!' },
    { iconName: 'droplets', text: 'Economizou água hoje?', action: 'Feche a torneira!' },
    { iconName: 'bike', text: 'Que tal usar a bike hoje?', action: 'Pedale mais!' },
    { iconName: 'lightbulb', text: 'Apagou as luzes desnecessárias?', action: 'Economize energia!' },
    { iconName: 'globe', text: 'Fez sua parte pelo planeta?', action: 'Continue assim!' },
  ];

  const getPointsHistory = () => {
    try {
      const history = JSON.parse(localStorage.getItem('ecoPointsHistory') || '[]');
      return history.slice(0, 5).map((item) => ({
        action: item.action,
        points: item.points,
        time: new Date(item.timestamp).toLocaleString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        }),
        iconName: item.points > 0 ? 'sparkles' : 'gift',
      }));
    } catch {
      return [];
    }
  };

  const pointsHistory = getPointsHistory();
  const todayTip = ecoTips[Math.floor(Math.random() * ecoTips.length)];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/classificar-residuos', label: 'IA Resíduos' },
    { path: '/monitoramento', label: 'Monitoramento' },
    { path: '/gamificacao', label: 'EcoPoints', opensEcoPointsModal: true },
    { path: '/educacao', label: 'Educação' },
  ];

  const menuItems = [
    ...navItems,
    { path: '/perfil', label: 'Perfil' },
    { path: '/historico', label: 'Histórico' },
  ];

  const isNavActive = (item) => {
    if (item.opensEcoPointsModal) {
      return location.pathname === item.path || location.pathname === '/recompensas';
    }
    return location.pathname === item.path;
  };

  const goTo = (item) => {
    setMenuOpen(false);
    if (item.opensEcoPointsModal) {
      setShowEcoPointsModal(true);
      return;
    }
    navigate(item.path);
  };

  return (
    <>
      <header className="site-navbar sticky top-0 z-50 pt-3 md:pt-4 px-3 md:px-6 pointer-events-none">
        <motion.div
          initial={{ y: -16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="pointer-events-auto relative mx-auto max-w-6xl flex items-center justify-between gap-3 rounded-full bg-white/95 backdrop-blur-md shadow-[0_10px_40px_rgba(15,23,42,0.08)] border border-stone-200/80 px-3 sm:px-4 md:px-5 py-2 md:py-2.5"
        >
          <Link to="/" className="flex items-center gap-2.5 shrink-0 pl-1">
            <div className="w-10 h-10 rounded-full bg-eco-50 border border-eco-100 flex items-center justify-center overflow-hidden">
              <EcoGlobeLogo
                size={28}
                style={{ filter: 'invert(40%) sepia(70%) saturate(500%) hue-rotate(110deg)' }}
              />
            </div>
            <div className="leading-none hidden xs:block sm:block">
              <span className="block text-[15px] md:text-base font-bold tracking-wide text-eco-700 uppercase">
                EcoSphere
              </span>
              <span className="hidden md:block text-[9px] uppercase tracking-[0.16em] text-stone-400 mt-0.5">
                Plataforma verde
              </span>
            </div>
          </Link>

          <nav
            className="hidden lg:flex items-center gap-1 absolute left-1/2 -translate-x-1/2"
            aria-label="Menu principal"
          >
            {navItems.map((item) => {
              const active = isNavActive(item);
              const className = `px-3 py-2 text-[13px] font-medium whitespace-nowrap transition-colors ${
                active ? 'text-eco-700' : 'text-stone-600 hover:text-eco-700'
              }`;
              if (item.opensEcoPointsModal) {
                return (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() => setShowEcoPointsModal(true)}
                    className={className}
                  >
                    {item.label}
                  </button>
                );
              }
              return (
                <Link key={item.path} to={item.path} className={className}>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <div className="relative hidden sm:block">
              <button
                type="button"
                onClick={() => setShowNotifications((v) => !v)}
                className="relative p-2 rounded-full text-stone-500 hover:bg-stone-50 hover:text-stone-800 transition-colors"
                aria-label="Notificações"
              >
                <Bell size={17} strokeWidth={1.75} />
                {notifications > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-amber-500" />
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-stone-100 z-50 overflow-hidden"
                  >
                    <div className="p-4 border-b border-stone-100 flex items-center justify-between">
                      <h3 className="font-semibold text-stone-800">Notificações</h3>
                      <button
                        type="button"
                        onClick={() => setShowNotifications(false)}
                        className="text-stone-400 hover:text-stone-600"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <div className="p-4">
                      <div className="bg-eco-50/80 p-4 rounded-xl mb-3 border border-eco-100">
                        <div className="flex items-center gap-2 mb-2">
                          <AppIcon name={todayTip.iconName} size={16} className="text-eco-700" />
                          <span className="font-semibold text-eco-800 text-sm">Dica ecológica</span>
                        </div>
                        <p className="text-sm text-stone-700 mb-1">{todayTip.text}</p>
                        <div className="text-xs text-eco-700 font-medium">{todayTip.action}</div>
                      </div>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {pointsHistory.length > 0 ? (
                          pointsHistory.map((item, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-2.5 bg-stone-50 rounded-xl"
                            >
                              <div>
                                <div className="text-xs font-medium text-stone-800">{item.action}</div>
                                <div className="text-[11px] text-stone-500">{item.time}</div>
                              </div>
                              <div
                                className={`text-sm font-bold ${
                                  item.points > 0 ? 'text-eco-700' : 'text-red-500'
                                }`}
                              >
                                {item.points > 0 ? '+' : ''}
                                {item.points}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center text-stone-500 text-sm py-4">
                            Nenhuma atividade recente
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              type="button"
              onClick={() => setShowEcoPointsModal(true)}
              className="hidden sm:inline-flex items-center gap-2 rounded-full bg-eco-600 hover:bg-eco-700 text-white text-sm font-semibold pl-3.5 pr-3 py-2 md:pl-4 md:pr-3.5 md:py-2.5 shadow-sm shadow-eco-600/25 transition-colors"
            >
              <span className="hidden md:inline">EcoPoints</span>
              <span className="md:hidden tabular-nums">{user?.ecoPoints || 0}</span>
              <ArrowRight size={16} />
            </button>

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="inline-flex items-center gap-2 rounded-full border border-stone-200 text-stone-700 text-sm font-medium px-3 py-2 md:px-3.5 hover:bg-stone-50 transition-colors"
              aria-label="Abrir conta e menu"
            >
              <User size={15} />
              <span>Conta</span>
            </button>
          </div>
        </motion.div>
      </header>

      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                key="conta-drawer"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[180] flex justify-end"
              >
                <button
                  type="button"
                  aria-label="Fechar menu"
                  className="absolute inset-0 bg-stone-900/30 backdrop-blur-[2px]"
                  onClick={() => setMenuOpen(false)}
                />

                <motion.aside
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', stiffness: 320, damping: 32 }}
                  className="relative h-full w-full max-w-[22rem] sm:max-w-[24rem] bg-white shadow-2xl border-l border-stone-100 flex flex-col rounded-l-3xl overflow-hidden"
                  role="dialog"
                  aria-modal="true"
                  aria-label="Menu da conta"
                >
                  <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-eco-50 border border-eco-100 flex items-center justify-center shrink-0">
                        <EcoGlobeLogo
                          size={22}
                          style={{ filter: 'invert(40%) sepia(70%) saturate(500%) hue-rotate(110deg)' }}
                        />
                      </div>
                      <span className="font-bold text-eco-700 tracking-wide uppercase text-sm truncate">
                        Conta
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMenuOpen(false)}
                      className="w-9 h-9 rounded-full border border-stone-200 flex items-center justify-center text-stone-600 hover:bg-stone-50"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto px-5 py-4">
                    <div className="rounded-2xl border border-stone-100 bg-stone-50 p-4 mb-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-11 h-11 rounded-full bg-white border border-stone-100 overflow-hidden flex items-center justify-center shrink-0">
                          {user?.avatar_url || user?.picture || user?.avatar ? (
                            <img
                              src={user.avatar_url || user.picture || user.avatar}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User size={18} className="text-stone-500" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-stone-800 truncate">{user?.name || 'Usuário'}</p>
                          <p className="text-sm text-stone-500 truncate">{user?.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between rounded-xl bg-white px-3.5 py-2.5 border border-stone-100">
                        <span className="text-sm text-stone-500 inline-flex items-center gap-1.5">
                          <Sparkles size={14} className="text-amber-500" />
                          EcoPoints
                        </span>
                        <span className="font-bold text-stone-800">{user?.ecoPoints || 0}</span>
                      </div>
                    </div>

                    <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-2 px-1">
                      Navegação
                    </p>
                    <ul className="space-y-0.5 mb-6">
                      {menuItems.map((item) => (
                        <li key={item.path}>
                          <button
                            type="button"
                            onClick={() => goTo(item)}
                            className={`w-full text-left px-3 py-3 rounded-xl text-[15px] font-medium transition-colors ${
                              isNavActive(item)
                                ? 'bg-eco-50 text-eco-700'
                                : 'text-stone-700 hover:bg-stone-50'
                            }`}
                          >
                            {item.label}
                          </button>
                        </li>
                      ))}
                    </ul>

                    <InstallAppButton />
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        handleLogout();
                      }}
                      className="w-full text-left px-3 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                      Sair da conta
                    </button>
                  </div>
                </motion.aside>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}

      <EcoPointsModal
        open={showEcoPointsModal}
        onClose={() => setShowEcoPointsModal(false)}
        user={user}
        onNavigateGamificacao={() => {
          setShowEcoPointsModal(false);
          navigate('/gamificacao');
        }}
        onNavigateRecompensas={() => {
          setShowEcoPointsModal(false);
          navigate('/recompensas');
        }}
      />
    </>
  );
};

const EcoPointsModal = ({ open, onClose, user, onNavigateGamificacao, onNavigateRecompensas }) => {
  const Icon = ({ name, className = 'w-5 h-5' }) => (
    <img
      src={require(`../assets/icons/${name}.svg`)}
      alt={name}
      className={className}
      style={{ filter: 'invert(40%) sepia(93%) saturate(500%) hue-rotate(100deg)' }}
    />
  );

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-stone-950/40 backdrop-blur-sm px-4 py-8"
          onClick={onClose}
          role="presentation"
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-100 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="ecopoints-modal-title"
          >
            <div className="bg-gradient-to-br from-eco-600 to-teal-600 p-5 text-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={18} className="text-amber-200" />
                    <h2 id="ecopoints-modal-title" className="text-xl font-bold">
                      EcoPoints
                    </h2>
                  </div>
                  <p className="text-sm text-white/80">
                    Acompanhe seus pontos ou use o saldo na área de recompensas.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors shrink-0"
                  aria-label="Fechar modal EcoPoints"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="mt-4 flex items-center gap-2 rounded-2xl bg-white/15 px-4 py-3">
                <span className="text-sm text-white/80">Saldo atual</span>
                <span className="ml-auto text-2xl font-black">{user?.ecoPoints || 0}</span>
              </div>
            </div>

            <div className="p-4 space-y-3">
              <button
                type="button"
                onClick={onNavigateGamificacao}
                className="w-full text-left p-4 rounded-2xl border border-stone-100 hover:border-eco-200 hover:bg-eco-50 transition-all flex items-center gap-4"
              >
                <div className="w-11 h-11 rounded-xl bg-eco-50 flex items-center justify-center shrink-0">
                  <Icon name="ecopoints" className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-stone-800">Ver meus EcoPoints</div>
                  <div className="text-sm text-stone-500">Ranking, conquistas e evolução do perfil.</div>
                </div>
              </button>

              <button
                type="button"
                onClick={onNavigateRecompensas}
                className="w-full text-left p-4 rounded-2xl border border-stone-100 hover:border-amber-200 hover:bg-amber-50 transition-all flex items-center gap-4"
              >
                <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                  <Icon name="recompensas" className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-stone-800">Usar recompensas</div>
                  <div className="text-sm text-stone-500">Troque pontos quando quiser acessar benefícios.</div>
                </div>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default Navbar;
