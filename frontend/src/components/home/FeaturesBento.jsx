import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Sparkles, Trophy, GraduationCap, Calculator, History, Thermometer, Wind, Gauge } from 'lucide-react';

export default function FeaturesBento() {
  return (
    <section className="py-20 bg-slate-50" aria-labelledby="features-bento-heading">
      <div className="max-w-7xl mx-auto px-6">
        <h2 id="features-bento-heading" className="text-3xl font-bold text-center mb-12 text-slate-900">
          Funcionalidades <span className="text-emerald-500">Principais</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Monitoramento - card grande */}
          <motion.div
            whileHover={{ y: -6 }}
            transition={{ duration: 0.2 }}
            className="md:col-span-2 md:row-span-2 bg-white rounded-2xl p-8 shadow-lg border border-slate-200/60"
          >
            <BarChart3 className="w-10 h-10 text-blue-500 mb-4" aria-hidden />
            <h3 className="text-xl font-semibold mb-2 text-slate-900">
              Monitoramento Ambiental
            </h3>
            <p className="text-slate-600">
              Dados em tempo real da qualidade do ar,
              temperatura e indicadores ambientais.
            </p>
            <div className="mt-6 grid grid-cols-3 gap-3" aria-hidden>
              <div className="flex flex-col items-center justify-center rounded-lg bg-slate-50 border border-slate-200/60 p-3">
                <Thermometer className="w-5 h-5 text-blue-500 mb-1" />
                <span className="text-xs font-medium text-slate-500">Temp.</span>
                <span className="text-sm font-semibold text-slate-800">24 °C</span>
              </div>
              <div className="flex flex-col items-center justify-center rounded-lg bg-slate-50 border border-slate-200/60 p-3">
                <Gauge className="w-5 h-5 text-emerald-500 mb-1" />
                <span className="text-xs font-medium text-slate-500">Qual. ar</span>
                <span className="text-sm font-semibold text-slate-800">Boa</span>
              </div>
              <div className="flex flex-col items-center justify-center rounded-lg bg-slate-50 border border-slate-200/60 p-3">
                <Wind className="w-5 h-5 text-cyan-500 mb-1" />
                <span className="text-xs font-medium text-slate-500">Vento</span>
                <span className="text-sm font-semibold text-slate-800">12 km/h</span>
              </div>
            </div>
          </motion.div>

          {/* IA */}
          <motion.div
            whileHover={{ y: -6 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200/60"
          >
            <Sparkles className="w-9 h-9 text-emerald-500 mb-3" aria-hidden />
            <h3 className="font-semibold text-slate-900">
              IA para Resíduos
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              Classifique resíduos automaticamente
              com visão computacional.
            </p>
          </motion.div>

          {/* Gamificação */}
          <motion.div
            whileHover={{ y: -6 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200/60"
          >
            <Trophy className="w-9 h-9 text-orange-500 mb-3" aria-hidden />
            <h3 className="font-semibold text-slate-900">
              Gamificação
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              Ganhe EcoPoints e conquistas
              por ações sustentáveis.
            </p>
          </motion.div>

          {/* Educação */}
          <motion.div
            whileHover={{ y: -6 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200/60"
          >
            <GraduationCap className="w-9 h-9 text-purple-500 mb-3" aria-hidden />
            <h3 className="font-semibold text-slate-900">
              Educação
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              Cursos e desafios para aprender
              sobre sustentabilidade.
            </p>
          </motion.div>

          {/* Calculadora de Carbono */}
          <motion.div
            whileHover={{ y: -6 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200/60"
          >
            <Calculator className="w-9 h-9 text-teal-500 mb-3" aria-hidden />
            <h3 className="font-semibold text-slate-900">
              Calculadora de Carbono
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              Calcule sua pegada de carbono
              e veja como compensar.
            </p>
          </motion.div>

          {/* Histórico */}
          <motion.div
            whileHover={{ y: -6 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200/60"
          >
            <History className="w-9 h-9 text-slate-600 mb-3" aria-hidden />
            <h3 className="font-semibold text-slate-900">
              Histórico
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              Acompanhe suas classificações
              e evolução ao longo do tempo.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
