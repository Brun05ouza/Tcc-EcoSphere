import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, TrendingUp, TreePine } from 'lucide-react';
import { AppIcon } from '../components/ui/AppIcon';
import DashboardGlobeCard from '../components/globe/DashboardGlobeCard';

const Home = () => {
  const [stats, setStats] = useState({ users: 0, actions: 0, co2: 0 });

  const Icon = ({ name, className = "w-16 h-16", white = false }) => {
    const iconStyle = white ? { filter: 'brightness(0) invert(1)' } : { filter: 'invert(40%) sepia(93%) saturate(500%) hue-rotate(100deg)' };
    const src = name === 'globo' 
      ? require('../assets/icons/globo-icon.png') 
      : require(`../assets/icons/${name}.svg`);
    return (
      <img 
        src={src} 
        alt={name} 
        className={className}
        style={iconStyle}
      />
    );
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setStats(prev => ({
        users: prev.users < 2847 ? prev.users + 47 : 2847,
        actions: prev.actions < 15392 ? prev.actions + 253 : 15392,
        co2: prev.co2 < 8.2 ? +(prev.co2 + 0.13).toFixed(1) : 8.2
      }));
    }, 50);
    setTimeout(() => clearInterval(timer), 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Hero - Background mesh */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh opacity-60" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-eco-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl" />
        
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative section-container py-20 md:py-28"
        >
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-6 text-center lg:text-left">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="mb-8"
              >
                <motion.div 
                  animate={{ y: [0, -8, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  className="inline-block mb-6"
                >
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-eco-500 to-teal-500 flex items-center justify-center shadow-soft p-2">
                    <img 
                      src={require('../assets/icons/globo-icon.png')} 
                      alt="EcoSphere" 
                      className="w-full h-full object-contain"
                      style={{ filter: 'brightness(0) invert(1)' }}
                    />
                  </div>
                </motion.div>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 font-display">
                  <span className="bg-gradient-to-r from-eco-700 via-teal-600 to-eco-700 bg-clip-text text-transparent">
                    EcoSphere
                  </span>
                </h1>
                <p className="text-xl md:text-2xl text-stone-600 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                  Transforme o mundo com <span className="text-eco-600 font-semibold">inteligência artificial</span>, 
                  dados em tempo real e <span className="text-teal-600 font-semibold">ação sustentável</span>
                </p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              >
                <Link 
                  to="/guia" 
                  className="btn-primary px-8 py-4 text-lg"
                >
                  <Icon name="rocket" className="w-5 h-5" white />
                  Começar Agora
                </Link>
                <Link 
                  to="/classificar-residuos" 
                  className="btn-secondary px-8 py-4 text-lg"
                >
                  <AppIcon name="camera" size={22} />
                  Testar IA
                </Link>
              </motion.div>
            </div>
            <div className="lg:col-span-6 hidden lg:flex lg:items-center lg:justify-end lg:min-w-0">
              <DashboardGlobeCard />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Globe card mobile */}
      <div className="section-container pb-8 lg:hidden">
        <DashboardGlobeCard />
      </div>

      {/* Features Grid */}
      <div className="section-container py-16 md:py-24">
        <motion.h2 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold text-center mb-16 text-stone-800 flex items-center justify-center gap-3"
        >
          <Icon name="rocket" className="w-10 h-10 text-eco-600" />
          Funcionalidades Principais
        </motion.h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {[
            { icon: "monitoramento", iconName: "globe", title: "Monitoramento Ambiental", desc: "Dados em tempo real de temperatura, qualidade do ar e mais", color: "from-blue-500 to-cyan-500" },
            { icon: "IA", iconName: "bot", title: "IA para Resíduos", desc: "Classifique resíduos automaticamente com visão computacional", color: "from-eco-500 to-emerald-500" },
            { icon: "ecopoints", iconName: "trophy", title: "Gamificação", desc: "Ganhe EcoPoints e badges por ações sustentáveis", color: "from-amber-500 to-orange-500" },
            { icon: "educacao", iconName: "graduation", title: "Educação", desc: "Cursos e desafios para aprender sobre sustentabilidade", color: "from-violet-500 to-purple-500" }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="card-hover p-8 text-center group"
            >
              <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-soft group-hover:shadow-soft-lg transition-shadow`}>
                <Icon name={feature.icon} className="w-8 h-8" white />
              </div>
              <h3 className="text-xl font-bold mb-3 text-stone-800">{feature.title}</h3>
              <p className="text-stone-600 leading-relaxed text-sm">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="section-container py-16"
      >
        <div className="bg-gradient-to-br from-eco-600 via-teal-600 to-eco-700 p-12 md:p-16 rounded-3xl shadow-soft-lg text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
          <motion.h2 
            initial={{ y: 20 }}
            whileInView={{ y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-center mb-12 relative"
          >
            Impacto da Comunidade
          </motion.h2>
          
          <div className="grid md:grid-cols-3 gap-8 text-center relative">
            {[
              { IconComp: Users, value: stats.users.toLocaleString(), label: "Usuários Ativos" },
              { IconComp: TrendingUp, value: stats.actions.toLocaleString(), label: "Ações Sustentáveis" },
              { IconComp: TreePine, value: stats.co2, label: "CO₂ Evitado", suffix: " ton" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                whileHover={{ scale: 1.05 }}
                className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/20 hover:bg-white/15 transition-colors"
              >
                <stat.IconComp size={48} className="mx-auto mb-4 text-white/90" />
                <div className="text-4xl font-bold mb-2">
                  {stat.value}{stat.suffix || ''}
                </div>
                <div className="text-white/80 text-lg">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
      
      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="section-container py-16 md:py-24"
      >
        <div className="card p-12 md:p-16 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-stone-800 flex items-center justify-center gap-3">
            <img src={require('../assets/icons/globo-icon.png')} alt="" className="w-12 h-12 object-contain" style={{ filter: 'invert(40%) sepia(93%) saturate(500%) hue-rotate(100deg)' }} />
            Pronto para fazer a diferença?
          </h2>
          <p className="text-xl text-stone-600 mb-10 max-w-2xl mx-auto">
            Junte-se à nossa comunidade e comece a transformar o mundo com pequenas ações sustentáveis!
          </p>
          <Link 
            to="/guia" 
            className="btn-primary px-12 py-4 text-xl"
          >
            <Icon name="rocket" className="w-6 h-6" white />
            Começar Jornada Sustentável
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Home;
