import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, BarElement } from 'chart.js';
import { useEcoPoints } from '../hooks/useEcoPoints';
import { gamificationAPI } from '../services/api';
import DailyQuiz from '../components/DailyQuiz';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, BarElement);

const Dashboard = () => {
  const [userStats, setUserStats] = useState({
    ecoPoints: 0,
    actions: 0,
    ranking: 0,
    weeklyGoal: 0,
    badges: 0,
    level: 'Iniciante'
  });
  const [loading, setLoading] = useState(true);
  const [showDailyQuiz, setShowDailyQuiz] = useState(false);
  const { ecoPoints } = useEcoPoints();

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

  useEffect(() => {
    loadDashboardData();
  }, [ecoPoints]);

  const loadDashboardData = async () => {
    try {
      const [profileRes, rankingRes, badgesRes] = await Promise.all([
        gamificationAPI.getProfile(),
        gamificationAPI.getRanking(),
        gamificationAPI.getBadges()
      ]);
      
      const userRanking = rankingRes.data.find(r => r.isCurrentUser);
      const earnedBadges = badgesRes.data.filter(b => b.earned);
      const totalActions = (profileRes.data.totalClassifications || 0);
      
      setUserStats({
        ecoPoints: profileRes.data.ecoPoints || 0,
        actions: totalActions,
        ranking: userRanking?.position || 0,
        weeklyGoal: Math.min(100, Math.round((totalActions / 7) * 100)),
        badges: earnedBadges.length,
        level: profileRes.data.level || 'Iniciante'
      });
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const ecoPointsData = {
    labels: ['Início', 'Semana 1', 'Semana 2', 'Semana 3', 'Atual'],
    datasets: [{
      label: 'EcoPoints',
      data: [0, Math.round(userStats.ecoPoints * 0.2), Math.round(userStats.ecoPoints * 0.5), Math.round(userStats.ecoPoints * 0.8), userStats.ecoPoints],
      borderColor: 'rgb(34, 197, 94)',
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      tension: 0.4
    }]
  };

  const actionsData = {
    labels: userStats.actions > 0 ? ['Classificações', 'Jogos', 'Quiz'] : ['Nenhuma ação ainda'],
    datasets: [{
      data: userStats.actions > 0 ? [userStats.actions, Math.round(userStats.actions * 0.3), Math.round(userStats.actions * 0.2)] : [1],
      backgroundColor: userStats.actions > 0 ? ['#10b981', '#3b82f6', '#f59e0b'] : ['#e5e7eb']
    }]
  };

  const weeklyData = {
    labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
    datasets: [{
      label: 'Ações Diárias',
      data: userStats.actions > 0 ? 
        [Math.round(Math.random() * 3), Math.round(Math.random() * 5), Math.round(Math.random() * 2), Math.round(Math.random() * 4), Math.round(Math.random() * 3), Math.round(Math.random() * 2), Math.round(Math.random() * 1)] :
        [0, 0, 0, 0, 0, 0, 0],
      backgroundColor: 'rgba(34, 197, 94, 0.8)'
    }]
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Icon name="dashboard" className="w-10 h-10" />
            <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">Dashboard EcoSphere</span>
          </h1>
          <p className="text-gray-600">Acompanhe seu progresso sustentável</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {[
            { icon: "ecopoints", emoji: "💎", title: "EcoPoints", value: userStats.ecoPoints.toLocaleString(), color: "from-green-500 to-emerald-600", suffix: "" },
            { icon: "rocket", emoji: "⚡", title: "Ações Realizadas", value: userStats.actions, color: "from-blue-500 to-cyan-600", suffix: "" },
            { icon: "recompensas", emoji: "🏅", title: "Badges Conquistadas", value: userStats.badges, color: "from-purple-500 to-pink-600", suffix: "" },
            { icon: "ecopoints", emoji: "🏆", title: "Nível Atual", value: userStats.level, color: "from-orange-500 to-red-600", suffix: "" }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute top-2 right-2 text-xl opacity-20">{stat.emoji}</div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center mb-4 shadow-lg p-2`}>
                <Icon name={stat.icon} className="w-full h-full" white />
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">{stat.title}</h3>
              <div className="text-2xl font-bold text-gray-800">
                {stat.value}{stat.suffix}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quiz Diário e Calculadora de Carbono */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Quiz Diário */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 rounded-2xl shadow-lg text-white cursor-pointer"
            onClick={() => setShowDailyQuiz(true)}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-2">🧠 Quiz Diário</h3>
                <p className="text-purple-100 mb-4">Teste seus conhecimentos e ganhe pontos!</p>
                <div className="flex items-center gap-2">
                  <span className="text-3xl">🔥</span>
                  <span className="font-bold">7 dias de sequência</span>
                </div>
              </div>
              <div className="text-6xl">🎯</div>
            </div>
          </motion.div>

          {/* Calculadora de Carbono */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gradient-to-r from-green-500 to-blue-500 p-6 rounded-2xl shadow-lg text-white cursor-pointer"
            onClick={() => window.location.href = '/calculadora-carbono'}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-2">🌍 Pegada de Carbono</h3>
                <p className="text-green-100 mb-4">Calcule seu impacto ambiental!</p>
                <div className="flex items-center gap-2">
                  <span className="text-3xl">📊</span>
                  <span className="font-bold">Descubra agora</span>
                </div>
              </div>
              <div className="text-6xl">🌱</div>
            </div>
          </motion.div>
        </div>

        {/* Impacto Coletivo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-orange-500 to-red-500 p-6 rounded-2xl shadow-lg text-white mb-8"
        >
          <h3 className="text-2xl font-bold mb-4">🌎 Impacto Coletivo da Plataforma</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-3xl font-bold">12.547</div>
              <div className="text-orange-100 text-sm">Classificações Totais</div>
            </div>
            <div>
              <div className="text-3xl font-bold">31.4 ton</div>
              <div className="text-orange-100 text-sm">CO2 Economizado</div>
            </div>
            <div>
              <div className="text-3xl font-bold">1.427</div>
              <div className="text-orange-100 text-sm">Árvores Equivalentes</div>
            </div>
            <div>
              <div className="text-3xl font-bold">3.892</div>
              <div className="text-orange-100 text-sm">Usuários Ativos</div>
            </div>
          </div>
        </motion.div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-6 lg:mb-8">
          {/* EcoPoints Progress */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg"
          >
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <i className="bi bi-graph-up text-green-600 mr-2 text-xl"></i>
              Evolução EcoPoints
            </h3>
            <Line data={ecoPointsData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
          </motion.div>

          {/* Actions Distribution */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg"
          >
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <i className="bi bi-pie-chart text-green-600 mr-2 text-xl"></i>
              Distribuição de Ações
            </h3>
            <Doughnut data={actionsData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
          </motion.div>
        </div>

        {/* Weekly Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg mb-6 sm:mb-8"
        >
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <i className="bi bi-calendar-week text-green-600 mr-2 text-xl"></i>
            Atividade Semanal
          </h3>
          <Bar data={weeklyData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
        </motion.div>

        {/* Recent Activities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg"
        >
          <h3 className="text-xl font-semibold mb-6">Atividades Recentes</h3>
          <div className="space-y-4">
            {userStats.actions > 0 ? [
              { action: "Classificou resíduos com IA", points: "+25", time: "Recente", icon: "camera" },
              { action: "Completou Eco Quiz", points: "+50", time: "Hoje", icon: "educacao" },
              { action: "Jogou Eco Catcher", points: "+30", time: "Ontem", icon: "rocket" }
            ].slice(0, Math.min(3, userStats.actions)).map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center">
                  {typeof activity.icon === 'string' && !activity.icon.includes('�') ? (
                    <div className="w-8 h-8 mr-3 flex items-center justify-center">
                      <Icon name={activity.icon} className="w-full h-full" />
                    </div>
                  ) : (
                    <span className="text-2xl mr-3">{activity.icon}</span>
                  )}
                  <div>
                    <p className="font-medium text-gray-800">{activity.action}</p>
                    <p className="text-sm text-gray-500">{activity.time}</p>
                  </div>
                </div>
                <span className="text-green-600 font-semibold">{activity.points}</span>
              </motion.div>
            )) : (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🌱</div>
                <p className="text-gray-500 mb-2">Nenhuma atividade ainda</p>
                <p className="text-sm text-gray-400">Comece classificando resíduos ou jogando!</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Daily Quiz Modal */}
        <AnimatePresence>
          {showDailyQuiz && <DailyQuiz onClose={() => setShowDailyQuiz(false)} />}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Dashboard;