import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useUser } from '../contexts/UserContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const [showNotifications, setShowNotifications] = useState(false);
  const { user } = useUser();
  const location = useLocation();
  const navigate = useNavigate();

  const ecoTips = [
    { icon: '🌱', text: 'Já plantou uma árvore hoje?', action: 'Plante uma muda!' },
    { icon: '♻️', text: 'Separou o lixo reciclável?', action: 'Recicle agora!' },
    { icon: '💧', text: 'Economizou água hoje?', action: 'Feche a torneira!' },
    { icon: '🚲', text: 'Que tal usar a bike hoje?', action: 'Pedale mais!' },
    { icon: '💡', text: 'Apagou as luzes desnecessárias?', action: 'Economize energia!' },
    { icon: '🌍', text: 'Fez sua parte pelo planeta?', action: 'Continue assim!' }
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
        icon: item.points > 0 ? '🎆' : '🎁'
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
    const iconStyle = active 
      ? { filter: 'invert(48%) sepia(79%) saturate(2476%) hue-rotate(86deg) brightness(118%) contrast(119%)' } // green-600
      : { filter: 'invert(50%) sepia(8%) saturate(400%) hue-rotate(180deg) brightness(95%) contrast(85%)' }; // gray-600
    return (
      <img 
        src={require(`../assets/icons/${name}.svg`)} 
        alt={name} 
        className={className}
        style={iconStyle}
      />
    );
  };

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="bg-gradient-to-r from-green-50 via-emerald-50 to-blue-50 border-b border-green-100 sticky top-0 z-50 shadow-sm backdrop-blur-sm"
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="text-2xl"
            >
              🌍
            </motion.div>
            <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              EcoSphere
            </span>
          </Link>
          
          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  location.pathname === item.path
                    ? 'bg-green-50 text-green-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon name={item.icon} className="w-4 h-4" active={location.pathname === item.path} />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
          
          {/* User Section */}
          <div className="hidden lg:flex items-center space-x-3">
            {/* Notifications */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <i className="bi bi-bell text-lg text-gray-600"></i>
                {notifications > 0 && (
                  <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
                    {notifications}
                  </span>
                )}
              </motion.button>

              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl z-50 border border-gray-200"
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-gray-800">Notificações</h3>
                      <button 
                        onClick={() => setShowNotifications(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <i className="bi bi-x-lg"></i>
                      </button>
                    </div>

                    <div className="bg-gradient-to-r from-green-50 to-blue-50 p-3 rounded-lg mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{todayTip.icon}</span>
                        <span className="font-semibold text-green-700 text-sm">Dica Ecológica</span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{todayTip.text}</p>
                      <div className="text-xs text-green-600 font-medium">{todayTip.action}</div>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-700 text-sm mb-3">Histórico de EcoPoints</h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {pointsHistory.length > 0 ? pointsHistory.map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{item.icon}</span>
                              <div>
                                <div className="text-xs font-medium text-gray-800">{item.action}</div>
                                <div className="text-xs text-gray-500">{item.time}</div>
                              </div>
                            </div>
                            <div className={`text-sm font-bold ${
                              item.points > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {item.points > 0 ? '+' : ''}{item.points}
                            </div>
                          </div>
                        )) : (
                          <div className="text-center text-gray-500 text-sm py-4">
                            Nenhuma atividade recente
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
            
            {/* EcoPoints */}
            <div className="flex items-center gap-2 bg-gradient-to-r from-green-50 to-blue-50 px-3 py-2 rounded-lg">
              <i className="bi bi-gem text-green-600"></i>
              <span className="font-bold text-gray-800">{user?.ecoPoints || 0}</span>
            </div>
            
            {/* Profile Dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <i className="bi bi-person-circle text-xl text-gray-600"></i>
                <i className="bi bi-chevron-down text-xs text-gray-600"></i>
              </button>
              
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 border border-gray-200">
                <div className="p-2">
                  <div className="px-3 py-2 text-sm text-gray-600 border-b">
                    <div className="font-medium text-gray-800 truncate">{user?.name}</div>
                    <div className="text-xs truncate">{user?.email}</div>
                  </div>
                  <button 
                    onClick={() => navigate('/perfil')}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2"
                  >
                    <i className="bi bi-person"></i>
                    Meu Perfil
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2">
                    <i className="bi bi-gear"></i>
                    Configurações
                  </button>
                  <hr className="my-1" />
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2"
                  >
                    <i className="bi bi-box-arrow-right"></i>
                    Sair
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-50"
          >
            {isOpen ? <i className="bi bi-x-lg text-xl"></i> : <i className="bi bi-list text-xl"></i>}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden py-4 border-t"
          >
            <div className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-2 rounded-lg text-sm font-medium ${
                    location.pathname === item.path
                      ? 'bg-green-50 text-green-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              
              <div className="border-t pt-4 mt-4 px-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-600">EcoPoints</span>
                  <span className="font-bold text-green-600">{user?.ecoPoints || 0}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="w-full bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-medium"
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