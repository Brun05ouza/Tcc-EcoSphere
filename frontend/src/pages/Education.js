import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Education = () => {
  const [selectedCategory, setSelectedCategory] = useState('courses');
  const [selectedCourse, setSelectedCourse] = useState(null);

  const courses = [
    {
      id: 1,
      title: 'Reciclagem Básica',
      description: 'Aprenda os fundamentos da reciclagem e separação de resíduos',
      duration: '2h 30min',
      level: 'Iniciante',
      progress: 0,
      icon: '♾️',
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
      duration: '3h 15min',
      level: 'Intermediário',
      progress: 0,
      icon: '🏢',
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
      duration: '4h 00min',
      level: 'Avançado',
      progress: 0,
      icon: '🌍',
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
      title: 'Semana Verde',
      description: 'Complete 7 ações sustentáveis em uma semana',
      reward: 200,
      participants: 1247,
      timeLeft: '3 dias',
      icon: '🌱',
      difficulty: 'Fácil'
    },
    {
      id: 2,
      title: 'Zero Waste Challenge',
      description: 'Reduza seu lixo ao mínimo por 30 dias',
      reward: 500,
      participants: 892,
      timeLeft: '12 dias',
      icon: '🚮',
      difficulty: 'Difícil'
    },
    {
      id: 3,
      title: 'Transporte Sustentável',
      description: 'Use apenas transporte público ou bicicleta por 15 dias',
      reward: 300,
      participants: 654,
      timeLeft: '8 dias',
      icon: '🚲',
      difficulty: 'Médio'
    }
  ];

  const tips = [
    {
      id: 1,
      title: 'Economize Água no Banho',
      content: 'Reduza o tempo de banho em 2 minutos e economize até 20 litros de água por dia.',
      category: 'Casa',
      icon: '🚿'
    },
    {
      id: 2,
      title: 'Reutilize Embalagens',
      content: 'Transforme potes de vidro em organizadores e reduza o desperdício.',
      category: 'Reciclagem',
      icon: '🏺'
    },
    {
      id: 3,
      title: 'Plante uma Árvore',
      content: 'Uma árvore pode absorver até 22kg de CO2 por ano. Plante e faça a diferença!',
      category: 'Natureza',
      icon: '🌳'
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
          <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4">
            🎓 Educação Ambiental
          </h1>
          <p className="text-xl text-gray-600">Aprenda, pratique e transforme o mundo!</p>
        </motion.div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-2xl p-2 shadow-lg">
            {[
              { id: 'courses', label: 'Cursos', icon: 'bi-book' },
              { id: 'challenges', label: 'Desafios', icon: 'bi-trophy' },
              { id: 'tips', label: 'Dicas', icon: 'bi-lightbulb' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-6 py-3 rounded-xl transition-all ${
                  selectedCategory === tab.id
                    ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <i className={`${tab.icon} mr-2`}></i>
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
                  onClick={() => setSelectedCourse(course)}
                >
                  <div className={`h-32 bg-gradient-to-r ${course.color} flex items-center justify-center`}>
                    <span className="text-6xl">{course.icon}</span>
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
              {challenges.map((challenge, index) => (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="bg-white rounded-2xl shadow-lg p-6"
                >
                  <div className="text-center mb-4">
                    <div className="text-5xl mb-2">{challenge.icon}</div>
                    <h3 className="font-bold text-lg">{challenge.title}</h3>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 text-center">{challenge.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Recompensa:</span>
                      <span className="font-bold text-green-600">+{challenge.reward} EcoPoints</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Participantes:</span>
                      <span className="font-medium">{challenge.participants.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Tempo restante:</span>
                      <span className="font-medium text-orange-600">{challenge.timeLeft}</span>
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
                  
                  <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-2 px-4 rounded-xl font-medium transition-all">
                    Participar do Desafio
                  </button>
                </motion.div>
              ))}
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
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="bg-white rounded-2xl shadow-lg p-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-3xl">{tip.icon}</div>
                    <div>
                      <h3 className="font-bold">{tip.title}</h3>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {tip.category}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">{tip.content}</p>
                  
                  <div className="flex gap-2">
                    <button className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors">
                      ❤️ Curtir
                    </button>
                    <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors">
                      💬 Compartilhar
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Course Detail Modal */}
        <AnimatePresence>
          {selectedCourse && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setSelectedCourse(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl p-8 max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center mb-6">
                  <div className="text-5xl mb-4">{selectedCourse.icon}</div>
                  <h2 className="text-2xl font-bold mb-2">{selectedCourse.title}</h2>
                  <p className="text-gray-600">{selectedCourse.description}</p>
                </div>
                
                <div className="mb-6">
                  <h3 className="font-bold mb-3">Conteúdo do Curso:</h3>
                  <ul className="space-y-2">
                    {selectedCourse.lessons.map((lesson, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <i className="bi bi-play-circle text-green-500"></i>
                        {lesson}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedCourse(null)}
                    className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Fechar
                  </button>
                  <button className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-xl transition-colors">
                    Iniciar Agora
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Education;