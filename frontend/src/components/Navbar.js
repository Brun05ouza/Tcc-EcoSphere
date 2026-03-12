import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell, Sparkles, User, ChevronDown, Menu, X, Shield } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { AppIcon } from './ui/AppIcon';
import EcoGlobeLogo from './ui/EcoGlobeLogo';

const HERO_SCROLL_THRESHOLD = 420;

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications] = useState(3);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isHeroVisible, setIsHeroVisible] = useState(false);
  const profileRef = React.useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const { user, isAdmin } = useUser();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => {
      const onHome = location.pathname === '/';
      setIsHeroVisible(onHome && window.scrollY < HERO_SCROLL_THRESHOLD);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [location.pathname]);

  const ecoTips = [
    { iconName: 'leaf', text: 'Já plantou uma árvore hoje?', action: 'Plante uma muda!' },
    { iconName: 'recycle', text: 'Separou o lixo reciclável?', action: 'Recicle agora!' },
    { iconName: 'droplets', text: 'Economizou água hoje?', action: 'Feche a torneira!' },
    { iconName: 'bike', text: 'Que tal usar a bike hoje?', action: 'Pedale mais!' },
    { iconName: 'lightbulb', text: 'Apagou as luzes desnecessárias?', action: 'Economize energia!' },
    { iconName: 'globe', text: 'Fez sua parte pelo planeta?', action: 'Continue assim!' }
  ];

  const getPointsHistory = () => {
    try {
      const history = JSON.parse(localStorage.getItem('ecoPointsHistory') || '[]');
      return history.slice(0, 5).map(item => ({
        action: item.action,
        points: item.points,
        time: new Date(item.timestamp).toLocaleString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        }),
        iconName: item.points > 0 ? 'sparkles' : 'gift'
      }));
    } catch {
      return [];
    }
  };

  const pointsHistory = getPointsHistory();
  const todayTip = ecoTips[Math.floor(Math.random() * ecoTips.length)];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { path: '/classificar-residuos', label: 'IA Resíduos', icon: 'IA' },
    { path: '/monitoramento', label: 'Monitoramento', icon: 'monitoramento' },
    { path: '/historico', label: 'Histórico', icon: 'ecopoints' },
    { path: '/gamificacao', label: 'EcoPoints', icon: 'ecopoints' },
    { path: '/recompensas', label: 'Recompensas', icon: 'recompensas' },
    { path: '/educacao', label: 'Educação', icon: 'educacao' }
  ];

  const Icon = ({ name, className = "w-5 h-5", active = false }) => {
    const iconStyle = active ? { filter: 'invert(48%) sepia(79%) saturate(2476%) hue-rotate(86deg) brightness(118%) contrast(119%)' } : { filter: 'invert(40%) sepia(5%) saturate(500%) hue-rotate(180deg)' };
    return (
      <img 
        src={require(`../assets/icons/${name}.svg`)} 
        alt={name} 
        className={className}
        style={iconStyle}
      />
    );
  };

  const navBg = 'bg-white/90 backdrop-blur-lg border-b border-stone-200/60 shadow-sm';

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`sticky top-0 z-50 transition-all duration-300 ${navBg}`}
    >
      <div className="relative flex items-center h-16 md:h-[72px] py-2 w-full px-6 md:px-10">
        {/* Logo: esquerda */}
        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
          <EcoGlobeLogo
            size={48}
            style={{ filter: 'invert(40%) sepia(93%) saturate(500%) hue-rotate(100deg)' }}
          />
          <span className={`text-xl font-bold font-display transition-colors duration-300 bg-gradient-to-r from-eco-700 via-teal-600 to-eco-700 bg-clip-text text-transparent`}>
            EcoSphere
          </span>
        </Link>

          {/* Nav: absolutamente centralizado no header */}
          <nav className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center gap-2" aria-label="Menu principal">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  location.pathname === item.path
                    ? 'bg-eco-50 text-eco-700'
                    : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                }`}
              >
                <Icon name={item.icon} className="w-4 h-4 shrink-0" active={location.pathname === item.path} />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Área do usuário: notificações, EcoPoints, perfil e menu mobile */}
          <div className="flex items-center gap-3 ml-auto">
            {isAdmin && (
              <Link
                to="/admin"
                className={`hidden lg:flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  location.pathname === '/admin'
                    ? 'bg-eco-50 text-eco-700'
                    : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                }`}
              >
                <Shield size={18} />
                <span>Admin</span>
              </Link>
            )}
            <div className="hidden lg:flex relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative p-2.5 rounded-xl transition-colors hover:bg-stone-100 text-stone-600`}
              >
                <Bell size={20} />
                {notifications > 0 && (
                  <span className="absolute top-1.5 right-1.5 bg-amber-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </motion.button>

              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-soft-lg border border-stone-100 z-50 overflow-hidden"
                >
                  <div className="p-4 border-b border-stone-100">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-stone-800">Notificações</h3>
                      <button onClick={() => setShowNotifications(false)} className="text-stone-400 hover:text-stone-600">
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="bg-gradient-to-br from-eco-50 to-teal-50 p-4 rounded-xl mb-4 border border-eco-100">
                      <div className="flex items-center gap-2 mb-2">
                        <AppIcon name={todayTip.iconName} size={18} className="text-eco-600" />
                        <span className="font-semibold text-eco-700 text-sm">Dica Ecológica</span>
                      </div>
                      <p className="text-sm text-stone-700 mb-2">{todayTip.text}</p>
                      <div className="text-xs text-eco-600 font-medium">{todayTip.action}</div>
                    </div>
                    <h4 className="font-semibold text-stone-700 text-sm mb-3">Histórico EcoPoints</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {pointsHistory.length > 0 ? pointsHistory.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
                          <div className="flex items-center gap-2">
                            <AppIcon name={item.iconName} size={16} className="text-stone-600" />
                            <div>
                              <div className="text-xs font-medium text-stone-800">{item.action}</div>
                              <div className="text-xs text-stone-500">{item.time}</div>
                            </div>
                          </div>
                          <div className={`text-sm font-bold ${item.points > 0 ? 'text-eco-600' : 'text-red-500'}`}>
                            {item.points > 0 ? '+' : ''}{item.points}
                          </div>
                        </div>
                      )) : (
                        <div className="text-center text-stone-500 text-sm py-6">Nenhuma atividade recente</div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            <div className={`hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl border transition-all duration-300 bg-gradient-to-r from-eco-50 to-teal-50 border-eco-100`}>
              <Sparkles size={18} className="text-amber-500" />
              <span className={`font-bold transition-colors duration-300 text-stone-800`}>{user?.ecoPoints || 0}</span>
            </div>

            <div className="hidden lg:flex relative" ref={profileRef}>
              <button
                onClick={() => setShowProfile(!showProfile)}
                className={`flex items-center gap-2 p-2 rounded-xl transition-all duration-200 ${
                  showProfile ? 'bg-stone-100' : 'hover:bg-stone-100'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-eco-400 to-teal-500 flex items-center justify-center shadow-sm overflow-hidden border border-white">
                  {(user?.avatar_url || user?.picture || user?.avatar) ? (
                    <img src={user.avatar_url || user.picture || user.avatar} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User size={17} className="text-white" />
                  )}
                </div>
                <motion.div
                  animate={{ rotate: showProfile ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown size={14} className="text-stone-500" />
                </motion.div>
              </button>

              {showProfile && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-stone-100 z-50 overflow-hidden"
                >
                  {/* Header do dropdown */}
                  <div className="bg-gradient-to-br from-eco-500 to-teal-500 p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center ring-2 ring-white/30 overflow-hidden">
                        {(user?.avatar_url || user?.picture || user?.avatar) ? (
                          <img src={user.avatar_url || user.picture || user.avatar} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <User size={20} className="text-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-white truncate leading-tight">{user?.name}</div>
                        <div className="text-xs text-white/70 truncate mt-0.5">{user?.email}</div>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2 bg-white/15 rounded-lg px-3 py-1.5">
                      <Sparkles size={13} className="text-amber-300 shrink-0" />
                      <span className="text-white/80 text-xs">EcoPoints:</span>
                      <span className="text-white font-bold text-sm ml-auto">{user?.ecoPoints || 0}</span>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="p-2">
                    <button
                      onClick={() => { navigate('/perfil'); setShowProfile(false); }}
                      className="w-full text-left px-3 py-2.5 text-sm text-stone-700 hover:bg-eco-50 hover:text-eco-700 rounded-xl flex items-center gap-3 transition-colors group/item"
                    >
                      <div className="w-8 h-8 rounded-lg bg-stone-100 group-hover/item:bg-eco-100 flex items-center justify-center transition-colors">
                        <User size={15} className="text-stone-500 group-hover/item:text-eco-600" />
                      </div>
                      <span className="font-medium">Meu Perfil</span>
                    </button>

                    <div className="my-1.5 border-t border-stone-100" />

                    <button
                      onClick={() => { handleLogout(); setShowProfile(false); }}
                      className="w-full text-left px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl flex items-center gap-3 transition-colors group/item"
                    >
                      <div className="w-8 h-8 rounded-lg bg-stone-100 group-hover/item:bg-red-100 flex items-center justify-center transition-colors">
                        <X size={15} className="text-stone-500 group-hover/item:text-red-500" />
                      </div>
                      <span className="font-medium">Sair</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`lg:hidden p-2.5 rounded-xl transition-colors hover:bg-stone-100 text-stone-600`}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          </div>
      </div>

        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`lg:hidden py-4 border-t transition-colors duration-300 border-stone-200`}
          >
            <div className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-3 rounded-xl text-sm font-medium ${
                    location.pathname === item.path
                      ? 'bg-eco-50 text-eco-700'
                      : 'text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <div className="border-t border-stone-200 pt-4 mt-4 px-4 space-y-2">
                <Link
                  to="/perfil"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-50"
                >
                  <div className="w-6 h-6 rounded-md bg-stone-100 flex items-center justify-center">
                    <User size={14} className="text-stone-500" />
                  </div>
                  Meu Perfil
                </Link>
                
                <div className="flex items-center justify-between px-4 py-2">
                  <span className="text-sm font-medium text-stone-600">Saldo:</span>
                  <div className="flex items-center gap-1.5 bg-amber-50 text-amber-600 px-2.5 py-1 rounded-lg text-xs font-bold">
                    <Sparkles size={12} />
                    {user?.ecoPoints || 0} pts
                  </div>
                </div>
                
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 px-4 py-3 mt-2 rounded-xl text-sm font-medium hover:bg-red-100"
                >
                  <X size={16} />
                  Sair da conta
                </button>
              </div>
            </div>
          </motion.div>
        )}
    </motion.header>
  );
};

export default Navbar;
