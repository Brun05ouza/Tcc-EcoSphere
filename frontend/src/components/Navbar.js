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
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/classificar-residuos', label: 'IA Resíduos', icon: '🤖' },
    { path: '/monitoramento', label: 'Monitoramento', icon: '🌡️' },
    { path: '/gamificacao', label: 'EcoPoints', icon: '🏆' },
    { path: '/recompensas', label: 'Recompensas', icon: '🎁' },
    { path: '/educacao', label: 'Educação', icon: '📚' }
  ];

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="bg-gradient-to-r from-green-600 via-green-700 to-blue-600 text-white shadow-2xl sticky top-0 z-50 backdrop-blur-sm"
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="text-3xl"
            >
              🌍
            </motion.div>
            <span className="text-2xl font-bold bg-gradient-to-r from-white to-green-100 bg-clip-text text-transparent">
              EcoSphere
            </span>
          </Link>
          
          {/* Desktop Menu */}
          <div className="hidden lg:flex xl:space-x-1 lg:space-x-0.5">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="relative xl:px-4 lg:px-2 py-2 rounded-xl transition-all duration-300 hover:bg-white/10"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center xl:space-x-2 lg:space-x-1"
                >
                  <span className="xl:text-base lg:text-sm">{item.icon}</span>
                  <span className="font-medium xl:text-base lg:text-sm xl:block lg:hidden xl:inline">{item.label}</span>
                </motion.div>
                {location.pathname === item.path && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-white/20 rounded-xl"
                    initial={false}
                  />
                )}
              </Link>
            ))}
          </div>
          
          {/* User Section */}
          <div className="hidden lg:flex items-center xl:space-x-4 lg:space-x-2">
            {/* Notifications */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-xl hover:bg-white/10 transition-colors"
              >
                <i className="bi bi-bell text-lg"></i>
                {notifications > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                  >
                    {notifications}
                  </motion.span>
                )}
              </motion.button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="absolute right-0 mt-2 xl:w-80 lg:w-72 md:w-80 sm:w-72 w-64 bg-white rounded-xl shadow-2xl z-50 border border-gray-200"
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <i className="bi bi-bell-fill text-green-600"></i>
                        Notificações
                      </h3>
                      <button 
                        onClick={() => setShowNotifications(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <i className="bi bi-x-lg"></i>
                      </button>
                    </div>

                    {/* Dica do Dia */}
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 p-3 rounded-lg mb-4 border border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{todayTip.icon}</span>
                        <span className="font-semibold text-green-700 text-sm">Dica Ecológica</span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{todayTip.text}</p>
                      <div className="text-xs text-green-600 font-medium">{todayTip.action}</div>
                    </div>

                    {/* Histórico de Pontos */}
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-700 text-sm mb-3 flex items-center gap-2">
                        <i className="bi bi-gem text-yellow-500"></i>
                        Histórico de EcoPoints
                      </h4>
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

                    {/* Ações Rápidas */}
                    <div className="border-t pt-3">
                      <div className="grid grid-cols-2 gap-2">
                        <button 
                          onClick={() => {
                            navigate('/gamificacao');
                            setShowNotifications(false);
                          }}
                          className="text-xs bg-green-100 hover:bg-green-200 text-green-700 px-3 py-2 rounded-lg transition-colors flex items-center gap-1 justify-center"
                        >
                          <i className="bi bi-trophy"></i>
                          Ver EcoPoints
                        </button>
                        <button 
                          onClick={() => {
                            navigate('/classificar-residuos');
                            setShowNotifications(false);
                          }}
                          className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-lg transition-colors flex items-center gap-1 justify-center"
                        >
                          <i className="bi bi-recycle"></i>
                          Classificar
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
            
            {/* EcoPoints */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-sm xl:px-4 lg:px-2 py-2 rounded-xl flex items-center xl:space-x-2 lg:space-x-1"
            >
              <i className="bi bi-gem text-yellow-300 xl:text-base lg:text-sm"></i>
              <span className="font-semibold xl:text-base lg:text-sm">{user?.ecoPoints || 0}</span>
              <span className="xl:text-sm lg:text-xs text-green-100 xl:block lg:hidden">EcoPoints</span>
            </motion.div>
            
            {/* Profile Dropdown */}
            <div className="relative group">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white/10 hover:bg-white/20 xl:p-2 lg:p-1 rounded-xl transition-all duration-300 flex items-center xl:space-x-2 lg:space-x-1"
              >
                <i className="bi bi-person-circle xl:text-lg lg:text-base"></i>
                <span className="font-medium xl:text-base lg:text-sm xl:block lg:hidden">{user?.name || 'Usuário'}</span>
                <i className="bi bi-chevron-down xl:text-sm lg:text-xs xl:block lg:hidden"></i>
              </motion.button>
              
              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="p-2">
                  <div className="px-3 py-2 text-sm text-gray-600 border-b">
                    <div className="font-medium text-gray-800 truncate">{user?.name}</div>
                    <div className="text-xs truncate" title={user?.email}>{user?.email}</div>
                  </div>
                  <button 
                    onClick={() => navigate('/perfil')}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg flex items-center gap-2"
                  >
                    <i className="bi bi-person"></i>
                    Meu Perfil
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg flex items-center gap-2">
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
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-xl hover:bg-white/10"
          >
            {isOpen ? <i className="bi bi-x-lg text-xl"></i> : <i className="bi bi-list text-xl"></i>}
          </motion.button>
        </div>

        {/* Mobile Menu */}
        <motion.div
          initial={false}
          animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
          className="lg:hidden overflow-hidden"
        >
          <div className="py-4 space-y-2">
            {navItems.map((item, index) => (
              <motion.div
                key={item.path}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-colors"
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              </motion.div>
            ))}
            
            <div className="border-t border-white/20 pt-4 mt-4">
              <div className="px-4 py-2 space-y-2">
                <div className="flex items-center space-x-2">
                  <i className="bi bi-gem text-yellow-300"></i>
                  <span className="font-semibold">{user?.ecoPoints || 0} EcoPoints</span>
                </div>
                <div className="flex items-center space-x-2">
                  <i className="bi bi-person-circle"></i>
                  <span className="font-medium">{user?.name || 'Usuário'}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="w-full bg-red-500/20 hover:bg-red-500/30 px-4 py-2 rounded-xl flex items-center gap-2 justify-center"
                >
                  <i className="bi bi-box-arrow-right"></i>
                  Sair
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      

    </motion.nav>
  );
};

export default Navbar;