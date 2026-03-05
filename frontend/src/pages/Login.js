import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api';
import { useUser } from '../contexts/UserContext';
import GoogleLogin from '../components/GoogleLogin';
import LoginGlobeBackground from '../components/globe/LoginGlobeBackground';
import EcoGlobeLogo from '../components/ui/EcoGlobeLogo';
import LoadingScreen from '../components/ui/LoadingScreen';
import { Brain, Recycle, BarChart3, Trophy } from 'lucide-react';

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
  const useSupabase = !!(process.env.REACT_APP_SUPABASE_URL && process.env.REACT_APP_SUPABASE_ANON_KEY);

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

  const handleGoogleClick = async () => {
    setLoading(true);
    try {
      await userAPI.googleLogin();
      showNotification('Redirecionando para o Google...', 'success');
    } catch (error) {
      showNotification('Erro no login com Google', 'error');
      setLoading(false);
    }
  };

  const handleGoogleError = (error) => {
    showNotification('Erro na autenticação Google', 'error');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!process.env.REACT_APP_SUPABASE_URL || !process.env.REACT_APP_SUPABASE_ANON_KEY) {
      showNotification('Configure REACT_APP_SUPABASE_URL e REACT_APP_SUPABASE_ANON_KEY no arquivo .env do frontend.', 'error');
      return;
    }
    setLoading(true);

    try {
      if (isLogin) {
        if (!formData.email || !formData.password) {
          showNotification('Preencha todos os campos para continuar', 'warning');
          setLoading(false);
          return;
        }

        if (!formData.email.includes('@')) {
          showNotification('Digite um email válido', 'error');
          setLoading(false);
          return;
        }

        const response = await userAPI.login({
          email: formData.email,
          password: formData.password
        });

        if (response.data?.user && response.data?.token) {
          updateUser(response.data.user, response.data.token);
        }
        showNotification('Login realizado com sucesso!', 'success');
        setTimeout(() => navigate('/'), 1000);
      } else {
        if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
          showNotification('Preencha todos os campos para continuar', 'warning');
          setLoading(false);
          return;
        }

        if (!formData.email.includes('@')) {
          showNotification('Digite um email válido', 'error');
          setLoading(false);
          return;
        }

        if (formData.password !== formData.confirmPassword) {
          showNotification('As senhas não coincidem', 'error');
          setLoading(false);
          return;
        }

        if (formData.password.length < 6) {
          showNotification('A senha deve ter pelo menos 6 caracteres', 'error');
          setLoading(false);
          return;
        }

        const passwordStrength = getPasswordStrength(formData.password);
        if (passwordStrength.strength < 60) {
          showNotification('Use uma senha mais forte para maior segurança', 'warning');
          setLoading(false);
          return;
        }

        const response = await userAPI.register({
          name: formData.name,
          email: formData.email,
          password: formData.password
        });

        if (response.data?.user && response.data?.token) {
          updateUser(response.data.user, response.data.token);
          showNotification('Conta criada com sucesso!', 'success');
          setTimeout(() => navigate('/'), 1000);
        } else if (response.data?.user) {
          updateUser(response.data.user, null);
          showNotification('Conta criada! Confirme seu email no link que enviamos para entrar.', 'success');
          setTimeout(() => navigate('/'), 3000);
        } else {
          showNotification('Conta criada com sucesso!', 'success');
          setTimeout(() => navigate('/'), 1000);
        }
      }
    } catch (error) {
      const isAbort = error?.name === 'AbortError' || /signal is aborted|aborted without reason/i.test(error?.message || '');
      if (isAbort) {
        return;
      }
      let message = 'Erro ao fazer login/registro';
      const errMsg = error?.message || error?.response?.data?.message || '';
      const status = error?.status ?? error?.response?.status;
      if (/Tempo esgotado|timeout|Verifique sua conexão/i.test(errMsg)) {
        message = 'A requisição demorou demais. Verifique sua internet e se o Supabase está acessível (URL e chave no .env).';
      } else if (status === 400 || status === 401) {
        message = /confirm|email not confirmed/i.test(errMsg)
          ? 'Confirme seu email para entrar. Verifique a caixa de entrada.'
          : 'Email ou senha incorretos';
      } else if (status === 409 || /already registered|already exists|duplicate/i.test(errMsg)) {
        message = 'Este email já está cadastrado';
      } else if (errMsg) {
        if (/confirm your email|email not confirmed/i.test(errMsg)) message = 'Confirme seu email para entrar. Verifique a caixa de entrada.';
        else if (/invalid login|invalid credentials/i.test(errMsg)) message = 'Email ou senha incorretos';
        else message = errMsg.length > 80 ? errMsg.slice(0, 80) + '…' : errMsg;
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
    <div className="min-h-screen bg-gradient-to-br from-eco-600 via-teal-600 to-eco-700 flex items-center justify-center p-4 relative overflow-hidden">
      <LoginGlobeBackground opacity={0.35} blur="4px" zoom={35e6} />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-white/5 rounded-full blur-2xl" />
      </div>

      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed top-4 right-4 z-50 max-w-sm"
          >
            <div className={`p-3 rounded-xl shadow-lg border-l-4 backdrop-blur-md ${
              notification.type === 'success' ? 'bg-green-50/90 border-green-500 text-green-800' :
              notification.type === 'warning' ? 'bg-yellow-50/90 border-yellow-500 text-yellow-800' :
              'bg-red-50/90 border-red-500 text-red-800'
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
      <div className="w-full max-w-7xl mx-auto grid md:grid-cols-2 gap-8 items-center relative z-10">
        {/* Coluna Esquerda - Boas-vindas */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="text-white space-y-8 hidden md:block"
        >
          {/* Logo e Título */}
          <div>
            <div className="mb-6 inline-block">
              <EcoGlobeLogo size={56} style={{ filter: 'brightness(0) invert(1)' }} />
            </div>
            <h1 className="text-5xl font-bold mb-4">Bem-vindo ao EcoSphere</h1>
            <p className="text-xl text-white/90">
              Junte-se a nós na missão de tornar o mundo mais sustentável
            </p>
          </div>

          {/* Features Cards */}
          <div className="space-y-4">
            {[
              { icon: Brain, text: 'Classificação de resíduos com IA' },
              { icon: Trophy, text: 'Gamificação e recompensas' },
              { icon: BarChart3, text: 'Monitoramento em tempo real' },
              { icon: Recycle, text: 'Ranking e conquistas' }
            ].map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  whileHover={{ scale: 1.05, x: 10 }}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 cursor-pointer transition-all"
                >
                  <IconComponent size={32} strokeWidth={1.5} className="text-white" />
                  <span className="text-lg font-medium">{feature.text}</span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Coluna Direita - Formulário Glassmorphism */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md mx-auto relative"
        >
          {/* Globo decorativo sutil */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none select-none w-48 h-48">
            <EcoGlobeLogo size={192} className="w-full h-full" style={{ filter: 'brightness(0) invert(1)' }} />
          </div>

          <div className="bg-white/15 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl relative z-10">
            {/* Toggle Login/Register */}
            <div className="relative flex bg-white/20 rounded-2xl p-1 mb-3">
              <motion.div
                className="absolute top-1 bottom-1 bg-white rounded-xl shadow-md"
                animate={{
                  left: isLogin ? '4px' : '50%',
                  right: isLogin ? '50%' : '4px'
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
              <button
                onClick={() => setIsLogin(true)}
                className={`relative z-10 flex-1 py-2 px-4 rounded-xl transition-all text-sm font-semibold ${
                  isLogin ? 'text-gray-800' : 'text-white'
                }`}
              >
                Entrar
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`relative z-10 flex-1 py-2 px-4 rounded-xl transition-all text-sm font-semibold ${
                  !isLogin ? 'text-gray-800' : 'text-white'
                }`}
              >
                Registrar
              </button>
            </div>

            {/* Form */}
            <motion.form
              onSubmit={handleSubmit}
              className="space-y-2"
              key={isLogin ? 'login' : 'register'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <label className="block text-xs font-medium text-white mb-1">
                      Nome Completo
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-white/90 border border-white/30 rounded-xl focus:ring-2 focus:ring-white focus:border-transparent text-gray-800 placeholder-gray-400 transition-all text-sm"
                      placeholder="Seu nome completo"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label className="block text-xs font-medium text-white mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white/90 border border-white/30 rounded-xl focus:ring-2 focus:ring-white focus:border-transparent text-gray-800 placeholder-gray-400 transition-all text-sm"
                  placeholder="seu@email.com"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white mb-1">
                  Senha
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white/90 border border-white/30 rounded-xl focus:ring-2 focus:ring-white focus:border-transparent text-gray-800 placeholder-gray-400 transition-all text-sm"
                  placeholder="••••••••"
                />

                {/* Password Strength */}
                <AnimatePresence>
                  {!isLogin && formData.password && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-1"
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-white/30 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${getPasswordStrength(formData.password).color}`}
                            style={{ width: `${getPasswordStrength(formData.password).strength}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-white">
                          {getPasswordStrength(formData.password).label}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <label className="block text-xs font-medium text-white mb-1">
                      Confirmar Senha
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-white/90 border border-white/30 rounded-xl focus:ring-2 focus:ring-white focus:border-transparent text-gray-800 placeholder-gray-400 transition-all text-sm"
                      placeholder="••••••••"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-eco-600 to-teal-600 text-white py-2.5 px-4 rounded-xl font-semibold hover:from-eco-700 hover:to-teal-700 transition-all disabled:opacity-50 shadow-soft text-sm"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <LoadingScreen fullScreen={false} size={20} />
                    {isLogin ? 'Entrando...' : 'Registrando...'}
                  </span>
                ) : (
                  <span>{isLogin ? 'Entrar' : 'Criar Conta'}</span>
                )}
              </motion.button>
            </motion.form>

            {/* Google Login */}
            <div className="mt-3">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/30" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-transparent text-white/80 text-xs">
                    {isLogin ? 'ou continue com' : 'ou registre-se com'}
                  </span>
                </div>
              </div>

              <div className="mt-3">
                <GoogleLogin
                  onGoogleClick={handleGoogleClick}
                  onSuccess={handleGoogleClick}
                  onError={handleGoogleError}
                  text="Continuar com Google"
                  useSupabase={useSupabase}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="mt-3 text-center text-xs text-white/70">
              <p>Ao continuar, você concorda com nossos</p>
              <p className="mt-1">
                <span className="text-white hover:underline cursor-pointer">Termos de Uso</span>
                {' e '}
                <span className="text-white hover:underline cursor-pointer">Política de Privacidade</span>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
