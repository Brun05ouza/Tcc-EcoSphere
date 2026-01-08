import React, { useState } from 'react';
import { motion } from 'framer-motion';

const CarbonCalculator = () => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  const questions = [
    {
      id: 'transport',
      title: 'Transporte',
      question: 'Como você se desloca diariamente?',
      icon: '🚗',
      options: [
        { label: 'Carro próprio (gasolina)', value: 2.3, icon: '🚗' },
        { label: 'Carro próprio (flex/etanol)', value: 1.5, icon: '🚙' },
        { label: 'Transporte público', value: 0.5, icon: '🚌' },
        { label: 'Bicicleta/Caminhada', value: 0, icon: '🚲' },
        { label: 'Moto', value: 1.2, icon: '🏍️' }
      ]
    },
    {
      id: 'energy',
      title: 'Energia',
      question: 'Qual seu consumo mensal de energia?',
      icon: '⚡',
      options: [
        { label: 'Até 100 kWh', value: 0.3, icon: '💡' },
        { label: '100-200 kWh', value: 0.6, icon: '🔌' },
        { label: '200-300 kWh', value: 0.9, icon: '⚡' },
        { label: 'Mais de 300 kWh', value: 1.5, icon: '🔥' }
      ]
    },
    {
      id: 'food',
      title: 'Alimentação',
      question: 'Qual sua dieta predominante?',
      icon: '🍽️',
      options: [
        { label: 'Vegana', value: 0.5, icon: '🥗' },
        { label: 'Vegetariana', value: 0.8, icon: '🥕' },
        { label: 'Onívora (pouca carne)', value: 1.2, icon: '🍗' },
        { label: 'Onívora (muita carne)', value: 2.0, icon: '🥩' }
      ]
    },
    {
      id: 'waste',
      title: 'Resíduos',
      question: 'Você recicla seu lixo?',
      icon: '♻️',
      options: [
        { label: 'Sempre separo e reciclo', value: 0.1, icon: '✅' },
        { label: 'Às vezes reciclo', value: 0.3, icon: '🔄' },
        { label: 'Raramente reciclo', value: 0.6, icon: '⚠️' },
        { label: 'Não reciclo', value: 1.0, icon: '❌' }
      ]
    },
    {
      id: 'consumption',
      title: 'Consumo',
      question: 'Com que frequência compra produtos novos?',
      icon: '🛍️',
      options: [
        { label: 'Raramente, só necessário', value: 0.3, icon: '✨' },
        { label: 'Mensalmente', value: 0.6, icon: '📦' },
        { label: 'Semanalmente', value: 1.0, icon: '🛒' },
        { label: 'Muito frequente', value: 1.5, icon: '💳' }
      ]
    }
  ];

  const handleAnswer = (value) => {
    const newAnswers = { ...answers, [questions[step].id]: value };
    setAnswers(newAnswers);

    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      calculateResult(newAnswers);
    }
  };

  const calculateResult = (finalAnswers) => {
    const monthly = Object.values(finalAnswers).reduce((sum, val) => sum + val, 0);
    const annual = monthly * 12;
    const brazilian_avg = 6.2;
    const trees = Math.ceil(annual / 22);

    setResult({
      monthly: monthly.toFixed(2),
      annual: annual.toFixed(2),
      comparison: ((annual / brazilian_avg) * 100).toFixed(0),
      trees,
      level: annual < 4 ? 'Excelente' : annual < 6 ? 'Bom' : annual < 8 ? 'Médio' : 'Alto'
    });
  };

  const reset = () => {
    setStep(0);
    setAnswers({});
    setResult(null);
  };

  if (result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl p-8"
          >
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🌍</div>
              <h2 className="text-3xl font-bold mb-2">Sua Pegada de Carbono</h2>
              <p className="text-gray-600">Resultado do cálculo</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-8">
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-2xl">
                <div className="text-4xl font-bold text-blue-600 mb-2">{result.monthly} ton</div>
                <div className="text-gray-700">CO2 por mês</div>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl">
                <div className="text-4xl font-bold text-green-600 mb-2">{result.annual} ton</div>
                <div className="text-gray-700">CO2 por ano</div>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <span className="text-gray-700">Comparado à média brasileira:</span>
                <span className={`font-bold ${result.comparison < 100 ? 'text-green-600' : 'text-red-600'}`}>
                  {result.comparison}%
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <span className="text-gray-700">Árvores para compensar:</span>
                <span className="font-bold text-green-600">{result.trees} árvores/ano</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <span className="text-gray-700">Nível de impacto:</span>
                <span className={`font-bold ${
                  result.level === 'Excelente' ? 'text-green-600' :
                  result.level === 'Bom' ? 'text-blue-600' :
                  result.level === 'Médio' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {result.level}
                </span>
              </div>
            </div>

            <div className="bg-blue-50 p-6 rounded-2xl mb-6">
              <h3 className="font-bold text-blue-800 mb-3">💡 Dicas para Reduzir</h3>
              <ul className="space-y-2 text-sm text-blue-700">
                <li>• Use transporte público ou bicicleta</li>
                <li>• Reduza consumo de carne vermelha</li>
                <li>• Economize energia em casa</li>
                <li>• Recicle e reutilize sempre que possível</li>
                <li>• Compre produtos locais e sustentáveis</li>
              </ul>
            </div>

            <button
              onClick={reset}
              className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all"
            >
              Calcular Novamente
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[step];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4">
            🌍 Calculadora de Pegada de Carbono
          </h1>
          <p className="text-xl text-gray-600">Descubra seu impacto ambiental</p>
        </motion.div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Pergunta {step + 1} de {questions.length}</span>
            <span className="text-sm font-bold text-green-600">{Math.round(((step + 1) / questions.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all"
              style={{ width: `${((step + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-3xl shadow-2xl p-8"
        >
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">{currentQuestion.icon}</div>
            <h2 className="text-2xl font-bold mb-2">{currentQuestion.title}</h2>
            <p className="text-gray-600">{currentQuestion.question}</p>
          </div>

          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleAnswer(option.value)}
                className="w-full p-4 bg-gray-50 hover:bg-gradient-to-r hover:from-green-50 hover:to-blue-50 rounded-xl text-left transition-all flex items-center gap-4 border-2 border-transparent hover:border-green-500"
              >
                <span className="text-3xl">{option.icon}</span>
                <span className="font-medium text-gray-800">{option.label}</span>
              </motion.button>
            ))}
          </div>

          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="mt-6 text-gray-600 hover:text-gray-800 font-medium"
            >
              ← Voltar
            </button>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default CarbonCalculator;
