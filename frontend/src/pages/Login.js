import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api';
import { useUser } from '../contexts/UserContext';
import GoogleLogin from '../components/GoogleLogin';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();
  const { updateUser } = useUser();

  const showNotification = (message, type = 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '', color: '' };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^\w\s]/.test(password)) score++;
    
    const levels = [
      { strength: 0, label: '', color: '' },
      { strength: 20, label: 'Muito Fraca', color: 'bg-red-500' },
      { strength: 40, label: 'Fraca', color: 'bg-orange-500' },
      { strength: 60, label: 'Média', color: 'bg-yellow-500' },
      { strength: 80, label: 'Forte', color: 'bg-green-500' },
      { strength: 100, label: 'Muito Forte', color: 'bg-green-600' }
    ];
    
    return levels[score] || levels[0];
  };

  const handleGoogleSuccess = async (googleData) => {
    console.log('handleGoogleSuccess called with:', googleData);
    setLoading(true);
    try {
      console.log('Sending to API:', googleData);
      const response = await userAPI.googleLogin(googleData);
      console.log('API response:', response.data);
      updateUser(response.data.user, response.data.token);
      showNotification('🎉 Login com Google realizado!', 'success');
      setTimeout(() => navigate('/'), 1000);
    } catch (error) {
      console.error('Google login error:', error);
      showNotification('❌ Erro no login com Google', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = (error) => {
    console.error('Google error:', error);
    showNotification('❌ Erro na autenticação Google', 'error');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        if (!formData.email || !formData.password) {
          showNotification('📝 Preencha todos os campos para continuar', 'warning');
          return;
        }

        if (!formData.email.includes('@')) {
          showNotification('📧 Digite um email válido', 'error');
          return;
        }

        const response = await userAPI.login({
          email: formData.email,
          password: formData.password
        });

        updateUser(response.data.user, response.data.token);
        showNotification('🎉 Login realizado com sucesso!', 'success');
        setTimeout(() => navigate('/'), 1000);
      } else {
        if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
          showNotification('📝 Preencha todos os campos para continuar', 'warning');
          return;
        }

        if (!formData.email.includes('@')) {
          showNotification('📧 Digite um email válido', 'error');
          return;
        }

        if (formData.password !== formData.confirmPassword) {
          showNotification('🔒 As senhas não coincidem', 'error');
          return;
        }

        if (formData.password.length < 6) {
          showNotification('🔐 A senha deve ter pelo menos 6 caracteres', 'error');
          return;
        }

        const passwordStrength = getPasswordStrength(formData.password);
        if (passwordStrength.strength < 60) {
          showNotification('⚠️ Use uma senha mais forte para maior segurança', 'warning');
          return;
        }

        const response = await userAPI.register({
          name: formData.name,
          email: formData.email,
          password: formData.password
        });

        updateUser(response.data.user, response.data.token);
        showNotification('🎉 Conta criada com sucesso!', 'success');
        setTimeout(() => navigate('/'), 1000);
      }
    } catch (error) {
      let message = '❌ Erro ao fazer login/registro';
      
      if (error.response?.status === 401) {
        message = '🔐 Email ou senha incorretos';
      } else if (error.response?.status === 409) {
        message = '📧 Este email já está cadastrado';
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      }
      
      showNotification(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 flex items-center justify-center p-4 overflow-hidden">
      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed top-4 right-4 z-50 max-w-sm"
          >
            <div className={`p-3 rounded-xl shadow-lg border-l-4 ${
              notification.type === 'success' ? 'bg-green-50 border-green-500 text-green-800' :
              notification.type === 'warning' ? 'bg-yellow-50 border-yellow-500 text-yellow-800' :
              'bg-red-50 border-red-500 text-red-800'
            }`}>
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium">{notification.message}</p>
                </div>
                <button
                  onClick={() => setNotification(null)}
                  className="ml-3 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Container Principal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl h-[600px] flex overflow-hidden"
      >
        {/* Lado Esquerdo - Formulário */}
        <div className="w-1/2 p-8 overflow-y-auto">
          {/* Logo */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-xl">🌍</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">EcoSphere</h1>
                <p className="text-xs text-gray-600">Transformando dados em ação sustentável</p>
              </div>
            </div>
          </div>

        {/* Toggle Login/Register */}
        <div className="relative flex bg-gray-100 rounded-xl p-1 mb-3">
          <motion.div
            className="absolute top-1 bottom-1 bg-white rounded-lg shadow-md"
            initial={false}
            animate={{
              left: isLogin ? '4px' : '50%',
              right: isLogin ? '50%' : '4px'
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
          <motion.button
            onClick={() => setIsLogin(true)}
            className={`relative z-10 flex-1 py-1.5 px-3 rounded-lg transition-all text-sm ${
              isLogin ? 'text-gray-800' : 'text-gray-600 hover:text-gray-800'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.span
              animate={{ 
                fontWeight: isLogin ? 600 : 400,
                scale: isLogin ? 1.05 : 1
              }}
              transition={{ duration: 0.2 }}
            >
              Entrar
            </motion.span>
          </motion.button>
          <motion.button
            onClick={() => setIsLogin(false)}
            className={`relative z-10 flex-1 py-1.5 px-3 rounded-lg transition-all text-sm ${
              !isLogin ? 'text-gray-800' : 'text-gray-600 hover:text-gray-800'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.span
              animate={{ 
                fontWeight: !isLogin ? 600 : 400,
                scale: !isLogin ? 1.05 : 1
              }}
              transition={{ duration: 0.2 }}
            >
              Registrar
            </motion.span>
          </motion.button>
        </div>

        {/* Form */}
        <motion.form 
          onSubmit={handleSubmit} 
          className="space-y-2"
          key={isLogin ? 'login' : 'register'}
          initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <AnimatePresence mode="wait">
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Completo
                </label>
                <motion.input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      document.querySelector('input[name="email"]').focus();
                    }
                  }}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                  placeholder="Seu nome completo"
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1 }}
                  autoFocus
                />
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <motion.input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  document.querySelector('input[name="password"]').focus();
                }
              }}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
              placeholder="seu@email.com"
              whileFocus={{ scale: 1.02 }}
              autoFocus
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Senha
            </label>
            <motion.input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (isLogin) {
                    handleSubmit(e);
                  } else {
                    document.querySelector('input[name="confirmPassword"]')?.focus();
                  }
                }
              }}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
              placeholder="••••••••"
              whileFocus={{ scale: 1.02 }}
            />
            
            {/* Password Strength Indicator - Only in Register Mode */}
            <AnimatePresence>
              {!isLogin && formData.password && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-1.5"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <motion.div
                        className={`h-2 rounded-full ${getPasswordStrength(formData.password).color}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${getPasswordStrength(formData.password).strength}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <span className={`text-xs font-medium ${
                      getPasswordStrength(formData.password).strength >= 80 ? 'text-green-600' :
                      getPasswordStrength(formData.password).strength >= 60 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {getPasswordStrength(formData.password).label}
                    </span>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    <div className="flex flex-wrap gap-1">
                      <span className={formData.password.length >= 8 ? 'text-green-600' : 'text-red-400'}>
                        {formData.password.length >= 8 ? '✓' : '✗'} 8+
                      </span>
                      <span className={/[A-Z]/.test(formData.password) ? 'text-green-600' : 'text-red-400'}>
                        {/[A-Z]/.test(formData.password) ? '✓' : '✗'} A-Z
                      </span>
                      <span className={/\d/.test(formData.password) ? 'text-green-600' : 'text-red-400'}>
                        {/\d/.test(formData.password) ? '✓' : '✗'} 0-9
                      </span>
                      <span className={/[^\w\s]/.test(formData.password) ? 'text-green-600' : 'text-red-400'}>
                        {/[^\w\s]/.test(formData.password) ? '✓' : '✗'} @#$
                      </span>
                    </div>
                    {getPasswordStrength(formData.password).strength < 60 && (
                      <div className="mt-1 text-red-500 text-xs">
                        ⚠️ Senha muito fraca
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <AnimatePresence mode="wait">
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                transition={{ duration: 0.3, ease: "easeInOut", delay: 0.1 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar Senha
                </label>
                <motion.input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                  placeholder="••••••••"
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                  whileFocus={{ scale: 1.02 }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            whileHover={{ scale: 1.02, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-2.5 px-4 rounded-xl font-semibold hover:from-green-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <motion.div
              key={isLogin ? 'login-btn' : 'register-btn'}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <motion.i 
                    className="bi bi-arrow-clockwise mr-2"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  {isLogin ? 'Entrando...' : 'Registrando...'}
                </div>
              ) : (
                <motion.span
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {isLogin ? 'Entrar' : 'Criar Conta'}
                </motion.span>
              )}
            </motion.div>
          </motion.button>
        </motion.form>

        {/* Google Login - Both Login and Register */}
        <AnimatePresence mode="wait">
          {(
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="mt-4"
            >
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500 text-xs">
                    {isLogin ? 'ou continue com' : 'ou registre-se com'}
                  </span>
                </div>
              </div>
              
              <div className="mt-4">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <GoogleLogin 
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    text="Continuar com Google"
                  />
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Demo Credentials */}
        <AnimatePresence mode="wait">
          {isLogin && (
            <motion.div 
              className="mt-4 p-3 bg-blue-50 rounded-xl"
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.3, delay: 0.6 }}
            >
              <motion.h4 
                className="font-semibold text-blue-800 mb-2 text-sm"
                initial={{ x: -10 }}
                animate={{ x: 0 }}
                transition={{ delay: 0.7 }}
              >
                🚀 Acesso Rápido (Demo)
              </motion.h4>
              <motion.div 
                className="text-xs text-blue-700"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <p><strong>Login:</strong> demo@ecosphere.com / 123456</p>
                <p><strong>Registro:</strong> Use senha forte (Ex: MinhaSenh@123)</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <div className="mt-4 text-center text-xs text-gray-500">
          <p>Ao continuar, você concorda com nossos</p>
          <p>
            <span className="text-green-600 hover:underline cursor-pointer">Termos de Uso</span>
            {' e '}
            <span className="text-green-600 hover:underline cursor-pointer">Política de Privacidade</span>
          </p>
        </div>
        </div>

        {/* Lado Direito - Globo e Informações */}
        <motion.div 
          className="w-1/2 bg-gradient-to-br from-green-500 via-blue-500 to-purple-600 flex flex-col items-center justify-center p-8 text-white relative overflow-hidden"
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {/* Decoração de fundo */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
          </div>

          {/* Globo animado */}
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              rotate: { duration: 20, repeat: Infinity, ease: "linear" },
              scale: { duration: 3, repeat: Infinity, ease: "easeInOut" }
            }}
            className="text-9xl mb-8 relative z-10"
          >
            🌍
          </motion.div>

          {/* Texto informativo */}
          <div className="text-center relative z-10">
            <motion.h2 
              className="text-3xl font-bold mb-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Bem-vindo ao EcoSphere
            </motion.h2>
            <motion.p 
              className="text-lg opacity-90 mb-6"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              Junte-se a nós na missão de tornar o mundo mais sustentável
            </motion.p>

            {/* Features */}
            <motion.div 
              className="space-y-3 text-left"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              {[
                { icon: '🤖', text: 'Classificação de resíduos com IA' },
                { icon: '🎮', text: 'Gamificação e recompensas' },
                { icon: '📊', text: 'Monitoramento em tempo real' },
                { icon: '🏆', text: 'Ranking e conquistas' }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-3"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.2)' }}
                >
                  <span className="text-2xl">{feature.icon}</span>
                  <span className="text-sm font-medium">{feature.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;