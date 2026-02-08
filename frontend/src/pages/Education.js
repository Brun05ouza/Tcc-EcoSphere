import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import InteractiveCourse from '../components/InteractiveCourse';
import { AppIcon } from '../components/ui/AppIcon';
import { BookOpen, Check } from 'lucide-react';

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
      iconName: 'globe',
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4 flex items-center justify-center gap-3">
            <BookOpen size={48} className="text-green-600" />
            Educação Ambiental
          </h1>
          <p className="text-xl text-gray-600">Aprenda, pratique e transforme o mundo!</p>
        </motion.div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-2xl p-2 shadow-lg">
            {[
              { id: 'courses', label: 'Cursos', iconName: 'book' },
              { id: 'challenges', label: 'Desafios', iconName: 'trophy' },
              { id: 'tips', label: 'Dicas', iconName: 'lightbulb' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-6 py-3 rounded-xl transition-all flex items-center ${
                  selectedCategory === tab.id
                    ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <AppIcon name={tab.iconName} size={20} className="mr-2" />
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
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer"
                  onClick={() => {
                    setSelectedCourse(course);
                    setShowInteractiveCourse(true);
                  }}
                >
                  <div className={`h-32 bg-gradient-to-r ${course.color} flex items-center justify-center`}>
                    <AppIcon name={course.iconName} size={56} className="text-white" />
                  </div>
                  
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg">{course.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        course.level === 'Iniciante' ? 'bg-green-100 text-green-800' :
                        course.level === 'Intermediário' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {course.level}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4">{course.description}</p>
                    
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm text-gray-500">
                        <i className="bi bi-clock mr-1"></i>
                        {course.duration}
                      </span>
                      <span className="text-sm font-medium text-blue-600">
                        {course.progress}% concluído
                      </span>
                    </div>
                    
                    {course.progress > 0 && (
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    )}
                    
                    <button className={`w-full py-2 px-4 rounded-xl font-medium transition-all ${
                      course.progress > 0 
                        ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}>
                      {course.progress > 0 ? 'Continuar' : 'Iniciar Curso'}
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
                    whileHover={{ y: -5, scale: 1.02 }}
                    className="bg-white rounded-2xl shadow-lg p-6"
                  >
                    <div className="text-center mb-4">
                      <div className="mb-2 flex justify-center"><AppIcon name={challenge.iconName} size={48} className="text-green-600" /></div>
                      <h3 className="font-bold text-lg">{challenge.title}</h3>
                      {isParticipating && (
                        <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                          <Check size={14} /> Participando
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4 text-center">{challenge.description}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Recompensa:</span>
                        <span className="font-bold text-green-600">+{challenge.reward} EcoPoints</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Duração:</span>
                        <span className="font-medium">{challenge.duration}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Dificuldade:</span>
                        <span className={`font-medium ${
                          challenge.difficulty === 'Fácil' ? 'text-green-600' :
                          challenge.difficulty === 'Médio' ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {challenge.difficulty}
                        </span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="text-xs font-bold text-gray-700 mb-2">Tarefas:</h4>
                      <ul className="space-y-1">
                        {challenge.tasks.map((task, idx) => (
                          <li key={idx} className="text-xs text-gray-600 flex items-start gap-2">
                            <Check size={14} className="text-green-500 mt-0.5 shrink-0" />
                            <span>{task}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <button 
                      onClick={() => handleChallengeClick(challenge.id)}
                      className={`w-full py-2 px-4 rounded-xl font-medium transition-all ${
                        isParticipating
                          ? 'bg-gray-400 hover:bg-gray-500 text-white'
                          : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
                      }`}
                    >
                      {isParticipating ? 'Sair do Desafio' : 'Participar do Desafio'}
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
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden"
                >
                  <div className={`h-24 bg-gradient-to-r ${tip.color} flex items-center justify-center`}>
                    <AppIcon name={tip.iconName} size={40} className="text-white" />
                  </div>
                  
                  <div className="p-5">
                    <div className="mb-3">
                      <h3 className="font-bold text-lg mb-2">{tip.title}</h3>
                      <span className={`inline-block text-xs bg-gradient-to-r ${tip.color} text-white px-3 py-1 rounded-full font-medium`}>
                        {tip.category}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 text-sm leading-relaxed">{tip.content}</p>
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