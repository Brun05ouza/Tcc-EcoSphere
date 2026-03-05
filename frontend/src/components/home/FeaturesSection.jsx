import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Sparkles, Trophy, GraduationCap, Leaf } from 'lucide-react';

const FEATURES = [
  {
    title: 'Monitoramento Ambiental',
    desc: 'Dados em tempo real de temperatura, qualidade do ar e mais',
    gradient: 'from-blue-500 to-cyan-500',
    badges: ['Realtime', 'API'],
    Icon: BarChart3,
  },
  {
    title: 'IA para Resíduos',
    desc: 'Classifique resíduos automaticamente com visão computacional',
    gradient: 'from-emerald-500 to-teal-500',
    badges: ['AI Vision', 'Classifier'],
    Icon: Sparkles,
  },
  {
    title: 'Gamificação',
    desc: 'Ganhe EcoPoints e badges por ações sustentáveis',
    gradient: 'from-amber-500 to-orange-500',
    badges: ['EcoPoints', 'Badges'],
    Icon: Trophy,
  },
  {
    title: 'Educação',
    desc: 'Cursos e desafios para aprender sobre sustentabilidade',
    gradient: 'from-violet-500 to-fuchsia-500',
    badges: ['Learning', 'Quizzes'],
    Icon: GraduationCap,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.08 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

function FeaturesSection() {
  return (
    <section
      className="relative overflow-hidden py-16 md:py-20 bg-slate-50"
      aria-labelledby="features-heading"
    >
      {/* Radial gradients */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden
        style={{
          background: [
            'radial-gradient(ellipse 80% 50% at 20% 30%, rgba(16, 185, 129, 0.10) 0%, transparent 50%)',
            'radial-gradient(ellipse 70% 50% at 80% 70%, rgba(59, 130, 246, 0.10) 0%, transparent 50%)',
          ].join(', '),
        }}
      />
      {/* Decorative blobs */}
      <motion.div
        className="absolute top-1/4 left-0 w-72 h-72 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none -translate-x-1/2"
        aria-hidden
        animate={{ x: [0, -6, 0], y: [0, 10, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-1/4 right-0 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl pointer-events-none translate-x-1/3"
        aria-hidden
        animate={{ x: [0, 8, 0], y: [0, -6, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div
        className="absolute top-1/2 right-1/4 w-48 h-48 bg-emerald-300/15 rounded-full blur-3xl pointer-events-none"
        aria-hidden
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        {/* Title */}
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="text-center mb-12 md:mb-16"
        >
          <h2
            id="features-heading"
            className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 flex flex-wrap items-center justify-center gap-3 mb-3"
          >
            <Leaf className="w-9 h-9 text-emerald-600 shrink-0" aria-hidden />
            <span>Funcionalidades</span>
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Principais
            </span>
          </h2>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Ferramentas inteligentes para gerar impacto sustentável.
          </p>
        </motion.header>

        {/* Cards grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
        >
          {FEATURES.map((feature, index) => (
            <motion.article
              key={feature.title}
              variants={cardVariants}
              className="group rounded-2xl bg-white/80 backdrop-blur border border-slate-200/60 shadow-sm hover:shadow-xl hover:-translate-y-2 hover:ring-2 hover:ring-emerald-200/60 transition-all duration-300 p-6 md:p-8 text-center"
            >
              {/* Badges */}
              <div className="flex flex-wrap justify-center gap-2 mb-4">
                {feature.badges.map((badge) => (
                  <span
                    key={badge}
                    className="inline-flex items-center rounded-full bg-slate-100/70 text-slate-700 border border-slate-200/60 px-2.5 py-1 text-xs font-medium"
                  >
                    {badge}
                  </span>
                ))}
              </div>

              {/* Icon */}
              <motion.div
                className={`w-14 h-14 md:w-16 md:h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-md text-white group-hover:shadow-lg transition-shadow duration-300`}
                whileHover={{ rotate: 4, scale: 1.08 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              >
                <feature.Icon className="w-7 h-7 md:w-8 md:h-8" aria-hidden />
              </motion.div>

              <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-2">
                {feature.title}
              </h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                {feature.desc}
              </p>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default FeaturesSection;
