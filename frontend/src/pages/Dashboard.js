import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, BarElement, Filler } from 'chart.js';
import { useEcoPoints } from '../hooks/useEcoPoints';
import { gamificationAPI } from '../services/api';
import DailyQuiz from '../components/DailyQuiz';
import { Brain, Flame, Target, BarChart3, Leaf, Sparkles, Users } from 'lucide-react';
import EcoGlobeLogo from '../components/ui/EcoGlobeLogo';
import LoadingScreen from '../components/ui/LoadingScreen';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, BarElement, Filler);

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
    return <LoadingScreen message="Carregando dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-surface-50 py-8 md:py-12">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-eco-500 to-teal-600 flex items-center justify-center shadow-lg shadow-eco-500/20">
                <Icon name="dashboard" className="w-5 h-5" white />
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-stone-800 tracking-tight">
                Visão Geral
              </h1>
            </div>
            <p className="text-stone-500 ml-13 flex items-center gap-2">
              <Sparkles size={16} className="text-amber-500" />
              <span>Seu impacto sustentável gerado pela IA EcoSphere</span>
            </p>
          </div>
          
          <div className="bg-white px-5 py-2.5 rounded-2xl shadow-sm border border-stone-100 flex items-center gap-3 w-fit">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium text-stone-600">Sistema Online</span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {[
            { icon: "ecopoints", title: "EcoPoints Acumulados", value: userStats.ecoPoints.toLocaleString(), color: "text-eco-600", bg: "bg-eco-50", border: "hover:border-eco-200" },
            { icon: "rocket", title: "Ações Validadas", value: userStats.actions, color: "text-blue-600", bg: "bg-blue-50", border: "hover:border-blue-200" },
            { icon: "recompensas", title: "Conquistas", value: userStats.badges, color: "text-violet-600", bg: "bg-violet-50", border: "hover:border-violet-200" },
            { icon: "ecopoints", title: "Nível de Perfil", value: userStats.level, color: "text-amber-600", bg: "bg-amber-50", border: "hover:border-amber-200" }
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
                  <Icon name={stat.icon} className="w-6 h-6" />
                </div>
                <div className="w-8 h-8 rounded-full border border-stone-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <i className="bi bi-arrow-up-right text-stone-400"></i>
                </div>
              </div>
              <h3 className="text-sm font-semibold text-stone-500 mb-1">{stat.title}</h3>
              <div className="text-3xl font-black text-stone-800 tracking-tight">
                {stat.value}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quiz Diário e Calculadora de Carbono */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="group bg-white p-6 rounded-3xl shadow-soft border border-stone-100 cursor-pointer transition-all duration-300 hover:shadow-xl hover:border-violet-200 relative overflow-hidden"
            onClick={() => setShowDailyQuiz(true)}
          >
            {/* Gradiente de fundo sutil */}
            <div className="absolute inset-0 bg-gradient-to-br from-violet-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center text-violet-600">
                    <Brain size={20} />
                  </div>
                  <h3 className="text-xl font-bold text-stone-800">Quiz Diário</h3>
                </div>
                <p className="text-stone-500 text-sm mb-4">Teste seus conhecimentos e ganhe pontos!</p>
                <div className="flex items-center gap-2 bg-orange-50 text-orange-600 px-3 py-1.5 rounded-lg w-fit">
                  <Flame size={16} className="text-orange-500" />
                  <span className="text-xs font-bold">7 dias de sequência</span>
                </div>
              </div>
              <div className="w-16 h-16 rounded-full bg-violet-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                <Target size={32} className="text-violet-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="group bg-white p-6 rounded-3xl shadow-soft border border-stone-100 cursor-pointer transition-all duration-300 hover:shadow-xl hover:border-eco-200 relative overflow-hidden"
            onClick={() => window.location.href = '/calculadora-carbono'}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-eco-50/50 to-teal-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-eco-500 to-teal-600 flex items-center justify-center shadow-lg shadow-eco-500/20">
                    <Leaf size={24} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-stone-800">Pegada de Carbono</h3>
                </div>
                <p className="text-stone-500 text-sm mb-4">Calcule seu impacto ambiental!</p>
                <div className="flex items-center gap-2 bg-stone-100 text-stone-600 px-3 py-1.5 rounded-lg w-fit group-hover:bg-eco-100 group-hover:text-eco-700 transition-colors">
                  <BarChart3 size={16} />
                  <span className="text-xs font-bold">Descubra agora</span>
                </div>
              </div>
              <div className="w-16 h-16 rounded-full bg-eco-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                <Leaf size={32} className="text-eco-400" />
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-6 md:p-8 rounded-3xl shadow-soft border border-stone-100 mb-10 relative overflow-hidden"
        >
          {/* Brilho decorativo no fundo escuro */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-100/50 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-eco-100/50 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8 pb-6 border-b border-stone-100">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-eco-500 to-teal-600 flex items-center justify-center shadow-lg shadow-eco-500/20">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold tracking-tight text-stone-800">Impacto Coletivo da Plataforma</h3>
                <p className="text-stone-500 text-sm">O que já construímos juntos com a comunidade</p>
              </div>
            </div>
            
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 divide-x-0 md:divide-x divide-stone-100">
              <div className="md:px-4 first:px-0">
                <div className="text-4xl font-black text-amber-500 tracking-tighter mb-1">12.5k+</div>
                <div className="text-stone-500 text-sm font-medium">Classificações Feitas</div>
              </div>
              <div className="md:px-4">
                <div className="text-4xl font-black text-eco-500 tracking-tighter mb-1">31.4<span className="text-2xl">t</span></div>
                <div className="text-stone-500 text-sm font-medium">CO2 Economizado</div>
              </div>
              <div className="md:px-4">
                <div className="text-4xl font-black text-blue-500 tracking-tighter mb-1">1.4k</div>
                <div className="text-stone-500 text-sm font-medium">Árvores Equivalentes</div>
              </div>
              <div className="md:px-4">
                <div className="text-4xl font-black text-purple-500 tracking-tighter mb-1">3.8k</div>
                <div className="text-stone-500 text-sm font-medium">Usuários Ativos</div>
              </div>
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
            className="bg-white p-6 rounded-3xl shadow-soft border border-stone-100"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-stone-800 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-eco-50 flex items-center justify-center">
                  <i className="bi bi-graph-up text-eco-600 text-lg"></i>
                </div>
                Evolução EcoPoints
              </h3>
              <span className="text-xs font-medium text-eco-600 bg-eco-50 px-2 py-1 rounded-md border border-eco-100">+15% essa semana</span>
            </div>
            <div className="h-64">
              <Line data={ecoPointsData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { border: { dash: [4, 4] }, grid: { color: '#f5f5f4' } }, x: { grid: { display: false } } } }} />
            </div>
          </motion.div>

          {/* Actions Distribution */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white p-6 rounded-3xl shadow-soft border border-stone-100"
          >
            <h3 className="text-lg font-bold text-stone-800 mb-6 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <i className="bi bi-pie-chart text-blue-600 text-lg"></i>
              </div>
              Distribuição de Ações
            </h3>
            <div className="h-64 flex items-center justify-center relative">
              <Doughnut data={actionsData} options={{ responsive: true, maintainAspectRatio: false, cutout: '75%', plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } } } }} />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                <span className="text-3xl font-black text-stone-800">{userStats.actions}</span>
                <span className="text-xs font-medium text-stone-500 uppercase tracking-widest">Ações</span>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Weekly Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white p-6 rounded-3xl shadow-soft border border-stone-100 lg:col-span-2"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-stone-800 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                  <i className="bi bi-calendar-week text-amber-600 text-lg"></i>
                </div>
                Atividade Semanal
              </h3>
            </div>
            <div className="h-64">
              <Bar data={weeklyData} options={{ responsive: true, maintainAspectRatio: false, borderRadius: 6, plugins: { legend: { display: false } }, scales: { y: { grid: { color: '#f5f5f4' } }, x: { grid: { display: false } } } }} />
            </div>
          </motion.div>

          {/* Recent Activities */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white p-6 rounded-3xl shadow-soft border border-stone-100 flex flex-col"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-stone-800">Atividades Recentes</h3>
              <button className="text-sm font-medium text-eco-600 hover:text-eco-700 transition-colors">Ver todas</button>
            </div>
            <div className="space-y-4 flex-1">
            {userStats.actions > 0 ? [
              { action: "Classificou resíduos com IA", points: "+25", time: "Há 2 horas", icon: "camera", bg: "bg-blue-50", color: "text-blue-600" },
              { action: "Completou Eco Quiz", points: "+50", time: "Ontem", icon: "educacao", bg: "bg-violet-50", color: "text-violet-600" },
              { action: "Jogou Eco Catcher", points: "+30", time: "Há 2 dias", icon: "rocket", bg: "bg-amber-50", color: "text-amber-600" }
            ].slice(0, Math.min(3, userStats.actions)).map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="flex items-center justify-between p-4 rounded-2xl border border-stone-50 hover:bg-stone-50 transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  {typeof activity.icon === 'string' && !activity.icon.includes('�') ? (
                    <div className="w-8 h-8 mr-3 flex items-center justify-center">
                      <Icon name={activity.icon} className="w-full h-full" />
                    </div>
                  ) : (
                    <span className="text-2xl mr-3">{activity.icon}</span>
                  )}
                  <div>
                    <p className="font-semibold text-stone-800 text-sm">{activity.action}</p>
                    <p className="text-xs text-stone-500 font-medium mt-0.5">{activity.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded-lg">
                  <span className="font-bold text-sm">{activity.points}</span>
                </div>
              </motion.div>
            )) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <div className="w-16 h-16 rounded-2xl bg-stone-50 flex items-center justify-center mb-4">
                  <Leaf size={32} className="text-stone-300" />
                </div>
                <p className="text-stone-800 font-medium mb-1">Nenhuma atividade ainda</p>
                <p className="text-sm text-stone-500">Classifique resíduos para começar!</p>
              </div>
            )}
            </div>
          </motion.div>
        </div>

        {/* Daily Quiz Modal */}
        <AnimatePresence>
          {showDailyQuiz && <DailyQuiz onClose={() => setShowDailyQuiz(false)} />}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Dashboard;