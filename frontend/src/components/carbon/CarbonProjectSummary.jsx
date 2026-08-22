import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import CarbonChecklist from './CarbonChecklist';

const SummaryRow = ({ label, value }) => (
  <AnimatePresence mode="wait">
    <motion.div
      key={value}
      initial={{ opacity: 0, x: -4 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="flex justify-between gap-4 py-2 border-b border-stone-100 last:border-0"
    >
      <span className="text-xs text-stone-400 shrink-0">{label}</span>
      <span className="text-sm text-stone-800 text-right font-medium">{value}</span>
    </motion.div>
  </AnimatePresence>
);

const CarbonProjectSummary = ({ summary }) => (
  <div className="space-y-6">
    <div className="bg-white border border-stone-100 rounded-3xl p-6 shadow-soft">
      <h3 className="text-sm font-bold text-stone-800 uppercase tracking-wider mb-4">
        Resumo do Projeto
      </h3>
      <div className="space-y-1">
        <SummaryRow label="Nome" value={summary.nome} />
        <SummaryRow label="Tipo" value={summary.tipo} />
        <SummaryRow label="Status" value={summary.status} />
        <SummaryRow label="Área" value={summary.area} />
        <SummaryRow label="Localização" value={summary.localizacao} />
        <SummaryRow label="Potencial" value={summary.potencial} />
      </div>
    </div>

    <div className="bg-white border border-stone-100 rounded-3xl p-6 shadow-soft">
      <h3 className="text-sm font-bold text-stone-800 uppercase tracking-wider mb-4">
        Próximas etapas
      </h3>
      <CarbonChecklist />
    </div>

    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="flex gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-100"
    >
      <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
      <div>
        <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">
          Etapa inicial
        </p>
        <p className="text-xs text-stone-600 leading-relaxed">
          Cadastro inicial ativo. Sem emissão de créditos oficiais nesta fase.
        </p>
      </div>
    </motion.div>
  </div>
);

export default CarbonProjectSummary;
