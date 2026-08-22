import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Save, Check, AlertTriangle, Loader2, Leaf } from 'lucide-react';
import CarbonStatusBadge from '../components/carbon/CarbonStatusBadge';
import CarbonInfoCard from '../components/carbon/CarbonInfoCard';
import CarbonProjectForm from '../components/carbon/CarbonProjectForm';
import CarbonProjectSummary from '../components/carbon/CarbonProjectSummary';
import { useCarbonProjectForm } from '../components/carbon/useCarbonProjectForm';

const CarbonProjectRegistration = () => {
  const navigate = useNavigate();
  const { formData, handleChange, getSummary, handleSaveMock } = useCarbonProjectForm();
  const [notification, setNotification] = useState(null);
  const [saving, setSaving] = useState(false);

  const summary = getSummary();

  const showNotification = (message, type = 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleCancel = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/dashboard');
    }
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    const result = handleSaveMock();
    showNotification(result.message, result.type);
    setSaving(false);
  };

  return (
    <div className="min-h-screen w-full bg-stone-50 py-8 md:py-12 [color-scheme:light]">
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4"
          >
            <div className={`p-4 rounded-2xl shadow-soft-lg border flex items-start gap-3 ${
              notification.type === 'success'
                ? 'bg-white border-eco-200 text-stone-800'
                : notification.type === 'warning'
                ? 'bg-white border-amber-200 text-stone-800'
                : 'bg-white border-red-200 text-stone-800'
            }`}>
              <div className="shrink-0 mt-0.5">
                {notification.type === 'success' ? (
                  <Check size={20} className="text-eco-600" />
                ) : (
                  <AlertTriangle size={20} className={notification.type === 'warning' ? 'text-amber-500' : 'text-red-500'} />
                )}
              </div>
              <p className="text-sm font-medium flex-1">{notification.message}</p>
              <button
                type="button"
                onClick={() => setNotification(null)}
                className="shrink-0 text-stone-400 hover:text-stone-600 transition-colors"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="section-container">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-eco-500 to-teal-600 flex items-center justify-center shadow-lg shadow-eco-500/20">
                  <Leaf size={20} className="text-white" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-stone-800 tracking-tight">
                  Cadastro de Projeto
                </h1>
                <CarbonStatusBadge />
              </div>
              <p className="text-sm text-stone-500 max-w-2xl leading-relaxed">
                Registre as informações iniciais do projeto ambiental para futura medição, relato e verificação de carbono.
              </p>
            </div>

            <div className="hidden lg:flex flex-wrap gap-3 shrink-0">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCancel}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-stone-600 bg-white border border-stone-200 hover:bg-stone-50 transition-colors"
              >
                <ArrowLeft size={16} />
                Voltar
              </motion.button>
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-eco-600 to-teal-600 hover:shadow-glow transition-all disabled:opacity-70"
              >
                {saving ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                Salvar projeto
              </motion.button>
            </div>
          </div>
        </motion.header>

        <div className="mb-8">
          <CarbonInfoCard />
        </div>

        <form onSubmit={handleSave} className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <CarbonProjectForm formData={formData} onChange={handleChange} />
          </div>

          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24">
              <CarbonProjectSummary summary={summary} />
            </div>
          </div>

          <div className="lg:hidden flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-stone-600 bg-white border border-stone-200"
            >
              <ArrowLeft size={16} />
              Voltar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-eco-600 to-teal-600 disabled:opacity-70"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Salvar projeto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CarbonProjectRegistration;
