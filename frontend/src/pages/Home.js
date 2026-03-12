import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { Users, TrendingUp, TreePine } from 'lucide-react';
import { AppIcon } from '../components/ui/AppIcon';
import EcoGlobeLogo from '../components/ui/EcoGlobeLogo';
import DashboardGlobeCard from '../components/globe/DashboardGlobeCard';
import FeaturesBento from '../components/home/FeaturesBento';

const Home = () => {
  const [stats, setStats] = useState({ users: 0, actions: 0, co2: 0 });

  const Icon = ({ name, className = "w-16 h-16", white = false }) => {
    const iconStyle = white ? { filter: 'brightness(0) invert(1)' } : { filter: 'invert(40%) sepia(93%) saturate(500%) hue-rotate(100deg)' };
    if (name === 'globo') {
      const size = className.includes('w-12') ? 48 : 64;
      return <EcoGlobeLogo size={size} className={className} style={iconStyle} />;
    }
    return (
      <img
        src={require(`../assets/icons/${name}.svg`)}
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
    <div className="min-h-screen bg-surface-50 overflow-x-hidden">
      {/* Hero - Clean AI Dashboard Background */}
      <div className="relative overflow-hidden min-h-[80vh] md:min-h-screen flex items-center -mt-20 md:-mt-[80px] pt-20 md:pt-[80px] bg-gradient-to-b from-stone-50 to-surface-50">
        {/* Decorative Light Blobs */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-teal-100/60 to-transparent rounded-full blur-[100px] pointer-events-none translate-x-1/3 -translate-y-1/3 opacity-80" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-green-100/60 to-transparent rounded-full blur-[80px] pointer-events-none -translate-x-1/3 translate-y-1/3 opacity-80" />
        <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] bg-gradient-to-r from-blue-50/40 to-transparent rounded-full blur-[60px] pointer-events-none -translate-y-1/2 opacity-60" />
        
        {/* Globo solto no hero (desktop) - fora do grid para poder ficar bem grande */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[min(75vw,960px)] h-[min(75vw,960px)] max-h-[85vh] pointer-events-none select-none hidden lg:block z-[1] opacity-90 drop-shadow-2xl">
          <DashboardGlobeCard id="wwd-canvas-home-desktop" />
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-20 z-10 flex items-center justify-start -mt-10"
        >
          <div className="w-fit max-w-xl text-center lg:text-left">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="relative lg:pr-8 lg:border-l-4 lg:border-green-500 lg:pl-8 rounded-r-xl"
              >
                <p className="text-sm font-black tracking-widest uppercase text-green-600 mb-4">
                  Sua jornada sustentável
                </p>
                <div className="flex items-center gap-4 mb-6 flex-wrap justify-center lg:justify-start">
                  <motion.div 
                    animate={{ y: [0, -6, 0] }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                    className="shrink-0 drop-shadow-md"
                  >
                    <EcoGlobeLogo 
                      size={80} 
                      className="text-green-600"
                    />
                  </motion.div>
                  <h1 className="text-5xl md:text-6xl lg:text-6xl xl:text-7xl font-black font-display tracking-tighter text-stone-800">
                    EcoSphere
                  </h1>
                </div>
                <div className="h-1.5 w-16 bg-gradient-to-r from-green-500 to-teal-400 rounded-full mb-6 lg:mx-0 mx-auto" />
                <p className="text-lg md:text-xl text-stone-500 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                  Transforme o mundo com <span className="text-green-600 font-bold">inteligência artificial</span>, 
                  dados em tempo real e <span className="text-teal-600 font-bold">ação sustentável</span>.
                </p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="flex flex-col sm:flex-row flex-nowrap gap-4 justify-center lg:justify-start items-center"
              >
                <Link 
                  to="/guia" 
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold rounded-2xl bg-green-500 text-white shadow-lg hover:shadow-xl hover:bg-green-600 active:scale-[0.98] transition-all whitespace-nowrap shrink-0"
                >
                  <Icon name="rocket" className="w-5 h-5 shrink-0" white />
                  <span>Começar Agora</span>
                </Link>
                <Link 
                  to="/classificar-residuos" 
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold rounded-2xl border-2 border-stone-200 text-stone-600 bg-white hover:bg-stone-50 hover:border-stone-300 transition-all shadow-sm whitespace-nowrap shrink-0"
                >
                  <AppIcon name="camera" size={20} className="text-stone-500 shrink-0" />
                  <span>Testar IA Grátis</span>
                </Link>
              </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Globe card mobile - Massive Size */}
      <div className="relative z-10 lg:hidden w-full flex justify-center items-center pb-8" style={{ marginTop: '-80px', height: '350px' }}>
        <div className="w-[500px] h-[500px] sm:w-[600px] sm:h-[600px] shrink-0 pointer-events-none opacity-90 drop-shadow-2xl">
          <DashboardGlobeCard id="wwd-canvas-home-mobile" />
        </div>
      </div>

      <FeaturesBento />

      {/* Stats Section - Impacto da Comunidade */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="section-container py-16"
      >
        <div className="bg-gradient-to-br from-eco-600 via-teal-600 to-eco-700 p-6 sm:p-8 md:p-16 rounded-3xl shadow-soft-lg text-white relative overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none rounded-3xl"
            style={{
              backgroundImage: 'radial-gradient(rgba(255,255,255,0.15) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
            aria-hidden
          />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50 rounded-3xl" aria-hidden />
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
              { IconComp: Users, label: 'Usuários Ativos', countUp: { end: 2847, separator: ',' } },
              { IconComp: TrendingUp, label: 'Ações Sustentáveis', countUp: { end: 15392, separator: ',' } },
              { IconComp: TreePine, label: 'CO₂ Evitado', suffix: ' ton', countUp: { end: 8.2, decimals: 1 } },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
              >
                <div className="w-14 h-14 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center mx-auto mb-4">
                  <stat.IconComp size={28} className="text-white/90" aria-hidden />
                </div>
                <div className="text-4xl font-bold mb-2">
                  <CountUp
                    start={0}
                    end={stat.countUp.end}
                    duration={2.5}
                    separator={stat.countUp.separator}
                    decimals={stat.countUp.decimals}
                    enableScrollSpy
                    scrollSpyOnce
                  />
                  {stat.suffix || ''}
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
        <div className="card p-8 sm:p-12 md:p-16 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-stone-800 flex items-center justify-center gap-3">
            <EcoGlobeLogo size={48} style={{ filter: 'invert(40%) sepia(93%) saturate(500%) hue-rotate(100deg)' }} />
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
