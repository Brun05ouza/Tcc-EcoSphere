import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Shield, X, Eye, EyeOff, Lock, Mail, AlertCircle, Loader2 } from 'lucide-react';
import { auth, getCurrentProfile } from '../services/supabaseService';
import { useUser } from '../contexts/UserContext';

const AdminLoginPanel = () => {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { updateUser } = useUser();
  const navigate = useNavigate();

  // Listener do atalho Ctrl + Shift + A
  const handleKeyDown = useCallback((e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'A') {
      e.preventDefault();
      setVisible((v) => !v);
      setError('');
    }
    if (e.key === 'Escape') {
      setVisible(false);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Preencha todos os campos.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const data = await auth.signIn(email, password);
      const profile = await getCurrentProfile();

      if (!profile?.isAdmin) {
        await auth.signOut();
        setError('Acesso negado. Esta conta não possui privilégios de administrador.');
        setLoading(false);
        return;
      }

      updateUser(profile, data.session?.access_token);
      setVisible(false);
      setEmail('');
      setPassword('');
      navigate('/admin');
    } catch (err) {
      setError('Credenciais inválidas. Verifique seu e-mail e senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop + centering wrapper */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998] flex items-center justify-center p-4"
            onClick={() => setVisible(false)}
          >
          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden">
              {/* Top bar decorativa */}
              <div className="h-1 w-full bg-gradient-to-r from-red-500 via-orange-400 to-amber-400" />

              <div className="p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                      <Shield size={20} className="text-red-400" />
                    </div>
                    <div>
                      <h2 className="text-white font-black text-lg tracking-tight">Admin Access</h2>
                      <p className="text-slate-500 text-xs font-medium">EcoSphere Control Panel</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setVisible(false)}
                    className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@ecosphere.com"
                        autoComplete="off"
                        className="w-full pl-11 pr-4 py-3.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500/60 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                      Senha
                    </label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        autoComplete="off"
                        className="w-full pl-11 pr-12 py-3.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500/60 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 rounded-xl p-3"
                      >
                        <AlertCircle size={15} className="text-red-400 shrink-0 mt-0.5" />
                        <p className="text-red-300 text-xs font-medium leading-relaxed">{error}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                  >
                    {loading ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Shield size={18} />
                    )}
                    {loading ? 'Verificando...' : 'Acessar Painel'}
                  </button>
                </form>

                {/* Footer hint */}
                <p className="text-center text-slate-600 text-xs mt-6">
                  Pressione <kbd className="bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-slate-400 font-mono text-[10px]">Ctrl</kbd>
                  {' + '}<kbd className="bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-slate-400 font-mono text-[10px]">Shift</kbd>
                  {' + '}<kbd className="bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-slate-400 font-mono text-[10px]">A</kbd>
                  {' '}para fechar
                </p>
              </div>
            </div>
          </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AdminLoginPanel;
