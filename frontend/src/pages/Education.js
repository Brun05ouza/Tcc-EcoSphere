import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import InteractiveCourse from '../components/InteractiveCourse';
import { AppIcon } from '../components/ui/AppIcon';
import { BookOpen, Check, Sparkles, Clock, Target, PlayCircle, Lock, ArrowRight } from 'lucide-react';

const Education = () => {
  const [selectedCategory, setSelectedCategory] = useState('courses');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showInteractiveCourse, setShowInteractiveCourse] = useState(false);
  const [participatingChallenges, setParticipatingChallenges] = useState([]);

  const courses = [
    {
      id: 1,
      title: 'Reciclagem Básica',
      description: 'Aprenda os fundamentos da reciclagem e separação de resíduos',
      duration: '15 min',
      level: 'Iniciante',
      progress: 0,
      iconName: 'recycle',
      color: 'from-green-500 to-emerald-500',
      lessons: [
        'Introdução à Reciclagem',
        'Tipos de Materiais Recicláveis',
        'Como Separar Corretamente',
        'Pontos de Coleta'
      ]
    },
    {
      id: 2,
      title: 'Sustentabilidade Urbana',
      description: 'Descubra como ser mais sustentável na cidade',
      duration: '10 min',
      level: 'Intermediário',
      progress: 0,
      iconName: 'factory',
      color: 'from-blue-500 to-cyan-500',
      lessons: [
        'Mobilidade Sustentável',
        'Consumo Consciente',
        'Energia Renovável',
        'Jardins Urbanos'
      ]
    },
    {
      id: 3,
      title: 'Mudanças Climáticas',
      description: 'Entenda o impacto das mudanças climáticas e como agir',
      duration: '10 min',
      level: 'Avançado',
      progress: 0,
      iconName: 'thermometer',
      color: 'from-purple-500 to-pink-500',
      lessons: [
        'Causas das Mudanças Climáticas',
        'Efeitos no Meio Ambiente',
        'Ações Individuais',
        'Políticas Públicas'
      ]
    }
  ];

  const challenges = [
    {
      id: 1,
      title: 'Reciclagem Diária',
      description: 'Separe seu lixo corretamente por 7 dias consecutivos',
      reward: 150,
      duration: '7 dias',
      iconName: 'recycle',
      difficulty: 'Fácil',
      tasks: [
        'Separar plástico, papel, vidro e metal',
        'Lavar embalagens antes do descarte',
        'Descartar em lixeiras corretas',
        'Fotografar sua separação diária'
      ]
    },
    {
      id: 2,
      title: 'Economia de Água',
      description: 'Reduza seu consumo de água em 20% durante 15 dias',
      reward: 250,
      duration: '15 dias',
      iconName: 'droplets',
      difficulty: 'Médio',
      tasks: [
        'Banhos de no máximo 10 minutos',
        'Fechar torneira ao escovar dentes',
        'Reutilizar água quando possível',
        'Consertar vazamentos'
      ]
    },
    {
      id: 3,
      title: 'Transporte Verde',
      description: 'Use transporte público, bicicleta ou caminhada por 10 dias',
      reward: 200,
      duration: '10 dias',
      iconName: 'bike',
      difficulty: 'Médio',
      tasks: [
        'Evitar uso de carro particular',
        'Usar bicicleta ou caminhar',
        'Utilizar transporte público',
        'Compartilhar carona quando necessário'
      ]
    },
    {
      id: 4,
      title: 'Zero Plástico',
      description: 'Evite produtos com plástico descartável por 5 dias',
      reward: 180,
      duration: '5 dias',
      iconName: 'warning',
      difficulty: 'Difícil',
      tasks: [
        'Usar sacolas reutilizáveis',
        'Evitar canudos e copos plásticos',
        'Comprar produtos sem embalagem plástica',
        'Usar garrafas reutilizáveis'
      ]
    },
    {
      id: 5,
      title: 'Energia Consciente',
      description: 'Reduza consumo de energia em 15% durante 14 dias',
      reward: 220,
      duration: '14 dias',
      iconName: 'zap',
      difficulty: 'Médio',
      tasks: [
        'Desligar aparelhos da tomada',
        'Usar lâmpadas LED',
        'Aproveitar luz natural',
        'Regular temperatura do ar-condicionado'
      ]
    },
    {
      id: 6,
      title: 'Compostagem Caseira',
      description: 'Inicie e mantenha uma composteira por 21 dias',
      reward: 300,
      duration: '21 dias',
      iconName: 'leaf',
      difficulty: 'Difícil',
      tasks: [
        'Montar composteira',
        'Separar resíduos orgânicos',
        'Manter composteira adequadamente',
        'Produzir adubo orgânico'
      ]
    }
  ];

  const handleChallengeClick = (challengeId) => {
    if (participatingChallenges.includes(challengeId)) {
      setParticipatingChallenges(participatingChallenges.filter(id => id !== challengeId));
    } else {
      setParticipatingChallenges([...participatingChallenges, challengeId]);
    }
  };

  const tips = [
    {
      id: 1,
      title: 'Economize Água no Banho',
      content: 'Reduza o tempo de banho em 2 minutos e economize até 20 litros de água por dia.',
      category: 'Água',
      iconName: 'droplets',
      color: 'from-blue-400 to-cyan-400'
    },
    {
      id: 2,
      title: 'Reutilize Embalagens',
      content: 'Transforme potes de vidro em organizadores e reduza o desperdício.',
      category: 'Reciclagem',
      iconName: 'bottle',
      color: 'from-green-400 to-emerald-400'
    },
    {
      id: 3,
      title: 'Plante uma Árvore',
      content: 'Uma árvore pode absorver até 22kg de CO2 por ano. Plante e faça a diferença!',
      category: 'Natureza',
      iconName: 'tree',
      color: 'from-green-500 to-lime-500'
    },
    {
      id: 4,
      title: 'Sacolas Reutilizáveis',
      content: 'Use sacolas de pano nas compras e evite até 500 sacolas plásticas por ano.',
      category: 'Consumo',
      iconName: 'bag',
      color: 'from-purple-400 to-pink-400'
    },
    {
      id: 5,
      title: 'Desligue Aparelhos',
      content: 'Tire da tomada aparelhos em standby e economize até 12% na conta de luz.',
      category: 'Energia',
      iconName: 'plug',
      color: 'from-yellow-400 to-orange-400'
    },
    {
      id: 6,
      title: 'Compostagem Doméstica',
      content: 'Transforme restos orgânicos em adubo e reduza 50% do seu lixo.',
      category: 'Reciclagem',
      iconName: 'leaf',
      color: 'from-green-400 to-teal-400'
    },
    {
      id: 7,
      title: 'Evite Canudos Plásticos',
      content: 'Use canudos de metal ou bambu. Brasileiros descartam 1 bilhão de canudos/dia.',
      category: 'Consumo',
      iconName: 'bottle',
      color: 'from-red-400 to-pink-400'
    },
    {
      id: 8,
      title: 'Lâmpadas LED',
      content: 'Troque por LED e economize até 80% de energia com maior durabilidade.',
      category: 'Energia',
      iconName: 'lightbulb',
      color: 'from-yellow-300 to-amber-400'
    },
    {
      id: 9,
      title: 'Reaproveite Água da Chuva',
      content: 'Colete água da chuva para regar plantas e lavar áreas externas.',
      category: 'Água',
      iconName: 'rain',
      color: 'from-blue-500 to-indigo-500'
    },
    {
      id: 10,
      title: 'Compre Produtos Locais',
      content: 'Reduza emissões de transporte comprando de produtores locais.',
      category: 'Consumo',
      iconName: 'store',
      color: 'from-orange-400 to-red-400'
    },
    {
      id: 11,
      title: 'Evite Desperdício de Alimentos',
      content: 'Planeje refeições e aproveite sobras. 30% dos alimentos vão para o lixo.',
      category: 'Consumo',
      iconName: 'utensils',
      color: 'from-amber-400 to-orange-500'
    },
    {
      id: 12,
      title: 'Use Transporte Público',
      content: 'Um ônibus tira 40 carros da rua e reduz emissões em até 95%.',
      category: 'Mobilidade',
      iconName: 'bus',
      color: 'from-blue-400 to-purple-400'
    },
    {
      id: 13,
      title: 'Recicle Eletrônicos',
      content: 'Descarte celulares e baterias em pontos especializados. Contêm metais pesados.',
      category: 'Reciclagem',
      iconName: 'smartphone',
      color: 'from-gray-400 to-slate-500'
    },
    {
      id: 14,
      title: 'Reduza Uso de Papel',
      content: 'Prefira documentos digitais. Uma árvore produz apenas 8.333 folhas A4.',
      category: 'Consumo',
      iconName: 'file',
      color: 'from-slate-300 to-gray-400'
    },
    {
      id: 15,
      title: 'Lave Roupa com Água Fria',
      content: 'Economize até 90% da energia usada pela máquina de lavar.',
      category: 'Energia',
      iconName: 'shirt',
      color: 'from-cyan-400 to-blue-500'
    },
    {
      id: 16,
      title: 'Cultive Horta Caseira',
      content: 'Produza alimentos orgânicos em casa e reduza embalagens e transporte.',
      category: 'Natureza',
      iconName: 'salad',
      color: 'from-lime-400 to-green-500'
    },
    {
      id: 17,
      title: 'Evite Produtos Descartáveis',
      content: 'Prefira itens reutilizáveis: copos, talheres e pratos duráveis.',
      category: 'Consumo',
      iconName: 'utensils',
      color: 'from-pink-400 to-rose-500'
    },
    {
      id: 18,
      title: 'Doe o que Não Usa',
      content: 'Roupas e objetos em bom estado podem ter nova vida com outras pessoas.',
      category: 'Consumo',
      iconName: 'shirt',
      color: 'from-violet-400 to-purple-500'
    }
  ];

  const articles = [
    {
      id: 1,
      title: 'O Futuro da Energia Renovável',
      summary: 'Descubra como painéis solares de nova geração estão revolucionando a matriz energética.',
      readTime: '5 min',
      category: 'Inovação',
      imageUrl: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      color: 'text-amber-500',
      bgCategory: 'bg-amber-50 text-amber-700'
    },
    {
      id: 2,
      title: 'Economia Circular na Prática',
      summary: 'Empresas que transformaram resíduos em lucro através da logística reversa.',
      readTime: '8 min',
      category: 'Negócios',
      imageUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      color: 'text-blue-500',
      bgCategory: 'bg-blue-50 text-blue-700'
    },
    {
      id: 3,
      title: 'Biodiversidade Brasileira',
      summary: 'A importância da preservação dos biomas para o equilíbrio climático global.',
      readTime: '6 min',
      category: 'Meio Ambiente',
      imageUrl: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      color: 'text-green-500',
      bgCategory: 'bg-green-50 text-green-700'
    },
    {
      id: 4,
      title: 'Cidades Inteligentes',
      summary: 'Como o planejamento urbano está integrando natureza e tecnologia para qualidade de vida.',
      readTime: '7 min',
      category: 'Urbanismo',
      imageUrl: 'https://images.unsplash.com/photo-1449844908441-8829872d2607?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      color: 'text-purple-500',
      bgCategory: 'bg-purple-50 text-purple-700'
    }
  ];

  return (
    <div className="min-h-screen bg-surface-50 py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/20">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-stone-800 tracking-tight">
                Educação Ambiental
              </h1>
            </div>
            <p className="text-stone-500 ml-13 flex items-center gap-2">
              <Sparkles size={16} className="text-green-500" />
              <span>Aprenda, pratique e transforme o mundo com IA</span>
            </p>
          </div>
          
          <div className="bg-white px-5 py-2.5 rounded-2xl shadow-sm border border-stone-100 flex items-center gap-3 w-fit">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-sm font-medium text-stone-600">Trilhas de Estudo Ativas</span>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex flex-row flex-wrap gap-2 bg-stone-100/80 p-2 rounded-2xl border border-stone-200 backdrop-blur w-full max-w-full overflow-x-auto custom-scrollbar md:w-auto md:justify-center">
            {[
              { id: 'courses', label: 'Cursos', iconName: 'book', activeColor: 'text-green-500' },
              { id: 'articles', label: 'Artigos', iconName: 'file', activeColor: 'text-blue-500' },
              { id: 'challenges', label: 'Desafios', iconName: 'trophy', activeColor: 'text-amber-500' },
              { id: 'tips', label: 'Dicas Práticas', iconName: 'lightbulb', activeColor: 'text-purple-500' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 whitespace-nowrap shrink-0 ${
                  selectedCategory === tab.id
                    ? 'bg-white text-stone-800 shadow-sm border border-stone-200'
                    : 'text-stone-500 hover:text-stone-700 hover:bg-white/50 border border-transparent'
                }`}
              >
                <AppIcon name={tab.iconName} size={18} className={selectedCategory === tab.id ? tab.activeColor : 'text-stone-400'} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {selectedCategory === 'courses' && (
            <motion.div
              key="courses"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {courses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-3xl shadow-soft border border-stone-100 overflow-hidden cursor-pointer group transition-all duration-300 hover:shadow-lg hover:border-green-200 flex flex-col"
                  onClick={() => {
                    setSelectedCourse(course);
                    setShowInteractiveCourse(true);
                  }}
                >
                  <div className={`h-36 bg-gradient-to-br ${course.color} p-6 flex flex-col justify-between relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4" />
                    <div className="flex justify-between items-start relative z-10">
                      <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-sm">
                        <AppIcon name={course.iconName} size={26} />
                      </div>
                      <span className={`px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm backdrop-blur-md ${
                        course.level === 'Iniciante' ? 'bg-white/90 text-green-700' :
                        course.level === 'Intermediário' ? 'bg-white/90 text-yellow-700' :
                        'bg-white/90 text-red-700'
                      }`}>
                        {course.level}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="font-bold text-xl text-stone-800 mb-2 group-hover:text-green-600 transition-colors">{course.title}</h3>
                    <p className="text-stone-500 text-sm mb-6 flex-1">{course.description}</p>
                    
                    <div className="flex justify-between items-center mb-6 py-3 border-y border-stone-100">
                      <div className="flex items-center gap-2 text-sm font-medium text-stone-500">
                        <Clock size={16} className="text-stone-400" />
                        {course.duration}
                      </div>
                      <div className="text-sm font-bold text-green-600">
                        {course.progress}% concluído
                      </div>
                    </div>
                    
                    {course.progress > 0 && (
                      <div className="w-full bg-stone-100 rounded-full h-2.5 mb-6 overflow-hidden shadow-inner">
                        <div 
                          className="bg-gradient-to-r from-green-400 to-emerald-500 h-full rounded-full relative"
                          style={{ width: `${course.progress}%` }}
                        >
                          <div className="absolute inset-0 bg-white/20 w-full animate-pulse" />
                        </div>
                      </div>
                    )}
                    
                    <button className={`w-full py-3.5 px-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                      course.progress > 0 
                        ? 'bg-blue-50 hover:bg-blue-100 text-blue-700' 
                        : 'bg-green-500 hover:bg-green-600 text-white shadow-sm'
                    }`}>
                      <PlayCircle size={18} />
                      {course.progress > 0 ? 'Continuar Trilha' : 'Começar Agora'}
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {selectedCategory === 'challenges' && (
            <motion.div
              key="challenges"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {challenges.map((challenge, index) => {
                const isParticipating = participatingChallenges.includes(challenge.id);
                return (
                  <motion.div
                    key={challenge.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`bg-white rounded-3xl p-6 shadow-soft border transition-all duration-300 relative overflow-hidden flex flex-col ${
                      isParticipating ? 'border-amber-200' : 'border-stone-100 hover:border-amber-200 hover:shadow-lg'
                    }`}
                  >
                    {isParticipating && (
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-100/50 to-transparent rounded-bl-full pointer-events-none" />
                    )}
                    
                    <div className="flex items-start gap-4 mb-4 relative z-10">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${isParticipating ? 'bg-amber-100 text-amber-600' : 'bg-stone-100 text-stone-500'}`}>
                        <AppIcon name={challenge.iconName} size={28} />
                      </div>
                      <div className="flex-1 pt-1">
                        <h3 className="font-bold text-stone-800 text-lg leading-tight mb-1">{challenge.title}</h3>
                        {isParticipating && (
                          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-lg text-xs font-bold border border-amber-100">
                            <Target size={12} /> Em andamento
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-stone-500 text-sm mb-6 flex-1 relative z-10">{challenge.description}</p>
                    
                    <div className="grid grid-cols-2 gap-3 mb-6 relative z-10">
                      <div className="bg-stone-50 rounded-xl p-3 border border-stone-100">
                        <div className="text-xs font-bold text-stone-400 uppercase mb-1">Recompensa</div>
                        <div className="text-sm font-bold text-amber-600">+{challenge.reward} pts</div>
                      </div>
                      <div className="bg-stone-50 rounded-xl p-3 border border-stone-100">
                        <div className="text-xs font-bold text-stone-400 uppercase mb-1">Duração</div>
                        <div className="text-sm font-bold text-stone-700">{challenge.duration}</div>
                      </div>
                    </div>

                    <div className="mb-6 relative z-10">
                      <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">Requisitos:</h4>
                      <ul className="space-y-2">
                        {challenge.tasks.map((task, idx) => (
                          <li key={idx} className="text-sm text-stone-600 flex items-start gap-2.5">
                            <div className="mt-0.5 w-4 h-4 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                              <Check size={10} className="text-green-500 font-bold" />
                            </div>
                            <span className="leading-tight">{task}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <button 
                      onClick={() => handleChallengeClick(challenge.id)}
                      className={`w-full py-3.5 px-4 rounded-xl font-bold transition-all relative z-10 ${
                        isParticipating
                          ? 'bg-white border-2 border-stone-200 text-stone-500 hover:bg-stone-50'
                          : 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm'
                      }`}
                    >
                      {isParticipating ? 'Desistir do Desafio' : 'Aceitar Desafio'}
                    </button>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {selectedCategory === 'tips' && (
            <motion.div
              key="tips"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {tips.map((tip, index) => (
                <motion.div
                  key={tip.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-3xl p-6 shadow-soft border border-stone-100 hover:shadow-lg transition-all duration-300 group flex flex-col h-full"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${tip.color} flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform`}>
                      <AppIcon name={tip.iconName} size={28} className="text-white" />
                    </div>
                    <div className="pt-1">
                      <span className={`inline-block text-[10px] font-black uppercase tracking-wider text-stone-400 mb-1`}>
                        {tip.category}
                      </span>
                      <h3 className="font-bold text-stone-800 leading-tight">{tip.title}</h3>
                    </div>
                  </div>
                  
                  <p className="text-stone-500 text-sm leading-relaxed flex-1 bg-stone-50 p-4 rounded-2xl border border-stone-100">
                    {tip.content}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          )}

          {selectedCategory === 'articles' && (
            <motion.div
              key="articles"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid md:grid-cols-2 gap-8"
            >
              {articles.map((article, index) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-3xl shadow-soft border border-stone-100 overflow-hidden group hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col sm:flex-row h-full"
                >
                  <div className="sm:w-2/5 h-48 sm:h-auto relative overflow-hidden shrink-0">
                    <div className="absolute inset-0 bg-stone-900/10 group-hover:bg-transparent transition-colors z-10" />
                    <img 
                      src={article.imageUrl} 
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md ${article.bgCategory}`}>
                        {article.category}
                      </span>
                      <span className="text-xs font-bold text-stone-400 flex items-center gap-1">
                        <Clock size={12} /> {article.readTime}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-stone-800 mb-2 leading-tight group-hover:text-blue-600 transition-colors">
                      {article.title}
                    </h3>
                    
                    <p className="text-stone-500 text-sm mb-4 flex-1">
                      {article.summary}
                    </p>
                    
                    <div className="mt-auto flex items-center gap-2 text-sm font-bold text-blue-600 group-hover:gap-3 transition-all">
                      Ler Artigo Completo <ArrowRight size={16} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Interactive Course Modal */}
        <AnimatePresence>
          {showInteractiveCourse && selectedCourse && (
            <InteractiveCourse
              course={selectedCourse}
              onClose={() => {
                setShowInteractiveCourse(false);
                setSelectedCourse(null);
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Education;