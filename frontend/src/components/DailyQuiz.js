import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../contexts/UserContext';
import { Brain, Flame, Sparkles } from 'lucide-react';

const DailyQuiz = ({ onClose }) => {
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [streak, setStreak] = useState(7);
  const { addEcoPoints } = useUser();

  const dailyQuestion = {
    question: 'Quanto tempo leva para uma garrafa plástica se decompor na natureza?',
    options: ['50 anos', '100 anos', '200 anos', '450 anos'],
    correct: 3,
    explanation: 'Uma garrafa plástica pode levar até 450 anos para se decompor completamente na natureza!',
    points: 20
  };

  const handleAnswer = (index) => {
    setSelectedAnswer(index);
    setAnswered(true);
    
    if (index === dailyQuestion.correct) {
      addEcoPoints(dailyQuestion.points, 'Quiz Diário');
      setStreak(streak + 1);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-3xl p-8 max-w-2xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {!answered ? (
          <>
            <div className="text-center mb-6">
              <div className="mb-3 flex justify-center"><Brain size={56} className="text-purple-500" /></div>
              <h2 className="text-2xl font-bold mb-2">Quiz Diário</h2>
              <div className="flex items-center justify-center gap-2 text-orange-600">
                <Flame size={28} className="text-orange-500" />
                <span className="font-bold">{streak} dias de sequência!</span>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-lg text-gray-800 font-medium text-center">
                {dailyQuestion.question}
              </p>
            </div>

            <div className="space-y-3 mb-6">
              {dailyQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  className="w-full p-4 bg-gray-50 hover:bg-gradient-to-r hover:from-green-50 hover:to-blue-50 rounded-xl text-left transition-all border-2 border-transparent hover:border-green-500 font-medium"
                >
                  {option}
                </button>
              ))}
            </div>

            <div className="text-center text-sm text-gray-500">
              +{dailyQuestion.points} EcoPoints por resposta correta
            </div>
          </>
        ) : (
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              {selectedAnswer === dailyQuestion.correct ? <Sparkles size={64} className="text-green-500" /> : <Brain size={64} className="text-amber-500" />}
            </div>
            <h2 className="text-2xl font-bold mb-4">
              {selectedAnswer === dailyQuestion.correct ? 'Parabéns!' : 'Quase lá!'}
            </h2>
            
            {selectedAnswer === dailyQuestion.correct && (
              <div className="bg-green-50 p-4 rounded-2xl mb-4">
                <div className="text-3xl font-bold text-green-600 mb-1">
                  +{dailyQuestion.points} EcoPoints
                </div>
                <div className="flex items-center justify-center gap-2 text-orange-600">
                  <Flame size={24} />
                  <span className="font-bold">{streak} dias de sequência!</span>
                </div>
              </div>
            )}

            <div className="bg-blue-50 p-4 rounded-2xl mb-6">
              <p className="text-sm text-blue-800">{dailyQuestion.explanation}</p>
            </div>

            <button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all"
            >
              Voltar ao Dashboard
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default DailyQuiz;
