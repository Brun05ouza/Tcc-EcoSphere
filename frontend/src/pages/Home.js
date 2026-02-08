import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Camera, Leaf, Users, TrendingUp, TreePine } from 'lucide-react';
import { AppIcon } from '../components/ui/AppIcon';

const Home = () => {
  const [stats, setStats] = useState({ users: 0, actions: 0, co2: 0 });
  const [isVisible, setIsVisible] = useState(false);

  const Icon = ({ name, className = "w-16 h-16", white = false }) => {
    const iconStyle = white ? { filter: 'brightness(0) invert(1)' } : { filter: 'invert(40%) sepia(93%) saturate(500%) hue-rotate(100deg)' };
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
    setIsVisible(true);
    // Animação dos números
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="container mx-auto px-4 py-16 text-center"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-6xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-6 flex items-center justify-center gap-3">
            <Icon name="earth" className="w-16 h-16" />
            EcoSphere Web
          </h1>
          <p className="text-2xl text-gray-700 mb-8 max-w-3xl mx-auto">
            Transforme o mundo com <span className="text-green-600 font-semibold">inteligência artificial</span>, 
            dados em tempo real e <span className="text-blue-600 font-semibold">ação sustentável</span>
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
        >
          <Link 
            to="/guia" 
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center gap-2 justify-center"
          >
            <Icon name="rocket" className="w-5 h-5" white />
            Começar Agora
          </Link>
          <Link 
            to="/classificar-residuos" 
            className="bg-white border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center gap-2 justify-center"
          >
            <Camera size={22} />
            Testar IA
          </Link>
        </motion.div>
      </motion.div>

      {/* Features Grid */}
      <div className="container mx-auto px-4 mb-16">
        <motion.h2 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-bold text-center mb-12 text-gray-800 flex items-center justify-center gap-3"
        >
          <Icon name="rocket" className="w-10 h-10" />
          Funcionalidades Principais
        </motion.h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: "monitoramento", iconName: "globe", title: "Monitoramento Ambiental", desc: "Dados em tempo real de temperatura, qualidade do ar e mais", color: "from-blue-500 to-cyan-500" },
            { icon: "IA", iconName: "bot", title: "IA para Resíduos", desc: "Classifique resíduos automaticamente com visão computacional", color: "from-green-500 to-emerald-500" },
            { icon: "ecopoints", iconName: "trophy", title: "Gamificação", desc: "Ganhe EcoPoints e badges por ações sustentáveis", color: "from-yellow-500 to-orange-500" },
            { icon: "educacao", iconName: "graduation", title: "Educação", desc: "Cursos e desafios para aprender sobre sustentabilidade", color: "from-purple-500 to-pink-500" }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -10, scale: 1.05 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 text-center group relative overflow-hidden"
            >
              <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-40 transition-opacity">
                <AppIcon name={feature.iconName} size={28} className="text-gray-600" />
              </div>
              <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300 shadow-lg p-3`}>
                <Icon name={feature.icon} className="w-full h-full" white />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="container mx-auto px-4 mb-16"
      >
        <div className="bg-gradient-to-r from-green-600 to-blue-600 p-12 rounded-3xl shadow-2xl text-white">
          <motion.h2 
            initial={{ y: 30 }}
            whileInView={{ y: 0 }}
            className="text-4xl font-bold text-center mb-12"
          >
            <span className="flex items-center justify-center gap-2">
              <Leaf size={36} className="text-white" />
              Impacto da Comunidade
            </span>
          </motion.h2>
          
          <div className="grid md:grid-cols-3 gap-8 text-center">
            {[
              { IconComp: Users, value: stats.users.toLocaleString(), label: "Usuários Ativos", suffix: "" },
              { IconComp: TrendingUp, value: stats.actions.toLocaleString(), label: "Ações Sustentáveis", suffix: "" },
              { IconComp: TreePine, value: stats.co2, label: "CO₂ Evitado", suffix: " ton" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl hover:bg-white/20 transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute top-2 right-2 opacity-30">
                  <stat.IconComp size={28} className="text-white" />
                </div>
                <stat.IconComp size={48} className="mx-auto mb-4 text-white/90" />
                <div className="text-4xl font-bold mb-2">
                  {stat.value}{stat.suffix}
                </div>
                <div className="text-white/80 text-lg">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
      
      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="container mx-auto px-4 text-center pb-16"
      >
        <div className="bg-white p-12 rounded-3xl shadow-xl">
          <h2 className="text-3xl font-bold mb-6 text-gray-800 flex items-center justify-center gap-2">
            Pronto para fazer a diferença? <Icon name="earth" className="w-8 h-8" />
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Junte-se à nossa comunidade e comece a transformar o mundo com pequenas ações sustentáveis!
          </p>
          <Link 
            to="/guia" 
            className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-12 py-4 rounded-2xl text-xl font-semibold shadow-lg transform hover:scale-105 transition-all duration-300"
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