import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Guide = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const steps = [
    {
      id: 1,
      title: "Bem-vindo ao EcoSphere! 🌍",
      description: "Vamos começar sua jornada sustentável com práticas simples e eficazes.",
      content: "O EcoSphere foi criado para te ajudar a adotar práticas sustentáveis no dia a dia. Através de desafios, educação e gamificação, você vai aprender a fazer a diferença para o planeta!",
      action: "Começar Jornada",
      icon: "🌱"
    },
    {
      id: 2,
      title: "Aprenda a Classificar Resíduos",
      description: "Use nossa IA para identificar corretamente onde descartar cada tipo de lixo.",
      content: "A separação correta do lixo é fundamental para a reciclagem. Nossa IA te ajuda a identificar se um resíduo é plástico, papel, vidro ou metal, e onde descartá-lo.",
      action: "Classificar Primeiro Resíduo",
      icon: "🤖",
      route: "/classificar-residuos"
    },
    {
      id: 3,
      title: "Monitore o Meio Ambiente",
      description: "Acompanhe dados ambientais da sua região em tempo real.",
      content: "Fique por dentro da qualidade do ar, temperatura e umidade da sua cidade. Conhecimento é o primeiro passo para a ação!",
      action: "Ver Dados Ambientais",
      icon: "🌡️",
      route: "/monitoramento"
    },
    {
      id: 4,
      title: "Ganhe EcoPoints",
      description: "Complete desafios e ganhe pontos por suas ações sustentáveis.",
      content: "Cada ação conta! Classifique resíduos, complete quiz ecológicos e jogos para ganhar EcoPoints e subir no ranking.",
      action: "Explorar EcoPoints",
      icon: "🏆",
      route: "/gamificacao"
    },
    {
      id: 5,
      title: "Eduque-se Continuamente",
      description: "Acesse cursos, dicas e desafios para expandir seu conhecimento ambiental.",
      content: "Aprenda sobre sustentabilidade através de cursos interativos, dicas práticas e desafios que você pode aplicar no seu dia a dia.",
      action: "Começar a Aprender",
      icon: "📚",
      route: "/educacao"
    }
  ];

  const objectives = [
    {
      title: "Reduza seu Lixo",
      description: "Diminua em 30% a produção de resíduos em casa",
      tips: ["Use sacolas reutilizáveis", "Evite produtos descartáveis", "Compre apenas o necessário"],
      icon: "🗑️"
    },
    {
      title: "Economize Energia",
      description: "Reduza o consumo energético em 20%",
      tips: ["Desligue aparelhos da tomada", "Use lâmpadas LED", "Aproveite luz natural"],
      icon: "⚡"
    },
    {
      title: "Preserve a Água",
      description: "Diminua o consumo de água em 25%",
      tips: ["Banhos mais curtos", "Feche a torneira ao escovar dentes", "Reutilize água da chuva"],
      icon: "💧"
    },
    {
      title: "Transporte Sustentável",
      description: "Use transporte público ou bicicleta 3x por semana",
      tips: ["Caminhe distâncias curtas", "Use bike ou transporte público", "Compartilhe caronas"],
      icon: "🚲"
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAction = () => {
    const step = steps[currentStep];
    if (step.route) {
      navigate(step.route);
    } else {
      handleNext();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-800">Guia de Práticas Sustentáveis</h1>
            <span className="text-sm text-gray-600">
              Passo {currentStep + 1} de {steps.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <motion.div
              className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Current Step */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-white rounded-3xl shadow-xl p-8 mb-8"
        >
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">{steps[currentStep].icon}</div>
            <h2 className="text-3xl font-bold mb-4">{steps[currentStep].title}</h2>
            <p className="text-xl text-gray-600 mb-6">{steps[currentStep].description}</p>
            <p className="text-gray-700 leading-relaxed">{steps[currentStep].content}</p>
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                currentStep === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-500 text-white hover:bg-gray-600'
              }`}
            >
              ← Anterior
            </button>

            <button
              onClick={handleAction}
              className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg transition-all"
            >
              {steps[currentStep].action}
            </button>
          </div>
        </motion.div>

        {/* Objectives Section */}
        {currentStep === steps.length - 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-xl p-8"
          >
            <h2 className="text-2xl font-bold mb-6 text-center">🎯 Seus Objetivos Sustentáveis</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {objectives.map((objective, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all"
                >
                  <div className="flex items-center mb-4">
                    <span className="text-3xl mr-3">{objective.icon}</span>
                    <div>
                      <h3 className="font-bold text-lg">{objective.title}</h3>
                      <p className="text-sm text-gray-600">{objective.description}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-gray-700">Como fazer:</h4>
                    {objective.tips.map((tip, tipIndex) => (
                      <div key={tipIndex} className="flex items-center text-sm text-gray-600">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        {tip}
                      </div>
                    ))}
                  </div>
                  <button className="w-full mt-4 bg-green-100 text-green-800 py-2 rounded-lg font-medium hover:bg-green-200 transition-colors">
                    Aceitar Desafio
                  </button>
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-8">
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-lg transition-all"
              >
                🚀 Ir para o Dashboard
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Guide;