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
  const [isHeroVisible, setIsHeroVisible] = useState(false);
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
    const iconStyle = isHeroVisible
      ? (active ? { filter: 'brightness(0) invert(1)' } : { filter: 'brightness(0) invert(0.8)' })
      : (active ? { filter: 'invert(48%) sepia(79%) saturate(2476%) hue-rotate(86deg) brightness(118%) contrast(119%)' } : { filter: 'invert(40%) sepia(5%) saturate(500%) hue-rotate(180deg)' });
    return (
      <img 
        src={require(`../assets/icons/${name}.svg`)} 
        alt={name} 
        className={className}
        style={iconStyle}
      />
    );
  };

  const navBg = isHeroVisible
    ? 'bg-transparent border-b border-transparent shadow-none'
    : 'bg-white border-b border-stone-200/60 shadow-soft';

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`sticky top-0 z-50 transition-all duration-300 ${navBg}`}
    >
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex justify-between items-center h-16 md:h-[72px] py-2">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <EcoGlobeLogo
              size={48}
              style={{ filter: 'invert(40%) sepia(93%) saturate(500%) hue-rotate(100deg)' }}
            />
            <span className={`text-xl font-bold font-display transition-colors duration-300 ${
              isHeroVisible 
                ? 'bg-gradient-to-r from-emerald-300 via-teal-300 to-eco-400 bg-clip-text text-transparent' 
                : 'bg-gradient-to-r from-eco-700 via-teal-600 to-eco-700 bg-clip-text text-transparent'
            }`}>
              EcoSphere
            </span>
          </Link>
          
          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  isHeroVisible
                    ? location.pathname === item.path
                      ? 'bg-white/15 text-white'
                      : 'text-stone-300 hover:bg-white/10 hover:text-white'
                    : location.pathname === item.path
                      ? 'bg-eco-50 text-eco-700'
                      : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                }`}
              >
                <Icon name={item.icon} className="w-4 h-4 shrink-0" active={location.pathname === item.path} />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
          
          {/* User Section */}
          <div className="hidden lg:flex items-center gap-3">
            {isAdmin && (
              <Link
                to="/admin"
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isHeroVisible
                    ? location.pathname === '/admin'
                      ? 'bg-white/15 text-white'
                      : 'text-stone-300 hover:bg-white/10 hover:text-white'
                    : location.pathname === '/admin'
                      ? 'bg-eco-50 text-eco-700'
                      : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                }`}
              >
                <Shield size={18} />
                <span>Admin</span>
              </Link>
            )}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative p-2.5 rounded-xl transition-colors ${
                  isHeroVisible ? 'text-stone-300 hover:bg-white/10' : 'hover:bg-stone-100 text-stone-600'
                }`}
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
            
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all duration-300 ${
                isHeroVisible 
                  ? 'bg-white/10 border-white/20' 
                  : 'bg-gradient-to-r from-eco-50 to-teal-50 border-eco-100'
              }`}>
              <Sparkles size={18} className="text-amber-500" />
              <span className={`font-bold transition-colors duration-300 ${isHeroVisible ? 'text-white' : 'text-stone-800'}`}>{user?.ecoPoints || 0}</span>
            </div>
            
            <div className="relative group">
              <button className={`flex items-center gap-2 p-2.5 rounded-xl transition-colors ${
                isHeroVisible ? 'hover:bg-white/10' : 'hover:bg-stone-100'
              }`}>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-eco-400 to-teal-500 flex items-center justify-center">
                  <User size={16} className="text-white" />
                </div>
                <ChevronDown size={14} className={isHeroVisible ? 'text-stone-400' : 'text-stone-500'} />
              </button>
              
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-soft-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 border border-stone-100 overflow-hidden">
                <div className="p-3 border-b border-stone-100">
                  <div className="font-medium text-stone-800 truncate">{user?.name}</div>
                  <div className="text-xs text-stone-500 truncate">{user?.email}</div>
                </div>
                <div className="p-2">
                  <button 
                    onClick={() => { navigate('/perfil'); }}
                    className="w-full text-left px-3 py-2.5 text-sm text-stone-700 hover:bg-stone-50 rounded-xl flex items-center gap-2"
                  >
                    <User size={16} />
                    Meu Perfil
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl flex items-center gap-2"
                  >
                    Sair
                  </button>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`lg:hidden p-2.5 rounded-xl transition-colors ${
              isHeroVisible ? 'hover:bg-white/10 text-stone-300' : 'hover:bg-stone-100 text-stone-600'
            }`}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`lg:hidden py-4 border-t transition-colors duration-300 ${
              isHeroVisible ? 'border-white/10' : 'border-stone-200'
            }`}
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
              <div className="border-t border-stone-200 pt-4 mt-4 px-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-stone-600">EcoPoints</span>
                  <span className="font-bold text-eco-600">{user?.ecoPoints || 0}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="w-full bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-medium hover:bg-red-100"
                >
                  Sair
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;
