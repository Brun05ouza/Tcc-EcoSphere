import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { gamificationAPI } from '../services/api';
import { useUser } from '../contexts/UserContext';

const Gamification = () => {
  const [user, setUser] = useState(null);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [gamificationData, setGamificationData] = useState(null);
  const [ranking, setRanking] = useState([]);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user: contextUser, addEcoPoints: addEcoPointsContext } = useUser();
  
  // Quiz states
  const [quizActive, setQuizActive] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  
  // Game states
  const [gameActive, setGameActive] = useState(false);
  const [gameScore, setGameScore] = useState(0);
  const [gameTime, setGameTime] = useState(10);
  const [playerPos, setPlayerPos] = useState(50);
  const [items, setItems] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [pendingPoints, setPendingPoints] = useState(0);
  const [pendingType, setPendingType] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  const ecoQuestions = [
    {
      question: "🌍 Qual é a principal causa do aquecimento global?",
      options: ["Desmatamento", "Emissão de gases do efeito estufa", "Poluição da água", "Lixo urbano"],
      correct: 1,
      points: 50
    },
    {
      question: "♻️ Quanto tempo leva para uma garrafa plástica se decompostar?",
      options: ["10 anos", "50 anos", "100 anos", "450 anos"],
      correct: 3,
      points: 75
    },
    {
      question: "🌱 Qual dessas ações economiza mais água?",
      options: ["Banho de 5 min", "Escovar dentes com torneira fechada", "Reutilizar água da chuva", "Lavar roupa na máquina cheia"],
      correct: 2,
      points: 60
    },
    {
      question: "🔋 Qual fonte de energia é mais sustentável?",
      options: ["Carvão", "Petróleo", "Energia Solar", "Gás Natural"],
      correct: 2,
      points: 40
    },
    {
      question: "🌳 Quantas árvores uma pessoa deve plantar por ano para compensar sua pegada de carbono?",
      options: ["2-3 árvores", "5-7 árvores", "10-15 árvores", "20-25 árvores"],
      correct: 2,
      points: 80
    }
  ];

  const wasteItems = [
    { type: 'plastic', emoji: '🍾', points: 10 },
    { type: 'paper', emoji: '📄', points: 15 },
    { type: 'glass', emoji: '🍺', points: 20 },
    { type: 'metal', emoji: '🥫', points: 25 },
    { type: 'battery', emoji: '🔋', points: 50 }
  ];

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    loadGamificationData();
  }, []);

  useEffect(() => {
    let gameInterval;
    let timerInterval;
    
    if (gameActive) {
      // Timer separado para contar segundos
      timerInterval = setInterval(() => {
        setGameTime(prev => {
          if (prev <= 1) {
            setGameActive(false);
            setGameOver(true);
            // Preparar pontos para confirmação
            setTimeout(() => {
              setGameScore(currentScore => {
                setTimeout(() => {
                  setPendingPoints(currentScore);
                  setPendingType('eco_catcher');
                  setShowConfirmation(true);
                }, 500);
                return currentScore;
              });
            }, 100);
            return 0;
          }
          return prev - 1;
        });
      }, 1000); // 1 segundo real
      
      // Loop do jogo para movimento e spawn
      gameInterval = setInterval(() => {
        // Add new item (menos frequente)
        if (Math.random() < 0.3) {
          const newItem = {
            id: Date.now() + Math.random(),
            ...wasteItems[Math.floor(Math.random() * wasteItems.length)],
            x: Math.random() * 80 + 10,
            y: 0
          };
          setItems(prev => [...prev, newItem]);
        }
        
        // Move items down
        setItems(prev => {
          const updatedItems = [];
          
          prev.forEach(item => {
            const newY = item.y + 1.5;
            
            // Check collision with player (mais preciso)
            if (newY > 80 && newY < 90 && Math.abs(item.x - playerPos) < 6) {
              setGameScore(s => s + item.points);
              // Don't add to updatedItems (remove item)
            } else if (newY < 95) {
              // Keep item if it hasn't reached bottom
              updatedItems.push({ ...item, y: newY });
            }
            // Items that reach y >= 100 are automatically removed
          });
          
          return updatedItems;
        });
      }, 100); // 100ms para movimento suave
    }
    
    return () => {
      clearInterval(gameInterval);
      clearInterval(timerInterval);
    };
  }, [gameActive, playerPos]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (gameActive) {
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
          setPlayerPos(prev => Math.max(5, prev - 5));
        }
        if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
          setPlayerPos(prev => Math.min(85, prev + 5));
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameActive]);

  const loadGamificationData = async () => {
    // Usar dados locais ao invés de API
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    
    setGamificationData({
      ecoPoints: userData.ecoPoints || 0,
      level: userData.level || 'Iniciante',
      totalClassifications: 0
    });
    
    // Mock data para ranking
    setRanking([
      { position: 1, name: 'EcoMaster', points: 2500, avatar: '🌟', level: 'Expert' },
      { position: 2, name: 'GreenHero', points: 2100, avatar: '🌱', level: 'Avançado' },
      { position: 3, name: userData.name || 'Você', points: userData.ecoPoints || 0, avatar: '🧑', level: userData.level || 'Iniciante', isCurrentUser: true },
      { position: 4, name: 'EcoWarrior', points: 1500, avatar: '♻️', level: 'Intermediário' },
      { position: 5, name: 'NatureLover', points: 1200, avatar: '🌿', level: 'Iniciante' }
    ]);
    
    // Mock data para badges
    setBadges([
      { id: 1, name: 'Bem-vindo', description: 'Primeira vez no EcoSphere', earned: true, points: 50, icon: '🎉' },
      { id: 2, name: 'Primeiro Passo', description: 'Primeira classificação', earned: false, points: 100, icon: '🌱' },
      { id: 3, name: 'Reciclador', description: '10 classificações', earned: false, points: 200, icon: '♻️' },
      { id: 4, name: 'Eco Warrior', description: '100 EcoPoints', earned: false, points: 300, icon: '🏆' }
    ]);
    
    setLoading(false);
  };
  
  const addEcoPoints = async (points, type = 'game') => {
    try {
      console.log(`🎮 Adicionando ${points} pontos do tipo ${type}`);
      
      const actionName = type === 'quiz' ? 'Eco Quiz' : type === 'eco_catcher' ? 'Eco Catcher' : 'Jogo';
      const newTotal = addEcoPointsContext(points, actionName);
      
      // Atualizar dados locais
      setGamificationData(prev => ({
        ...prev,
        ecoPoints: newTotal
      }));
      
      return true;
    } catch (error) {
      console.error('❌ Erro ao adicionar pontos:', error);
      return false;
    }
  };

  const badgeIcons = {
    'Bem-vindo': '🎉',
    'Primeiro Passo': '🌱',
    'Reciclador': '♾️',
    'Eco Warrior': '🏆',
    'Guardião Verde': '🌳',
    'Mestre Ambiental': '🌍'
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados...</p>
        </div>
      </div>
    );
  }

  const missions = [
    { 
      id: 1, 
      title: 'Classificar 5 resíduos hoje', 
      progress: Math.min(gamificationData?.totalClassifications || 0, 5), 
      total: 5, 
      reward: 100, 
      icon: '🎯' 
    },
    { 
      id: 2, 
      title: 'Ganhar 100 EcoPoints', 
      progress: Math.min(contextUser?.ecoPoints || gamificationData?.ecoPoints || 0, 100), 
      total: 100, 
      reward: 50, 
      icon: '💎' 
    },
    { 
      id: 3, 
      title: 'Conquistar primeira badge', 
      progress: badges.filter(b => b.earned).length > 0 ? 1 : 0, 
      total: 1, 
      reward: 25, 
      icon: '🏅' 
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
      {/* Modal de Confirmação */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 max-w-md mx-4 text-center"
          >
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold mb-4">Parabéns!</h2>
            <p className="text-gray-600 mb-6">
              Você ganhou <span className="font-bold text-green-600">{pendingPoints} EcoPoints</span> no {pendingType === 'quiz' ? 'Eco Quiz' : 'Eco Catcher'}!
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Clique em "Confirmar" para adicionar os pontos ao seu perfil.
            </p>
            
            <div className="flex gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={async () => {
                  console.log(`🔴 CONFIRMANDO: ${pendingPoints} pontos do tipo ${pendingType}`);
                  const success = await addEcoPoints(pendingPoints, pendingType);
                  if (success) {
                    console.log('✅ Pontos adicionados com sucesso!');
                    setShowConfirmation(false);
                    setPendingPoints(0);
                    setPendingType('');
                    
                    // Forçar recarregamento dos dados após confirmação
                    setTimeout(() => {
                      loadGamificationData();
                    }, 1000);
                  } else {
                    console.log('❌ Falha ao adicionar pontos!');
                    alert('Erro ao adicionar pontos. Tente novamente.');
                  }
                }}
                className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all"
              >
                ✅ Confirmar EcoPoints
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setShowConfirmation(false);
                  setPendingPoints(0);
                  setPendingType('');
                }}
                className="px-6 py-3 border-2 border-gray-300 rounded-xl font-bold hover:bg-gray-50 transition-all"
              >
                ❌ Cancelar
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4">
            🏆 EcoPoints & Conquistas
          </h1>
          <p className="text-xl text-gray-600">Ganhe pontos, desbloqueie badges e suba no ranking!</p>
        </motion.div>

        {/* User Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-600 to-blue-600 rounded-3xl p-8 text-white mb-8"
        >
          <div className="grid md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold">{contextUser?.ecoPoints || gamificationData?.ecoPoints || 0}</div>
              <div className="text-green-100">EcoPoints Totais</div>
            </div>
            <div>
              <div className="text-3xl font-bold">{badges.filter(b => b.earned).length}</div>
              <div className="text-green-100">Badges Conquistadas</div>
            </div>
            <div>
              <div className="text-3xl font-bold">{ranking.find(r => r.isCurrentUser)?.position || '-'}º</div>
              <div className="text-green-100">Posição no Ranking</div>
            </div>
            <div>
              <div className="text-3xl font-bold">{gamificationData?.level || 'Iniciante'}</div>
              <div className="text-green-100">Nível Atual</div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-2xl p-2 shadow-lg">
            {[
              { id: 'overview', label: 'Visão Geral', icon: 'bi-house' },
              { id: 'quiz', label: 'Eco Quiz', icon: 'bi-question-circle' },
              { id: 'game', label: 'Eco Catcher', icon: 'bi-controller' },
              { id: 'badges', label: 'Badges', icon: 'bi-award' },
              { id: 'ranking', label: 'Ranking', icon: 'bi-trophy' },
              { id: 'missions', label: 'Missões', icon: 'bi-target' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`px-6 py-3 rounded-xl transition-all ${
                  selectedTab === tab.id
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
        <div className="max-w-6xl mx-auto">
          {selectedTab === 'quiz' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-xl p-8"
            >
              {!quizActive && !quizCompleted && (
                <div className="text-center">
                  <div className="text-8xl mb-6">🧠</div>
                  <h2 className="text-3xl font-bold mb-4">Eco Quiz Challenge!</h2>
                  <p className="text-gray-600 mb-8 text-lg">
                    Teste seus conhecimentos sobre sustentabilidade e ganhe até <span className="font-bold text-green-600">305 EcoPoints</span>!
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setQuizActive(true);
                      setCurrentQuestion(0);
                      setQuizScore(0);
                      setSelectedAnswer(null);
                      setShowResult(false);
                    }}
                    className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-lg transition-all"
                  >
                    🚀 Começar Quiz!
                  </motion.button>
                </div>
              )}
              
              {quizActive && !quizCompleted && (
                <div>
                  <div className="flex justify-between items-center mb-8">
                    <div className="text-sm text-gray-600">
                      Pergunta {currentQuestion + 1} de {ecoQuestions.length}
                    </div>
                    <div className="text-sm font-bold text-green-600">
                      Score: {quizScore} EcoPoints
                    </div>
                  </div>
                  
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold mb-6">
                      {ecoQuestions[currentQuestion].question}
                    </h3>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      {ecoQuestions[currentQuestion].options.map((option, index) => (
                        <motion.button
                          key={index}
                          onClick={() => {
                            if (selectedAnswer === null) {
                              setSelectedAnswer(index);
                              setShowResult(true);
                              
                              // Calcular novo score
                              const isCorrect = index === ecoQuestions[currentQuestion].correct;
                              const pointsToAdd = isCorrect ? ecoQuestions[currentQuestion].points : 0;
                              const newScore = quizScore + pointsToAdd;
                              
                              console.log(`Quiz: Pergunta ${currentQuestion + 1}, Correto: ${isCorrect}, Pontos: ${pointsToAdd}, Score total: ${newScore}`);
                              
                              setQuizScore(newScore);
                              
                              setTimeout(() => {
                                if (currentQuestion + 1 < ecoQuestions.length) {
                                  setCurrentQuestion(currentQuestion + 1);
                                  setSelectedAnswer(null);
                                  setShowResult(false);
                                } else {
                                  setQuizActive(false);
                                  setQuizCompleted(true);
                                  console.log(`Quiz finalizado com ${newScore} pontos`);
                                  setTimeout(() => {
                                    setPendingPoints(newScore);
                                    setPendingType('quiz');
                                    setShowConfirmation(true);
                                  }, 500);
                                }
                              }, 2000);
                            }
                          }}
                          disabled={selectedAnswer !== null}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            selectedAnswer === null
                              ? 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                              : selectedAnswer === index
                                ? index === ecoQuestions[currentQuestion].correct
                                  ? 'border-green-500 bg-green-100 text-green-800'
                                  : 'border-red-500 bg-red-100 text-red-800'
                                : index === ecoQuestions[currentQuestion].correct && showResult
                                  ? 'border-green-500 bg-green-100 text-green-800'
                                  : 'border-gray-200 bg-gray-50 opacity-50'
                          }`}
                        >
                          {option}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {quizCompleted && !showConfirmation && (
                <div className="text-center">
                  <div className="text-8xl mb-6">🏆</div>
                  <h2 className="text-3xl font-bold mb-4">Quiz Completo!</h2>
                  <div className="text-6xl font-bold text-green-600 mb-4">
                    {quizScore} EcoPoints
                  </div>
                  <p className="text-gray-600 mb-6">
                    Seus pontos foram confirmados e adicionados ao seu perfil!
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <motion.button
                      onClick={() => {
                        setQuizCompleted(false);
                        setQuizActive(true);
                        setCurrentQuestion(0);
                        setQuizScore(0);
                        setSelectedAnswer(null);
                        setShowResult(false);
                      }}
                      className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-xl font-bold"
                    >
                      🔄 Jogar Novamente
                    </motion.button>
                    <motion.button
                      onClick={() => {
                        setQuizCompleted(false);
                        setSelectedTab('overview');
                      }}
                      className="bg-gray-500 text-white px-6 py-3 rounded-xl font-bold"
                    >
                      📊 Ver Dashboard
                    </motion.button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
          
          {selectedTab === 'game' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-xl p-8"
            >
              {!gameActive && !gameOver && (
                <div className="text-center">
                  <div className="text-8xl mb-6">🎮</div>
                  <h2 className="text-3xl font-bold mb-4">Eco Catcher!</h2>
                  <p className="text-gray-600 mb-8 text-lg">
                    Pegue o lixo reciclável que cai do céu! Use ← → ou A/D para mover.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setGameActive(true);
                      setGameScore(0);
                      setGameTime(10);
                      setPlayerPos(50);
                      setItems([]);
                      setGameOver(false);
                    }}
                    className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-lg transition-all"
                  >
                    🚀 Começar Jogo!
                  </motion.button>
                </div>
              )}
              
              {gameActive && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-lg font-bold text-green-600">
                      Score: {gameScore}
                    </div>
                    <div className="text-lg font-bold text-blue-600">
                      Tempo: {gameTime}s
                    </div>
                  </div>
                  
                  <div 
                    className="relative bg-gradient-to-b from-blue-200 to-green-200 rounded-2xl overflow-hidden select-none"
                    style={{ height: '400px', touchAction: 'none' }}
                    onWheel={(e) => e.preventDefault()}
                    onTouchMove={(e) => e.preventDefault()}
                  >
                    {/* Player */}
                    <div 
                      className="absolute bottom-2 w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-2xl transition-all duration-100"
                      style={{ left: `${playerPos}%` }}
                    >
                      🧑
                    </div>
                    
                    {/* Falling Items */}
                    {items.map(item => (
                      <div
                        key={item.id}
                        className="absolute text-3xl"
                        style={{ 
                          left: `${item.x}%`, 
                          top: `${item.y}%`,
                          transform: 'translate(-50%, -50%)'
                        }}
                      >
                        {item.emoji}
                      </div>
                    ))}
                    
                    {/* Controls hint */}
                    <div className="absolute top-4 left-4 bg-white bg-opacity-80 p-2 rounded-lg text-sm">
                      Use ← → ou A/D para mover
                    </div>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-5 gap-2 text-center text-xs">
                    {wasteItems.map(item => (
                      <div key={item.type} className="bg-gray-50 p-2 rounded">
                        <div className="text-lg">{item.emoji}</div>
                        <div className="font-bold">{item.points}pts</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {gameOver && !showConfirmation && (
                <div className="text-center">
                  <div className="text-8xl mb-6">🏆</div>
                  <h2 className="text-3xl font-bold mb-4">Parabéns!</h2>
                  <div className="text-6xl font-bold text-green-600 mb-4">
                    {gameScore} EcoPoints
                  </div>
                  <p className="text-gray-600 mb-6">
                    Seus pontos foram confirmados e adicionados ao seu perfil!
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <motion.button
                      onClick={() => {
                        setGameOver(false);
                        setGameActive(true);
                        setGameScore(0);
                        setGameTime(10);
                        setPlayerPos(50);
                        setItems([]);
                      }}
                      className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-xl font-bold"
                    >
                      🔄 Jogar Novamente
                    </motion.button>
                    <motion.button
                      onClick={() => {
                        setGameOver(false);
                        setSelectedTab('overview');
                      }}
                      className="bg-gray-500 text-white px-6 py-3 rounded-xl font-bold"
                    >
                      📊 Ver Dashboard
                    </motion.button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {selectedTab === 'badges' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid md:grid-cols-3 gap-6"
            >
              {badges.map((badge, index) => (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-6 rounded-2xl shadow-lg ${
                    badge.earned ? 'bg-white' : 'bg-gray-100 opacity-60'
                  }`}
                >
                  <div className="text-center">
                    <div className={`text-6xl mb-4 ${
                      badge.earned ? 'grayscale-0' : 'grayscale'
                    }`}>
                      {badgeIcons[badge.name] || '🏅'}
                    </div>
                    <h3 className="font-bold text-lg mb-2">{badge.name}</h3>
                    <p className="text-gray-600 text-sm mb-4">{badge.description}</p>
                    <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                      badge.earned 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {badge.earned ? `+${badge.points} EcoPoints` : 'Bloqueada'}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {selectedTab === 'ranking' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-xl p-8"
            >
              <h2 className="text-2xl font-bold mb-6 text-center">Ranking Global</h2>
              <div className="space-y-4">
                {ranking.map((player, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center justify-between p-4 rounded-xl ${
                      player.isCurrentUser
                        ? 'bg-gradient-to-r from-green-100 to-blue-100 border-2 border-green-300'
                        : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        player.position === 1 ? 'bg-yellow-400 text-yellow-900' :
                        player.position === 2 ? 'bg-gray-300 text-gray-700' :
                        player.position === 3 ? 'bg-orange-400 text-orange-900' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {player.position <= 3 ? 
                          ['', '🥇', '🥈', '🥉'][player.position] : 
                          player.position
                        }
                      </div>
                      <div className="text-2xl">{player.avatar}</div>
                      <div>
                        <div className="font-semibold">{player.name}</div>
                        <div className="text-sm text-gray-600">
                          {player.isCurrentUser ? 'Você' : player.level || 'Usuário'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">{player.points.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">EcoPoints</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {selectedTab === 'missions' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid md:grid-cols-2 gap-6"
            >
              {missions.map((mission, index) => (
                <motion.div
                  key={mission.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white p-6 rounded-2xl shadow-lg"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-3xl">{mission.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-bold">{mission.title}</h3>
                      <div className="text-sm text-gray-600">
                        Progresso: {mission.progress}/{mission.total}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">+{mission.reward}</div>
                      <div className="text-xs text-gray-500">EcoPoints</div>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                    <motion.div
                      className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(mission.progress / mission.total) * 100}%` }}
                      transition={{ duration: 1, delay: index * 0.2 }}
                    />
                  </div>
                  
                  <div className="text-center">
                    {mission.progress === mission.total ? (
                      <button className="bg-green-500 text-white px-4 py-2 rounded-xl font-medium">
                        ✓ Concluída
                      </button>
                    ) : (
                      <button className="bg-blue-500 text-white px-4 py-2 rounded-xl font-medium hover:bg-blue-600 transition-colors">
                        Continuar
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {selectedTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid md:grid-cols-2 gap-8"
            >
              {/* Recent Badges */}
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <h3 className="font-bold text-lg mb-4">🏅 Últimas Conquistas</h3>
                <div className="space-y-3">
                  {badges.filter(b => b.earned).slice(-3).map((badge) => (
                    <div key={badge.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <span className="text-2xl">{badge.icon}</span>
                      <div className="flex-1">
                        <div className="font-medium">{badge.name}</div>
                        <div className="text-sm text-gray-600">+{badge.points} EcoPoints</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <h3 className="font-bold text-lg mb-4">📊 Estatísticas Rápidas</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Classificações hoje</span>
                    <span className="font-bold text-green-600">12</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Sequência atual</span>
                    <span className="font-bold text-blue-600">7 dias</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Próxima badge</span>
                    <span className="font-bold text-purple-600">150 pontos</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Gamification;