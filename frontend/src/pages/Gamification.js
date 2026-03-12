import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { gamificationAPI } from '../services/api';
import { useUser } from '../contexts/UserContext';
import { getRandomQuestions } from '../data/quizQuestions';
import { Sparkles, Trophy, Recycle, Leaf, TreePine, Globe, Flame, Brain, Gamepad2, Award, Target, Check, X, BarChart3, RotateCcw, Medal } from 'lucide-react';
import { AppIcon } from '../components/ui/AppIcon';
import LoadingScreen from '../components/ui/LoadingScreen';

const Gamification = () => {
  const [user, setUser] = useState(null);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [gamificationData, setGamificationData] = useState(null);
  const [ranking, setRanking] = useState([]);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user: contextUser, addEcoPoints: addEcoPointsContext } = useUser();

  const Icon = ({ name, className = "w-5 h-5", white = false }) => {
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
  
  // Quiz states
  const [quizActive, setQuizActive] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [ecoQuestions, setEcoQuestions] = useState([]);
  
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

  const wasteItems = [
    { type: 'plastic', iconName: 'bottle', points: 10 },
    { type: 'paper', iconName: 'paper', points: 15 },
    { type: 'glass', iconName: 'wine', points: 20 },
    { type: 'metal', iconName: 'wine', points: 25 },
    { type: 'battery', iconName: 'battery', points: 50 }
  ];

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    loadGamificationData();
  }, []);

  const keysPressed = React.useRef({ left: false, right: false });
  const playerPosRef = React.useRef(50);

  useEffect(() => {
    let gameInterval;
    let timerInterval;
    
    if (gameActive) {
      // Sincroniza o ref com o estado inicial ao iniciar o jogo
      playerPosRef.current = 50;
      setPlayerPos(50);

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
                  if (currentScore > 0) {
                    setPendingPoints(currentScore);
                    setPendingType('eco_catcher');
                    setShowConfirmation(true);
                  }
                }, 500);
                return currentScore;
              });
            }, 100);
            return 0;
          }
          return prev - 1;
        });
      }, 1000); // 1 segundo real
      
      // Loop do jogo para movimento e spawn (50ms para maior fluidez)
      gameInterval = setInterval(() => {
        // Movimento do jogador suave
        let currentPos = playerPosRef.current;
        if (keysPressed.current.left) currentPos = Math.max(5, currentPos - 2);
        if (keysPressed.current.right) currentPos = Math.min(95, currentPos + 2);
        
        if (currentPos !== playerPosRef.current) {
          playerPosRef.current = currentPos;
          setPlayerPos(currentPos);
        }

        // Add new item (probabilidade ajustada para o loop mais rápido)
        if (Math.random() < 0.1) {
          const isBadItem = Math.random() < 0.15; // 15% chance de lixo orgânico (perde pontos)
          let newItem;
          
          if (isBadItem) {
            newItem = {
              id: Date.now() + Math.random(),
              type: 'danger',
              iconName: 'flame', // usando flame de icon
              points: -15,
              isBad: true,
              x: Math.random() * 80 + 10,
              y: -10,
              speed: 1 + Math.random() * 1.5
            };
          } else {
            const randomItem = wasteItems[Math.floor(Math.random() * wasteItems.length)];
            newItem = {
              id: Date.now() + Math.random(),
              ...randomItem,
              x: Math.random() * 80 + 10,
              y: -10,
              speed: 1 + Math.random() * 1.5
            };
          }
          setItems(prev => [...prev, newItem]);
        }
        
        // Move items down
        setItems(prev => {
          const updatedItems = [];
          const pos = playerPosRef.current;
          
          prev.forEach(item => {
            const newY = item.y + (item.speed || 1.5);
            
            // Check collision with player (mais preciso)
            if (newY > 80 && newY < 95 && Math.abs(item.x - pos) < 8) {
              setGameScore(s => Math.max(0, s + item.points));
              // Aqui não adicionamos o item ao updatedItems, então ele "desaparece"
            } else if (newY < 110) {
              // Keep item if it hasn't reached bottom
              updatedItems.push({ ...item, y: newY });
            }
          });
          
          return updatedItems;
        });
      }, 50); // 50ms para movimento suave
    }
    
    return () => {
      clearInterval(gameInterval);
      clearInterval(timerInterval);
    };
  }, [gameActive]); // removido playerPos da dependência para não resetar o interval

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameActive) {
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keysPressed.current.left = true;
        if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keysPressed.current.right = true;
      }
    };
    const handleKeyUp = (e) => {
      if (gameActive) {
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keysPressed.current.left = false;
        if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keysPressed.current.right = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameActive]);

  const loadGamificationData = async () => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    try {
      const [profileRes, rankingRes, badgesRes] = await Promise.all([
        gamificationAPI.getProfile(),
        gamificationAPI.getRanking(),
        gamificationAPI.getBadges(),
      ]);
      setGamificationData({
        ecoPoints: profileRes.data?.ecoPoints ?? userData.ecoPoints ?? 0,
        level: profileRes.data?.level || userData.level || 'Iniciante',
        totalClassifications: profileRes.data?.totalClassifications ?? 0,
      });
      setRanking((rankingRes.data || []).map((r, i) => ({
        position: r.position,
        name: r.name,
        points: r.points,
        level: r.level,
        isCurrentUser: r.isCurrentUser,
        avatarIcon: r.isCurrentUser ? 'user' : ['sparkles', 'leaf', 'recycle', 'leafy', 'globe', 'trophy', 'tree', 'flame', 'gamepad', 'sparkle'][i] || 'user',
      })));
      setBadges((badgesRes.data || []).map((b) => ({
        ...b,
        iconName: badgeIcons[b.name] || 'award',
      })));
    } catch {
      setGamificationData({
        ecoPoints: userData.ecoPoints || 0,
        level: userData.level || 'Iniciante',
        totalClassifications: 0,
      });
      setRanking([
        { position: 1, name: 'EcoMaster', points: 2500, avatarIcon: 'sparkles', level: 'Expert' },
        { position: 2, name: 'GreenHero', points: 2100, avatarIcon: 'leaf', level: 'Avançado' },
        { position: 3, name: userData.name || 'Você', points: userData.ecoPoints || 0, avatarIcon: 'user', level: userData.level || 'Iniciante', isCurrentUser: true },
        { position: 4, name: 'EcoWarrior', points: 1500, avatarIcon: 'recycle', level: 'Intermediário' },
        { position: 5, name: 'NatureLover', points: 1200, avatarIcon: 'leafy', level: 'Iniciante' },
      ]);
      setBadges([
        { id: 1, name: 'Bem-vindo', description: 'Primeira vez no EcoSphere', earned: true, points: 50, iconName: 'sparkles' },
        { id: 2, name: 'Primeiro Passo', description: 'Primeira classificação', earned: true, points: 100, iconName: 'leaf' },
        { id: 3, name: 'Reciclador', description: '10 classificações', earned: false, points: 200, iconName: 'recycle' },
        { id: 4, name: 'Eco Warrior', description: '100 EcoPoints', earned: false, points: 300, iconName: 'trophy' },
        { id: 5, name: 'Guardião Verde', description: '500 EcoPoints', earned: false, points: 500, iconName: 'tree' },
        { id: 6, name: 'Mestre Ambiental', description: '1000 EcoPoints', earned: false, points: 1000, iconName: 'globe' },
        { id: 7, name: 'Sequenciador', description: '7 dias consecutivos', earned: false, points: 250, iconName: 'flame' },
        { id: 8, name: 'Quiz Master', description: 'Complete 10 quizzes', earned: false, points: 300, iconName: 'brain' },
        { id: 9, name: 'Gamer Eco', description: '1000 pontos no Eco Catcher', earned: false, points: 400, iconName: 'gamepad' },
      ]);
    }
    setLoading(false);
  };
  
  const addEcoPoints = async (points, type = 'game') => {
    try {
      console.log(`Adicionando ${points} pontos do tipo ${type}`);
      
      const actionName = type === 'quiz' ? 'Eco Quiz' : type === 'eco_catcher' ? 'Eco Catcher' : 'Jogo';
      const newTotal = addEcoPointsContext(points, actionName);
      
      // Atualizar dados locais
      setGamificationData(prev => ({
        ...prev,
        ecoPoints: newTotal
      }));
      
      return true;
    } catch (error) {
      console.error('Erro ao adicionar pontos:', error);
      return false;
    }
  };

  const badgeIcons = {
    'Bem-vindo': 'sparkles',
    'Primeiro Passo': 'leaf',
    'Reciclador': 'recycle',
    'Eco Warrior': 'trophy',
    'Guardião Verde': 'tree',
    'Mestre Ambiental': 'globe',
    'Sequenciador': 'flame',
    'Quiz Master': 'brain',
    'Gamer Eco': 'gamepad'
  };

  if (loading) {
    return <LoadingScreen message="Carregando dados..." />;
  }

  const missions = [
    { 
      id: 1, 
      title: 'Classificar 5 resíduos hoje', 
      progress: Math.min(gamificationData?.totalClassifications || 0, 5), 
      total: 5, 
      reward: 100, 
      iconName: 'target' 
    },
    { 
      id: 2, 
      title: 'Ganhar 100 EcoPoints', 
      progress: Math.min(contextUser?.ecoPoints || gamificationData?.ecoPoints || 0, 100), 
      total: 100, 
      reward: 50, 
      iconName: 'star' 
    },
    { 
      id: 3, 
      title: 'Conquistar primeira badge', 
      progress: badges.filter(b => b.earned).length > 0 ? 1 : 0, 
      total: 1, 
      reward: 25, 
      iconName: 'award' 
    }
  ];

  return (
    <div className="min-h-screen bg-surface-50 py-8 md:py-12">
      {/* Modal de Confirmação */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 md:p-8 max-w-md mx-4 text-center"
          >
            <Sparkles size={64} className="mx-auto mb-4 text-green-500" />
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
                  const success = await addEcoPoints(pendingPoints, pendingType);
                  if (success) {
                    setShowConfirmation(false);
                    setPendingPoints(0);
                    setPendingType('');
                    
                    // Forçar recarregamento dos dados após confirmação
                    setTimeout(() => {
                      loadGamificationData();
                    }, 1000);
                  } else {
                    console.log('Falha ao adicionar pontos');
                    alert('Erro ao adicionar pontos. Tente novamente.');
                  }
                }}
                className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all"
              >
                <Check size={20} className="inline mr-2" />
                Confirmar EcoPoints
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
                <X size={20} className="inline mr-2" />
                Cancelar
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Icon name="ecopoints" className="w-5 h-5" white />
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-stone-800 tracking-tight">
                EcoPoints & Conquistas
              </h1>
            </div>
            <p className="text-stone-500 ml-13 flex items-center gap-2">
              <Sparkles size={16} className="text-amber-500" />
              <span>Ganhe pontos, desbloqueie badges e suba no ranking inteligente</span>
            </p>
          </div>
          
          <div className="bg-white px-5 py-2.5 rounded-2xl shadow-sm border border-stone-100 flex items-center gap-3 w-fit">
            <div className="w-2 h-2 rounded-full bg-eco-500 animate-pulse" />
            <span className="text-sm font-medium text-stone-600">Gamificação Ativa</span>
          </div>
        </motion.div>

        {/* User Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {[
            { label: 'EcoPoints Totais', value: contextUser?.ecoPoints || gamificationData?.ecoPoints || 0, icon: 'ecopoints', color: 'text-amber-600', bg: 'bg-amber-50', border: 'hover:border-amber-200' },
            { label: 'Badges Conquistadas', value: badges.filter(b => b.earned).length, icon: 'recompensas', color: 'text-violet-600', bg: 'bg-violet-50', border: 'hover:border-violet-200' },
            { label: 'Posição no Ranking', value: `${ranking.find(r => r.isCurrentUser)?.position || '-'}º`, icon: 'trophy', color: 'text-blue-600', bg: 'bg-blue-50', border: 'hover:border-blue-200' },
            { label: 'Nível Atual', value: gamificationData?.level || 'Iniciante', icon: 'star', color: 'text-eco-600', bg: 'bg-eco-50', border: 'hover:border-eco-200' }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white p-6 rounded-3xl shadow-soft border border-stone-100 transition-all duration-300 ${stat.border} hover:shadow-lg group`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center transition-transform group-hover:scale-110 duration-300`}>
                  {stat.icon === 'trophy' || stat.icon === 'star' ? (
                    stat.icon === 'trophy' ? <Trophy className={`w-6 h-6 ${stat.color}`} /> : <Award className={`w-6 h-6 ${stat.color}`} />
                  ) : (
                    <Icon name={stat.icon} className="w-6 h-6" />
                  )}
                </div>
              </div>
              <div className="text-sm font-semibold text-stone-500 mb-1">{stat.label}</div>
              <div className="text-2xl md:text-3xl font-black text-stone-800 tracking-tight">{stat.value}</div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex flex-row flex-wrap gap-2 bg-stone-100/80 p-2 rounded-2xl border border-stone-200 backdrop-blur w-full max-w-full overflow-x-auto custom-scrollbar md:w-auto md:justify-center">
            {[
              { id: 'overview', label: 'Visão Geral', icon: 'bi-grid-1x2-fill' },
              { id: 'quiz', label: 'Eco Quiz', icon: 'bi-lightning-charge-fill' },
              { id: 'game', label: 'Eco Catcher', icon: 'bi-controller' },
              { id: 'badges', label: 'Conquistas', icon: 'bi-patch-check-fill' },
              { id: 'ranking', label: 'Ranking', icon: 'bi-trophy-fill' },
              { id: 'missions', label: 'Desafios', icon: 'bi-bullseye' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 whitespace-nowrap shrink-0 ${
                  selectedTab === tab.id
                    ? 'bg-white text-stone-800 shadow-sm border border-stone-200'
                    : 'text-stone-500 hover:text-stone-700 hover:bg-white/50 border border-transparent'
                }`}
              >
                <i className={`${tab.icon} ${selectedTab === tab.id ? 'text-amber-500' : ''}`}></i>
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
                  <Brain size={96} className="mx-auto mb-6 text-purple-500" />
                  <h2 className="text-3xl font-bold mb-4">Eco Quiz Challenge!</h2>
                  <p className="text-gray-600 mb-8 text-lg">
                    Teste seus conhecimentos sobre sustentabilidade e ganhe até <span className="font-bold text-green-600">305 EcoPoints</span>!
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setEcoQuestions(getRandomQuestions(5));
                      setQuizActive(true);
                      setCurrentQuestion(0);
                      setQuizScore(0);
                      setSelectedAnswer(null);
                      setShowResult(false);
                    }}
                    className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-lg transition-all"
                  >
                    <Sparkles size={20} className="inline mr-2" />
                    Começar Quiz!
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
                  <Trophy size={96} className="mx-auto mb-6 text-yellow-500" />
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
                        setEcoQuestions(getRandomQuestions(5));
                        setQuizCompleted(false);
                        setQuizActive(true);
                        setCurrentQuestion(0);
                        setQuizScore(0);
                        setSelectedAnswer(null);
                        setShowResult(false);
                      }}
                      className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-xl font-bold"
                    >
                      <RotateCcw size={20} className="inline mr-2" />
                      Jogar Novamente
                    </motion.button>
                    <motion.button
                      onClick={() => {
                        setQuizCompleted(false);
                        setSelectedTab('overview');
                      }}
                      className="bg-gray-500 text-white px-6 py-3 rounded-xl font-bold"
                    >
                      <BarChart3 size={20} className="inline mr-2" />
                      Ver Dashboard
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
              className="bg-white rounded-3xl shadow-soft border border-stone-100 p-6 md:p-8"
            >
              {!gameActive && !gameOver && (
                <div className="text-center py-8">
                  <div className="w-24 h-24 bg-green-50 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner relative overflow-hidden">
                    <div className="absolute inset-0 bg-green-500/10 blur-xl rounded-full mix-blend-multiply" />
                    <Gamepad2 size={48} className="text-green-500 relative z-10" />
                  </div>
                  <h2 className="text-3xl font-black text-stone-800 tracking-tight mb-4">Eco Catcher!</h2>
                  <p className="text-stone-500 font-medium mb-8 max-w-md mx-auto">
                    Pegue o lixo reciclável que cai do céu antes que o tempo acabe! Use <kbd className="bg-stone-100 px-2 py-1 rounded-lg text-stone-700 font-bold border border-stone-200">{'<-'}</kbd> <kbd className="bg-stone-100 px-2 py-1 rounded-lg text-stone-700 font-bold border border-stone-200">{'->'}</kbd> ou <kbd className="bg-stone-100 px-2 py-1 rounded-lg text-stone-700 font-bold border border-stone-200">A</kbd> <kbd className="bg-stone-100 px-2 py-1 rounded-lg text-stone-700 font-bold border border-stone-200">D</kbd> para mover.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setGameActive(true);
                      setGameScore(0);
                      setGameTime(15);
                      setPlayerPos(50);
                      setItems([]);
                      setGameOver(false);
                      keysPressed.current = { left: false, right: false };
                      playerPosRef.current = 50;
                    }}
                    className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 mx-auto"
                  >
                    <Sparkles size={20} />
                    Começar Jogo!
                  </motion.button>
                </div>
              )}
              
              {gameActive && (
                <div>
                  <div className="flex justify-between items-center mb-6 bg-stone-50 p-4 rounded-2xl border border-stone-100">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 font-bold">
                        <Award size={24} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-stone-400 uppercase tracking-wider">Score</div>
                        <div className="text-2xl font-black text-stone-800 leading-none">{gameScore} <span className="text-sm font-semibold text-amber-500">pts</span></div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-xs font-bold text-stone-400 uppercase tracking-wider">Tempo Restante</div>
                        <div className={`text-2xl font-black leading-none ${gameTime <= 5 ? 'text-red-500 animate-pulse' : 'text-stone-800'}`}>00:{gameTime.toString().padStart(2, '0')}</div>
                      </div>
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg ${gameTime <= 5 ? 'bg-red-100 text-red-500' : 'bg-blue-100 text-blue-600'}`}>
                        {gameTime}
                      </div>
                    </div>
                  </div>
                  
                  <div 
                    className="relative bg-gradient-to-b from-blue-50 to-green-50 border-2 border-stone-200 rounded-3xl overflow-hidden select-none shadow-inner"
                    style={{ height: '400px', touchAction: 'none' }}
                    onWheel={(e) => e.preventDefault()}
                    onTouchMove={(e) => e.preventDefault()}
                  >
                    {/* Player */}
                    <div 
                      className="absolute bottom-4 w-16 h-16 bg-white border-4 border-green-500 rounded-full flex items-center justify-center shadow-lg z-10"
                      style={{ left: `${playerPos}%`, transform: 'translateX(-50%)' }}
                    >
                      <AppIcon name="user" size={32} className="text-green-600" />
                    </div>
                    
                    {/* Falling Items */}
                    {items.map(item => (
                      <div
                        key={item.id}
                        className={`absolute flex items-center justify-center w-12 h-12 rounded-xl shadow-md ${item.isBad ? 'bg-red-50 border-2 border-red-200' : 'bg-white border-2 border-stone-200'}`}
                        style={{ 
                          left: `${item.x}%`, 
                          top: `${item.y}%`,
                          transform: 'translate(-50%, -50%)',
                          transition: 'top 50ms linear, left 50ms linear'
                        }}
                      >
                        {item.isBad ? <Flame size={24} className="text-red-500" /> : <AppIcon name={item.iconName} size={28} className="text-stone-700" />}
                      </div>
                    ))}
                    
                    {/* Controls hint */}
                    <div className="absolute top-4 left-4 bg-white/80 backdrop-blur px-3 py-1.5 rounded-lg text-xs font-bold text-stone-600 border border-white">
                      Use as setas para mover
                    </div>
                  </div>
                  
                  <div className="mt-6 flex flex-wrap justify-center gap-3">
                    {wasteItems.map(item => (
                      <div key={item.type} className="bg-white border border-stone-100 shadow-sm px-3 py-2 rounded-xl flex items-center gap-2">
                        <AppIcon name={item.iconName} size={20} className="text-stone-600" />
                        <div className="font-bold text-sm text-stone-800">+{item.points}</div>
                      </div>
                    ))}
                    <div className="bg-red-50 border border-red-100 shadow-sm px-3 py-2 rounded-xl flex items-center gap-2">
                      <div className="w-6 h-6 flex items-center justify-center"><Flame size={18} className="text-red-500" /></div>
                      <div className="font-bold text-sm text-red-600">-15 pts</div>
                    </div>
                  </div>
                </div>
              )}
              
              {gameOver && !showConfirmation && (
                <div className="text-center py-8">
                  <div className="w-24 h-24 bg-amber-50 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner relative">
                    <div className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-sm">
                      <Sparkles size={24} className="text-amber-400" />
                    </div>
                    <Trophy size={48} className="text-amber-500" />
                  </div>
                  
                  <h2 className="text-3xl font-black text-stone-800 tracking-tight mb-2">Fim de Jogo!</h2>
                  <p className="text-stone-500 font-medium mb-8">O tempo acabou, veja como você se saiu:</p>
                  
                  <div className="bg-stone-50 border border-stone-100 p-8 rounded-3xl max-w-sm mx-auto mb-8 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-blue-500" />
                    <div className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-2">Pontuação Final</div>
                    <div className="text-6xl font-black text-stone-800 tracking-tighter mb-2">
                      {gameScore}
                    </div>
                    <div className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 px-3 py-1.5 rounded-lg font-bold text-sm">
                      <Check size={16} /> EcoPoints Adquiridos
                    </div>
                  </div>

                  <p className="text-stone-600 font-medium mb-8 max-w-md mx-auto">
                    Seus pontos foram validados pelo nosso sistema e já estão no seu perfil!
                  </p>

                  <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setGameOver(false);
                        setGameActive(true);
                        setGameScore(0);
                        setGameTime(15);
                        setPlayerPos(50);
                        setItems([]);
                        keysPressed.current = { left: false, right: false };
                        playerPosRef.current = 50;
                      }}
                      className="bg-stone-800 hover:bg-stone-900 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-sm flex items-center justify-center gap-2"
                    >
                      <RotateCcw size={20} />
                      Jogar Novamente
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setGameOver(false);
                        setSelectedTab('overview');
                      }}
                      className="bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 px-8 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
                    >
                      <BarChart3 size={20} />
                      Ver Dashboard
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
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
            >
              {badges.map((badge, index) => (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative p-6 rounded-3xl border transition-all duration-300 flex flex-col items-center text-center ${
                    badge.earned 
                      ? 'bg-white shadow-soft border-stone-100 hover:shadow-lg hover:border-amber-200 group' 
                      : 'bg-stone-50 border-stone-100 opacity-75 grayscale hover:grayscale-0 hover:opacity-100'
                  }`}
                >
                  {badge.earned && (
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center border-4 border-surface-50">
                      <Check size={14} className="text-amber-600 font-bold" />
                    </div>
                  )}
                  <div className={`w-16 h-16 rounded-2xl mb-4 flex items-center justify-center transition-transform ${badge.earned ? 'bg-amber-50 group-hover:scale-110 group-hover:bg-amber-100' : 'bg-stone-200'}`}>
                    <AppIcon name={badge.iconName || badgeIcons[badge.name] || 'award'} size={32} className={badge.earned ? 'text-amber-500' : 'text-stone-400'} />
                  </div>
                  <h3 className={`font-bold mb-1 ${badge.earned ? 'text-stone-800' : 'text-stone-500'}`}>{badge.name}</h3>
                  <p className="text-stone-500 text-xs mb-4 min-h-[32px]">{badge.description}</p>
                  <div className={`px-3 py-1.5 rounded-lg text-xs font-bold w-full ${
                    badge.earned 
                      ? 'bg-amber-50 text-amber-600' 
                      : 'bg-stone-200 text-stone-500'
                  }`}>
                    {badge.earned ? `+${badge.points} EcoPoints` : 'Bloqueada'}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {selectedTab === 'ranking' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-soft border border-stone-100 p-6 md:p-8"
            >
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-stone-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-bold text-stone-800">Ranking Global</h2>
                </div>
                <div className="bg-stone-50 px-4 py-2 rounded-xl text-sm font-medium text-stone-600 flex items-center gap-2 border border-stone-100">
                  <Globe className="w-4 h-4 text-stone-400" />
                  Temporada Atual
                </div>
              </div>
              
              <div className="space-y-3">
                {ranking.map((player, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${
                      player.isCurrentUser
                        ? 'bg-gradient-to-r from-blue-50/50 to-indigo-50/50 border-blue-200 shadow-sm'
                        : 'bg-stone-50 border-stone-100 hover:bg-white hover:shadow-sm hover:border-stone-200'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                        player.position === 1 ? 'bg-amber-100 text-amber-600 shadow-inner' :
                        player.position === 2 ? 'bg-stone-200 text-stone-600 shadow-inner' :
                        player.position === 3 ? 'bg-orange-100 text-orange-600 shadow-inner' :
                        'bg-stone-100 text-stone-500'
                      }`}>
                        {player.position <= 3 ? 
                          <Medal size={24} className={player.position === 1 ? 'text-amber-500' : player.position === 2 ? 'text-stone-500' : 'text-orange-500'} /> : 
                          player.position
                        }
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-white border border-stone-100 flex items-center justify-center shadow-sm">
                        <AppIcon name={player.avatarIcon} size={24} className="text-stone-600" />
                      </div>
                      <div>
                        <div className="font-bold text-stone-800 flex items-center gap-2">
                          {player.name}
                          {player.isCurrentUser && <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-md font-bold">Você</span>}
                        </div>
                        <div className="text-sm font-medium text-stone-500 mt-0.5">
                          {player.level || 'Usuário'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-xl text-stone-800 tracking-tight">{player.points.toLocaleString()}</div>
                      <div className="text-xs font-bold text-amber-500 uppercase tracking-wider">EcoPoints</div>
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
              className="grid lg:grid-cols-2 gap-6"
            >
              {missions.map((mission, index) => (
                <motion.div
                  key={mission.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white p-6 md:p-8 rounded-3xl shadow-soft border border-stone-100 relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-green-50 to-transparent rounded-bl-full opacity-50 pointer-events-none" />
                  
                  <div className="flex items-start gap-4 mb-6 relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center shrink-0">
                      <AppIcon name={mission.iconName} size={28} className="text-green-600" />
                    </div>
                    <div className="flex-1 pt-1">
                      <h3 className="font-bold text-stone-800 text-lg leading-tight mb-1">{mission.title}</h3>
                      <div className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-lg text-xs font-bold">
                        <Award size={14} />
                        +{mission.reward} EcoPoints
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between text-sm font-bold text-stone-600">
                      <span>Progresso</span>
                      <span>{mission.progress} / {mission.total}</span>
                    </div>
                    <div className="w-full bg-stone-100 rounded-full h-3 overflow-hidden shadow-inner">
                      <motion.div
                        className="bg-gradient-to-r from-green-400 to-emerald-500 h-full rounded-full relative"
                        initial={{ width: 0 }}
                        animate={{ width: `${(mission.progress / mission.total) * 100}%` }}
                        transition={{ duration: 1, delay: index * 0.2 }}
                      >
                        <div className="absolute inset-0 bg-white/20 w-full animate-pulse" />
                      </motion.div>
                    </div>
                  </div>
                  
                  <div className="mt-auto">
                    {mission.progress === mission.total ? (
                      <button className="w-full bg-stone-100 text-stone-400 px-4 py-3.5 rounded-xl font-bold inline-flex items-center justify-center gap-2 cursor-default border border-stone-200">
                        <Check size={18} className="text-green-500" />
                        Missão Concluída
                      </button>
                    ) : (
                      <button className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-3.5 rounded-xl font-bold transition-all duration-300 shadow-sm shadow-green-500/20 active:scale-[0.98]">
                        Continuar Missão
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
              className="grid lg:grid-cols-2 gap-6 lg:gap-8"
            >
              {/* Jogos Rápidos */}
              <div className="bg-white rounded-3xl shadow-soft border border-stone-100 p-6 md:p-8 flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Gamepad2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold text-stone-800">Jogos Rápidos</h3>
                </div>
                <div className="space-y-3 flex-1">
                  <button
                    onClick={() => setSelectedTab('quiz')}
                    className="w-full p-4 bg-stone-50 border border-stone-100 hover:bg-white hover:shadow-md hover:border-purple-200 rounded-2xl transition-all duration-300 flex items-center gap-4 group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <Brain className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="text-left flex-1">
                      <div className="font-bold text-stone-800">Eco Quiz</div>
                      <div className="text-sm font-medium text-stone-500 mt-0.5">Até 305 EcoPoints</div>
                    </div>
                    <div className="w-8 h-8 rounded-full border border-stone-200 flex items-center justify-center bg-white group-hover:bg-purple-50 group-hover:border-purple-200 transition-colors">
                      <i className="bi bi-arrow-right text-stone-400 group-hover:text-purple-600"></i>
                    </div>
                  </button>

                  <button
                    onClick={() => setSelectedTab('game')}
                    className="w-full p-4 bg-stone-50 border border-stone-100 hover:bg-white hover:shadow-md hover:border-green-200 rounded-2xl transition-all duration-300 flex items-center gap-4 group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <Gamepad2 className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="text-left flex-1">
                      <div className="font-bold text-stone-800">Eco Catcher</div>
                      <div className="text-sm font-medium text-stone-500 mt-0.5">Pegue lixo reciclável</div>
                    </div>
                    <div className="w-8 h-8 rounded-full border border-stone-200 flex items-center justify-center bg-white group-hover:bg-green-50 group-hover:border-green-200 transition-colors">
                      <i className="bi bi-arrow-right text-stone-400 group-hover:text-green-600"></i>
                    </div>
                  </button>

                  <button
                    onClick={() => window.location.href = '/eco-catcher'}
                    className="w-full p-4 bg-stone-50 border border-stone-100 hover:bg-white hover:shadow-md hover:border-orange-200 rounded-2xl transition-all duration-300 flex items-center gap-4 group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <Gamepad2 className="w-6 h-6 text-orange-600" />
                    </div>
                    <div className="text-left flex-1">
                      <div className="font-bold text-stone-800">Eco Catcher Phaser</div>
                      <div className="text-sm font-medium text-stone-500 mt-0.5">Versão completa</div>
                    </div>
                    <div className="w-8 h-8 rounded-full border border-stone-200 flex items-center justify-center bg-white group-hover:bg-orange-50 group-hover:border-orange-200 transition-colors">
                      <i className="bi bi-arrow-right text-stone-400 group-hover:text-orange-600"></i>
                    </div>
                  </button>
                </div>
              </div>

              {/* Recent Badges */}
              <div className="bg-white rounded-3xl shadow-soft border border-stone-100 p-6 md:p-8 flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                    <Award className="w-5 h-5 text-amber-600" />
                  </div>
                  <h3 className="text-lg font-bold text-stone-800">Últimas Conquistas</h3>
                </div>
                <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                  {badges.filter(b => b.earned).length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center py-8">
                      <div className="w-16 h-16 rounded-2xl bg-stone-50 flex items-center justify-center mb-4">
                        <Award className="w-8 h-8 text-stone-300" />
                      </div>
                      <p className="text-stone-800 font-medium mb-1">Nenhuma conquista ainda</p>
                      <p className="text-sm text-stone-500">Jogue para ganhar badges!</p>
                    </div>
                  )}
                  {badges.filter(b => b.earned).slice(-3).map((badge) => (
                    <div key={badge.id} className="flex items-center gap-4 p-4 rounded-2xl border border-stone-50 hover:bg-stone-50 transition-colors group">
                      <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <AppIcon name={badge.iconName} size={24} className="text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-stone-800">{badge.name}</div>
                        <div className="text-sm font-medium text-stone-500 mt-0.5">+{badge.points} EcoPoints</div>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center">
                        <Check size={14} className="text-amber-600" />
                      </div>
                    </div>
                  ))}
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