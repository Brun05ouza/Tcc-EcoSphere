import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api';
import { useUser } from '../contexts/UserContext';
import GoogleLogin from '../components/GoogleLogin';
import { Eye, EyeOff, Loader2, AlertTriangle, Check } from 'lucide-react';

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { updateUser } = useUser();
  const useSupabase = false;
  const inputClassName = "auth-input";
  const passwordInputClassName = "auth-input auth-input--password";
  const labelClassName = "auth-label";

  const showNotification = (message, type = 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // Helper for password strength validation
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
        message = 'A requisicao demorou demais. Verifique se a API esta rodando em http://localhost:4000.';
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
    <div
      className="auth-page"
      style={{ backgroundImage: "url('/fundo-login-tcc.svg')" }}
    >
      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4"
          >
            <div className={`p-4 rounded-2xl shadow-soft-lg border flex items-start gap-3 ${
              notification.type === 'success' ? 'bg-white border-eco-200 text-stone-800' :
              notification.type === 'warning' ? 'bg-white border-amber-200 text-stone-800' :
              'bg-white border-red-200 text-stone-800'
            }`}>
              <div className="shrink-0 mt-0.5">
                {notification.type === 'success' ? <Check size={20} className="text-eco-600" /> :
                 notification.type === 'warning' ? <AlertTriangle size={20} className="text-amber-500" /> :
                 <AlertTriangle size={20} className="text-red-500" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">{notification.message}</p>
              </div>
              <button
                onClick={() => setNotification(null)}
                className="shrink-0 text-stone-400 hover:text-stone-600 transition-colors"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="auth-shell">
        <div className="auth-card">
          {/* Brand */}
          <div className="mb-5 text-center">
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-emerald-300/90 mb-3">
              EcoSphere
            </p>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {isLogin ? 'Bem-vindo de volta' : 'Crie sua conta'}
            </h2>
            <p className="mt-1.5 text-sm text-white/60 leading-relaxed">
              {isLogin
                ? 'Acesse sua área de monitoramento ambiental.'
                : 'Comece a acompanhar seu impacto sustentável.'}
            </p>
          </div>

          {/* Tabs Entrar / Registrar */}
          <div className="auth-tabs" role="tablist" aria-label="Modo de autenticação">
            <motion.div
              className="auth-tab-pill"
              animate={{ x: isLogin ? '0%' : '100%' }}
              transition={{ type: 'spring', stiffness: 420, damping: 34, mass: 0.8 }}
            />
            <button
              type="button"
              role="tab"
              aria-selected={isLogin}
              onClick={() => setIsLogin(true)}
              className={`auth-tab ${isLogin ? 'auth-tab-active' : 'auth-tab-inactive'}`}
            >
              Entrar
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={!isLogin}
              onClick={() => setIsLogin(false)}
              className={`auth-tab ${!isLogin ? 'auth-tab-active' : 'auth-tab-inactive'}`}
            >
              Registrar
            </button>
          </div>

          {/* Form — lógica intacta */}
          <motion.form
            onSubmit={handleSubmit}
            className="space-y-3.5"
            key={isLogin ? 'login' : 'register'}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.28 }}
          >
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginBottom: 0 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <label htmlFor="name" className={labelClassName}>
                    Nome Completo
                  </label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={inputClassName}
                    placeholder="Seu nome completo"
                    autoComplete="name"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label htmlFor="email" className={labelClassName}>
                Email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={inputClassName}
                placeholder="seu@email.com"
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="password" className={labelClassName}>
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={passwordInputClassName}
                  placeholder="••••••••"
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/45 hover:text-white/85 transition-colors"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {isLogin && (
                <div className="mt-2 text-right">
                  <a
                    href="#"
                    className="text-[11px] font-semibold text-emerald-300/90 hover:text-emerald-200 transition-colors"
                  >
                    Esqueceu a senha?
                  </a>
                </div>
              )}

              <AnimatePresence>
                {!isLogin && formData.password && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2.5 overflow-hidden"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full ${getPasswordStrength(formData.password).color}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${getPasswordStrength(formData.password).strength}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-white/55 uppercase w-20 text-right">
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
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <label htmlFor="confirmPassword" className={labelClassName}>
                    Confirmar Senha
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={passwordInputClassName}
                      placeholder="••••••••"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/45 hover:text-white/85 transition-colors"
                      aria-label={showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading}
              className="auth-primary-button"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Processando...</span>
                </>
              ) : (
                isLogin ? 'Acessar EcoSphere' : 'Criar Conta'
              )}
            </button>
          </motion.form>

          <div className="mt-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">
                ou continue com
              </span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <GoogleLogin
              onGoogleClick={handleGoogleClick}
              onSuccess={handleGoogleClick}
              onError={handleGoogleError}
              text="Continuar com Google"
              useSupabase={useSupabase}
            />
          </div>

          {!isLogin && (
            <p className="mt-5 text-center text-[11px] text-white/45 font-medium leading-relaxed">
              Ao se registrar, você concorda com nossos{' '}
              <a href="#" className="text-emerald-300/90 hover:underline">Termos de Uso</a>
              {' '}e{' '}
              <a href="#" className="text-emerald-300/90 hover:underline">Política de Privacidade</a>.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
