import React from 'react';
import { motion } from 'framer-motion';
import { Leaf, Shield, BarChart3, MapPin, CheckCircle2 } from 'lucide-react';

const icons = [
  { Icon: Leaf, label: 'Sustentabilidade' },
  { Icon: Shield, label: 'Confiabilidade' },
  { Icon: BarChart3, label: 'Métricas' },
  { Icon: MapPin, label: 'Localização' },
  { Icon: CheckCircle2, label: 'Validação' },
];

const CarbonInfoCard = () => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.1 }}
    className="bg-gradient-to-br from-eco-50 to-teal-50 border border-eco-100 rounded-3xl p-6 sm:p-8 shadow-soft"
  >
    <div className="flex flex-wrap gap-3 mb-5">
      {icons.map(({ Icon, label }) => (
        <div
          key={label}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/80 border border-eco-100"
          title={label}
        >
          <Icon size={16} className="text-eco-600" />
          <span className="text-xs font-medium text-eco-700 hidden sm:inline">{label}</span>
        </div>
      ))}
    </div>

    <p className="text-sm text-stone-700 leading-relaxed mb-4">
      Este cadastro organiza os dados-base de um projeto ambiental. Nesta etapa, o sistema ainda não emite créditos de carbono oficialmente. O objetivo é estruturar informações técnicas para que, futuramente, o projeto possa receber cálculos de CO₂e, evidências, documentos e relatórios de confiabilidade.
    </p>

    <p className="text-xs text-stone-500 leading-relaxed border-t border-eco-100 pt-4">
      O Cadastro de Projeto é a primeira etapa para estruturar uma jornada de MRV Digital. Aqui são organizadas as informações essenciais do projeto ambiental, permitindo que futuramente o sistema realize cálculos de CO₂e, registre evidências, acompanhe o monitoramento e gere relatórios de confiabilidade.
    </p>
  </motion.div>
);

export default CarbonInfoCard;
