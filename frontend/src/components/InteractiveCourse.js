import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../contexts/UserContext';

const InteractiveCourse = ({ course, onClose }) => {
  const [started, setStarted] = useState(false);
  const [currentLesson, setCurrentLesson] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const { addEcoPoints } = useUser();

  const coursesData = {
    1: {
      title: 'Reciclagem Básica',
      lessons: [
        {
          title: 'Introdução à Reciclagem',
          content: 'A reciclagem é o processo de transformar materiais usados em novos produtos. No Brasil, apenas 4% do lixo é reciclado, mas podemos mudar isso!',
          activity: 'Liste 3 materiais recicláveis que você usa diariamente',
          quiz: {
            question: 'Qual material leva mais tempo para se decompor?',
            options: ['Papel', 'Plástico', 'Vidro', 'Metal'],
            correct: 2
          }
        },
        {
          title: 'Tipos de Materiais Recicláveis',
          content: 'Existem 4 principais categorias: Plástico (azul), Papel (azul), Metal (amarelo) e Vidro (verde). Cada um tem seu processo específico de reciclagem.',
          activity: 'Separe o lixo da sua casa por categoria hoje',
          quiz: {
            question: 'Qual cor representa a coleta de vidro?',
            options: ['Azul', 'Verde', 'Amarelo', 'Vermelho'],
            correct: 1
          }
        },
        {
          title: 'Como Separar Corretamente',
          content: 'Lave as embalagens, remova rótulos quando possível, e separe por tipo. Nunca misture orgânico com reciclável!',
          activity: 'Crie um sistema de separação em casa com 3 lixeiras',
          quiz: {
            question: 'O que NÃO deve ser misturado com recicláveis?',
            options: ['Garrafas PET', 'Restos de comida', 'Latas de alumínio', 'Papelão'],
            correct: 1
          }
        }
      ]
    },
    2: {
      title: 'Sustentabilidade Urbana',
      lessons: [
        {
          title: 'Mobilidade Sustentável',
          content: 'Transporte público, bicicleta e caminhada reduzem emissões de CO2. Um carro emite cerca de 2,3 toneladas de CO2 por ano.',
          activity: 'Use transporte público ou bicicleta por 3 dias esta semana',
          quiz: {
            question: 'Qual meio de transporte emite MENOS CO2?',
            options: ['Carro', 'Ônibus', 'Bicicleta', 'Moto'],
            correct: 2
          }
        },
        {
          title: 'Consumo Consciente',
          content: 'Compre apenas o necessário, prefira produtos locais e evite embalagens plásticas. Cada brasileiro produz 1kg de lixo por dia!',
          activity: 'Faça compras com sacola reutilizável esta semana',
          quiz: {
            question: 'Quanto lixo um brasileiro produz por dia em média?',
            options: ['500g', '1kg', '2kg', '3kg'],
            correct: 1
          }
        }
      ]
    },
    3: {
      title: 'Mudanças Climáticas',
      lessons: [
        {
          title: 'Causas das Mudanças Climáticas',
          content: 'O aquecimento global é causado principalmente pela emissão de gases do efeito estufa, como CO2 e metano, da queima de combustíveis fósseis.',
          activity: 'Calcule sua pegada de carbono online',
          quiz: {
            question: 'Qual é o principal gás do efeito estufa?',
            options: ['Oxigênio', 'Nitrogênio', 'Dióxido de Carbono', 'Hidrogênio'],
            correct: 2
          }
        },
        {
          title: 'Efeitos no Meio Ambiente',
          content: 'Derretimento de geleiras, aumento do nível do mar, eventos climáticos extremos e perda de biodiversidade são consequências diretas.',
          activity: 'Pesquise sobre um animal ameaçado pelas mudanças climáticas',
          quiz: {
            question: 'Qual NÃO é um efeito das mudanças climáticas?',
            options: ['Derretimento de geleiras', 'Aumento de chuvas', 'Diminuição da temperatura global', 'Eventos extremos'],
            correct: 2
          }
        }
      ]
    }
  };

  const currentCourseData = coursesData[course.id];
  const currentLessonData = currentCourseData?.lessons[currentLesson];
  const totalLessons = currentCourseData?.lessons.length || 0;

  const handleQuizAnswer = (answerIndex) => {
    setQuizAnswers({
      ...quizAnswers,
      [currentLesson]: answerIndex
    });
  };

  const handleNext = () => {
    if (currentLesson < totalLessons - 1) {
      setCurrentLesson(currentLesson + 1);
    } else {
      calculateResults();
    }
  };

  const calculateResults = () => {
    let correct = 0;
    currentCourseData.lessons.forEach((lesson, index) => {
      if (quizAnswers[index] === lesson.quiz.correct) {
        correct++;
      }
    });

    const points = correct * 50;
    addEcoPoints(points, `Curso: ${currentCourseData.title}`);
    setShowResults(true);
  };

  const getCorrectAnswers = () => {
    let correct = 0;
    currentCourseData.lessons.forEach((lesson, index) => {
      if (quizAnswers[index] === lesson.quiz.correct) {
        correct++;
      }
    });
    return correct;
  };

  if (!currentCourseData) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-3xl p-8 max-w-3xl w-full my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {!started ? (
          <div className="text-center">
            <div className="text-5xl mb-4">{course.icon}</div>
            <h2 className="text-2xl font-bold mb-2">{currentCourseData.title}</h2>
            <p className="text-gray-600 mb-6">{course.description}</p>
            
            <div className="mb-6">
              <h3 className="font-bold mb-3">Conteúdo do Curso:</h3>
              <ul className="space-y-2">
                {course.lessons.map((lesson, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <span className="text-green-500">▶</span>
                    {lesson}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 border-2 border-gray-300 text-gray-700 py-3 px-4 rounded-xl font-bold hover:bg-gray-50 transition-colors"
              >
                Fechar
              </button>
              <button
                onClick={() => setStarted(true)}
                className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 px-4 rounded-xl font-bold hover:shadow-lg transition-all"
              >
                Iniciar Curso
              </button>
            </div>
          </div>
        ) : !showResults ? (
          <>
            {/* Progress */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">
                  Lição {currentLesson + 1} de {totalLessons}
                </span>
                <span className="text-sm font-bold text-green-600">
                  {Math.round(((currentLesson + 1) / totalLessons) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${((currentLesson + 1) / totalLessons) * 100}%` }}
                />
              </div>
            </div>

            {/* Lesson Content */}
            <div className="mb-6">
              <h2 className="text-3xl font-bold mb-4 text-gray-800">
                {currentLessonData.title}
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                {currentLessonData.content}
              </p>

              {/* Activity */}
              <div className="bg-blue-50 p-4 rounded-xl mb-6">
                <h3 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                  ✏️ Atividade Prática
                </h3>
                <p className="text-blue-700">{currentLessonData.activity}</p>
              </div>

              {/* Quiz */}
              <div className="bg-green-50 p-6 rounded-xl">
                <h3 className="font-bold text-green-800 mb-4 flex items-center gap-2">
                  ❓ Quiz
                </h3>
                <p className="text-gray-800 font-medium mb-4">
                  {currentLessonData.quiz.question}
                </p>
                <div className="space-y-2">
                  {currentLessonData.quiz.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuizAnswer(index)}
                      className={`w-full p-3 rounded-xl text-left transition-all ${
                        quizAnswers[currentLesson] === index
                          ? 'bg-green-500 text-white'
                          : 'bg-white hover:bg-green-100 text-gray-800'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-3 border-2 border-gray-300 rounded-xl font-bold hover:bg-gray-50 transition-colors"
              >
                Sair
              </button>
              <button
                onClick={handleNext}
                disabled={quizAnswers[currentLesson] === undefined}
                className={`flex-1 px-6 py-3 rounded-xl font-bold transition-all ${
                  quizAnswers[currentLesson] !== undefined
                    ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white hover:shadow-lg'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {currentLesson < totalLessons - 1 ? 'Próxima Lição' : 'Finalizar Curso'}
              </button>
            </div>
          </>
        ) : (
          <div className="text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold mb-4">Parabéns!</h2>
            <p className="text-xl text-gray-600 mb-6">
              Você completou o curso: <span className="font-bold">{currentCourseData.title}</span>
            </p>
            
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-2xl mb-6">
              <div className="text-5xl font-bold text-green-600 mb-2">
                {getCorrectAnswers()}/{totalLessons}
              </div>
              <div className="text-gray-700">Respostas Corretas</div>
              <div className="text-3xl font-bold text-blue-600 mt-4">
                +{getCorrectAnswers() * 50} EcoPoints
              </div>
            </div>

            <button
              onClick={onClose}
              className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg transition-all"
            >
              Concluir
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default InteractiveCourse;
