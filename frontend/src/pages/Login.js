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
      <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between relative z-10 gap-12 lg:gap-24 px-4 sm:px-6 lg:px-8">
        {/* Coluna Esquerda - Boas-vindas */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-white space-y-10 flex-1 hidden md:flex flex-col justify-center"
        >
          {/* Logo e Título */}
          <div>
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-8 inline-block drop-shadow-xl"
            >
              <EcoGlobeLogo size={72} style={{ filter: 'brightness(0) invert(1)' }} />
            </motion.div>
            <h1 className="text-5xl lg:text-6xl xl:text-7xl font-black mb-6 tracking-tighter leading-tight">
              EcoSphere
            </h1>
            <p className="text-xl lg:text-2xl text-white/90 font-medium max-w-xl leading-relaxed">
              Junte-se a nós na missão de construir um futuro sustentável através da tecnologia.
            </p>
          </div>

          {/* Features Cards */}
          <div className="grid sm:grid-cols-2 gap-4 max-w-2xl">
            {[
              { icon: Brain, title: 'IA Inteligente', desc: 'Classificação automática' },
              { icon: Trophy, title: 'Gamificação', desc: 'Ganhe prêmios reais' },
              { icon: BarChart3, title: 'Dashboard', desc: 'Métricas em tempo real' },
              { icon: Recycle, title: 'Comunidade', desc: 'Impacto coletivo' }
            ].map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  whileHover={{ scale: 1.03, backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
                  className="flex items-start gap-4 p-5 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl transition-all"
                >
                  <div className="p-3 bg-white/20 rounded-2xl shrink-0">
                    <IconComponent size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-1">{feature.title}</h3>
                    <p className="text-white/70 text-sm font-medium">{feature.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Coluna Direita - Formulário Glassmorphism */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-[440px] shrink-0"
        >
          <div className="bg-white/10 backdrop-blur-2xl rounded-[2.5rem] p-8 sm:p-10 border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] relative z-10 overflow-hidden">
            {/* Efeito de brilho interno do card */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />

            {/* Toggle Login/Register */}
            <div className="relative flex bg-black/20 rounded-2xl p-1 mb-8">
              <motion.div
                className="absolute top-1 bottom-1 bg-white rounded-xl shadow-lg"
                animate={{
                  left: isLogin ? '4px' : '50%',
                  right: isLogin ? '50%' : '4px'
                }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
              <button
                onClick={() => setIsLogin(true)}
                className={`relative z-10 flex-1 py-3 px-4 rounded-xl transition-all text-sm font-bold tracking-wide ${
                  isLogin ? 'text-stone-900' : 'text-white hover:text-white/80'
                }`}
              >
                Entrar
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`relative z-10 flex-1 py-3 px-4 rounded-xl transition-all text-sm font-bold tracking-wide ${
                  !isLogin ? 'text-stone-900' : 'text-white hover:text-white/80'
                }`}
              >
                Registrar
              </button>
            </div>

            <div className="mb-8 text-center relative z-10">
              <h2 className="text-2xl font-bold text-white mb-2">
                {isLogin ? 'Bem-vindo de volta!' : 'Crie sua conta'}
              </h2>
              <p className="text-white/70 text-sm">
                {isLogin ? 'Insira seus dados para acessar sua conta' : 'Junte-se à comunidade sustentável'}
              </p>
            </div>

            {/* Form */}
            <motion.form
              onSubmit={handleSubmit}
              className="space-y-4 relative z-10"
              key={isLogin ? 'login' : 'register'}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <label className="block text-xs font-bold text-white/90 uppercase tracking-wider mb-2 ml-1">
                      Nome Completo
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-2xl focus:bg-white/20 focus:ring-2 focus:ring-white/50 focus:border-transparent text-white placeholder-white/40 transition-all font-medium outline-none"
                      placeholder="Seu nome completo"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label className="block text-xs font-bold text-white/90 uppercase tracking-wider mb-2 ml-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-2xl focus:bg-white/20 focus:ring-2 focus:ring-white/50 focus:border-transparent text-white placeholder-white/40 transition-all font-medium outline-none"
                  placeholder="seu@email.com"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2 ml-1">
                  <label className="block text-xs font-bold text-white/90 uppercase tracking-wider">
                    Senha
                  </label>
                  {isLogin && (
                    <a href="#" className="text-xs font-bold text-teal-300 hover:text-white transition-colors">
                      Esqueceu a senha?
                    </a>
                  )}
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-2xl focus:bg-white/20 focus:ring-2 focus:ring-white/50 focus:border-transparent text-white placeholder-white/40 transition-all font-medium outline-none"
                  placeholder="••••••••"
                />

                {/* Password Strength */}
                <AnimatePresence>
                  {!isLogin && formData.password && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 overflow-hidden"
                    >
                      <div className="flex items-center gap-3 mb-1">
                        <div className="flex-1 h-1.5 bg-black/20 rounded-full overflow-hidden">
                          <motion.div 
                            className={`h-full ${getPasswordStrength(formData.password).color}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${getPasswordStrength(formData.password).strength}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-white/80 uppercase w-20 text-right">
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
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <label className="block text-xs font-bold text-white/90 uppercase tracking-wider mb-2 ml-1">
                      Confirmar Senha
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-2xl focus:bg-white/20 focus:ring-2 focus:ring-white/50 focus:border-transparent text-white placeholder-white/40 transition-all font-medium outline-none"
                      placeholder="••••••••"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 bg-white text-stone-900 rounded-2xl font-bold text-lg hover:bg-stone-50 hover:shadow-xl transition-all disabled:opacity-70 flex items-center justify-center gap-2 mt-6 active:scale-[0.98]"
              >
                {loading ? (
                  <div className="w-6 h-6 border-3 border-stone-300 border-t-stone-800 rounded-full animate-spin" />
                ) : (
                  isLogin ? 'Entrar na Plataforma' : 'Criar Conta'
                )}
              </button>
            </motion.form>

            {/* Google Login */}
            <div className="mt-8 relative z-10">
              <div className="flex justify-center text-sm mb-4">
                <span className="text-[11px] font-black text-white/60 uppercase tracking-widest">
                  {isLogin ? 'Ou continue com' : 'Ou registre-se com'}
                </span>
              </div>

              <div>
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
            {!isLogin && (
              <p className="mt-8 text-center text-xs text-white/60 font-medium relative z-10">
                Ao se registrar, você concorda com nossos <br/>
                <a href="#" className="text-white hover:underline">Termos de Uso</a> e <a href="#" className="text-white hover:underline">Política de Privacidade</a>.
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
