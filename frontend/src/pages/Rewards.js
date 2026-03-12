import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../contexts/UserContext';
import { AppIcon } from '../components/ui/AppIcon';
import { Gift, Sparkles, Check, X, CreditCard } from 'lucide-react';

const Rewards = () => {
  const [selectedCategory, setSelectedCategory] = useState('education');
  const { user, spendEcoPoints } = useUser();
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [selectedReward, setSelectedReward] = useState(null);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationData, setNotificationData] = useState({ type: '', message: '', iconName: 'sparkles' });

  const categories = [
    { id: 'education', label: 'Educação', iconName: 'book', color: 'from-blue-500 to-cyan-500' },
    { id: 'products', label: 'Eco-Friendly', iconName: 'leaf', color: 'from-green-500 to-emerald-500' },
    { id: 'digital', label: 'Digital', iconName: 'smartphone', color: 'from-purple-500 to-pink-500' },
    { id: 'experiences', label: 'Experiências', iconName: 'mountain', color: 'from-orange-500 to-red-500' },
    { id: 'donations', label: 'Doações', iconName: 'heart', color: 'from-pink-500 to-rose-500' }
  ];

  const rewards = {
    education: [
      { id: 1, name: 'Sustentabilidade Empresarial - FGV', description: 'Curso online sobre gestão sustentável e responsabilidade socioambiental', points: 1000, iconName: 'graduation', available: true },
      { id: 2, name: 'Economia Circular - SENAI', description: 'Aprenda sobre economia circular e gestão de resíduos sólidos', points: 800, iconName: 'recycle', available: true },
      { id: 3, name: 'Mudanças Climáticas - USP', description: 'Curso sobre causas e consequências das mudanças climáticas globais', points: 1200, iconName: 'thermometer', available: true },
      { id: 4, name: 'Gestão Ambiental - SEBRAE', description: 'Gestão ambiental para pequenas e médias empresas', points: 900, iconName: 'factory', available: true }
    ],
    products: [
      { id: 5, name: 'Garrafa Reutilizável', description: 'Garrafa de aço inox 500ml com design exclusivo', points: 800, iconName: 'bottle', available: true },
      { id: 6, name: 'Kit Canudos de Bambu', description: 'Set com 4 canudos de bambu + escova de limpeza', points: 400, iconName: 'leaf', available: true },
      { id: 7, name: 'Sacola Ecológica', description: 'Sacola de algodão orgânico reutilizável', points: 300, iconName: 'bag', available: true },
      { id: 8, name: 'Kit Limpeza Natural', description: 'Produtos de limpeza biodegradáveis', points: 350, iconName: 'droplets', available: true }
    ],
    digital: [
      { id: 9, name: 'Tema Premium', description: 'Desbloqueie temas exclusivos para o app', points: 200, iconName: 'palette', available: true },
      { id: 10, name: 'Badge Especial', description: 'Badge única "Eco Champion" para seu perfil', points: 400, iconName: 'trophy', available: true },
      { id: 11, name: 'Relatório Avançado', description: 'Acesso a relatórios detalhados por 3 meses', points: 900, iconName: 'chart', available: true },
      { id: 12, name: 'Avatar Personalizado', description: 'Crie seu avatar exclusivo no app', points: 600, iconName: 'user', available: true }
    ],
    experiences: [
      { id: 13, name: 'Visita ao Parque Ecológico', description: 'Ingresso para parque ecológico + guia', points: 2500, iconName: 'tree', available: true },
      { id: 14, name: 'Workshop de Reciclagem', description: 'Aprenda a fazer objetos com materiais recicláveis', points: 1500, iconName: 'recycle', available: true },
      { id: 15, name: 'Trilha Ecológica', description: 'Trilha guiada em reserva ambiental', points: 500, iconName: 'footprints', available: false },
      { id: 16, name: 'Palestra Ambiental', description: 'Ingresso para evento sobre sustentabilidade', points: 1000, iconName: 'mic', available: true }
    ],
    donations: [
      { id: 17, name: 'Plante uma Árvore', description: 'Plantio de árvore nativa em seu nome', points: 800, iconName: 'leaf', available: true },
      { id: 18, name: 'Limpeza de Praia', description: 'Apoie ação de limpeza de praias', points: 600, iconName: 'beach', available: true },
      { id: 19, name: 'Doação para ONG', description: 'R$ 10 para ONG ambiental de sua escolha', points: 1200, iconName: 'heart', available: true },
      { id: 20, name: 'Projeto Comunitário', description: 'Apoie horta comunitária local', points: 1600, iconName: 'salad', available: true }
    ]
  };

  const showNotification = (type, message, iconName) => {
    setNotificationData({ type, message, iconName: iconName || (type === 'success' ? 'sparkles' : 'warning') });
    setShowNotificationModal(true);
  };

  const handleRedeem = (reward) => {
    if (user.ecoPoints >= reward.points) {
      setSelectedReward(reward);
      setShowRedeemModal(true);
    } else {
      showNotification(
        'error',
        `Você precisa de ${reward.points - user.ecoPoints} EcoPoints a mais para resgatar este item.`,
        'warning'
      );
    }
  };

  const confirmRedeem = () => {
    const success = spendEcoPoints(selectedReward.points, `Resgate: ${selectedReward.name}`);
    
    if (success !== false) {
      setShowRedeemModal(false);
      setSelectedReward(null);
      
      showNotification(
        'success',
        `Parabéns! Você resgatou: ${selectedReward.name}`,
        'sparkles'
      );
    } else {
      showNotification(
        'error',
        'Erro ao processar resgate. Tente novamente.',
        'warning'
      );
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg shadow-pink-500/20">
                <Gift className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-stone-800 tracking-tight">
                Loja de Recompensas
              </h1>
            </div>
            <p className="text-stone-500 ml-13 flex items-center gap-2">
              <Sparkles size={16} className="text-pink-500" />
              <span>Troque seus EcoPoints por benefícios reais e digitais</span>
            </p>
          </div>
          
          <div className="bg-white px-5 py-2.5 rounded-2xl shadow-sm border border-stone-100 flex items-center gap-3 w-fit">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium text-stone-600">Catálogo Atualizado</span>
          </div>
        </motion.div>

        {/* User Points */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 md:p-8 rounded-3xl shadow-soft border border-stone-100 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-amber-100/50 to-transparent rounded-full blur-3xl pointer-events-none translate-x-1/3 -translate-y-1/3" />
            
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0">
                <CreditCard className="w-8 h-8 text-amber-500" />
              </div>
              <div>
                <div className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-1">Seu Saldo Atual</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-stone-800 tracking-tighter leading-none">{user?.ecoPoints || 0}</span>
                  <span className="text-lg font-bold text-amber-500">EcoPoints</span>
                </div>
              </div>
            </div>
            
            <div className="bg-stone-50 px-6 py-4 rounded-2xl border border-stone-100 flex items-center gap-4 relative z-10 w-full md:w-auto">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0">
                <Gift size={20} className="text-stone-400" />
              </div>
              <div>
                <div className="text-xs font-bold text-stone-500">Pronto para usar</div>
                <div className="text-sm font-medium text-stone-600">Escolha uma categoria abaixo</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Categories */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex flex-row flex-wrap gap-2 bg-stone-100/80 p-2 rounded-2xl border border-stone-200 backdrop-blur w-full max-w-full overflow-x-auto custom-scrollbar md:w-auto md:justify-center">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 whitespace-nowrap shrink-0 ${
                  selectedCategory === category.id
                    ? 'bg-white text-stone-800 shadow-sm border border-stone-200'
                    : 'text-stone-500 hover:text-stone-700 hover:bg-white/50 border border-transparent'
                }`}
              >
                <AppIcon name={category.iconName} size={18} className={selectedCategory === category.id ? 'text-pink-500' : 'text-stone-400'} />
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Rewards Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {rewards[selectedCategory]?.map((reward, index) => {
              const canAfford = (user?.ecoPoints || 0) >= reward.points;
              return (
              <motion.div
                key={reward.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-white rounded-3xl border transition-all duration-300 flex flex-col ${
                  reward.available 
                    ? 'shadow-soft border-stone-100 hover:shadow-lg hover:border-pink-200 group' 
                    : 'border-stone-100 opacity-75 grayscale bg-stone-50'
                }`}
              >
                <div className="p-6 md:p-8 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform ${reward.available ? 'bg-pink-50 group-hover:scale-110' : 'bg-stone-200'}`}>
                      <AppIcon name={reward.iconName} size={28} className={reward.available ? 'text-pink-600' : 'text-stone-400'} />
                    </div>
                    <div className={`px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1.5 ${reward.available ? (canAfford ? 'bg-amber-50 text-amber-600' : 'bg-stone-100 text-stone-500') : 'bg-stone-200 text-stone-500'}`}>
                      <Gift size={14} />
                      {reward.points}
                    </div>
                  </div>
                  
                  <h3 className={`font-bold text-lg mb-2 leading-tight ${reward.available ? 'text-stone-800' : 'text-stone-500'}`}>{reward.name}</h3>
                  <p className="text-stone-500 text-sm leading-relaxed mb-6 flex-1">{reward.description}</p>
                  
                  <button
                    onClick={() => handleRedeem(reward)}
                    disabled={!reward.available || !canAfford}
                    className={`w-full py-3.5 px-4 rounded-xl font-bold transition-all duration-300 shadow-sm flex items-center justify-center gap-2 ${
                      !reward.available
                        ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                        : canAfford
                        ? 'bg-pink-600 hover:bg-pink-700 text-white hover:shadow-md active:scale-[0.98]'
                        : 'bg-stone-100 text-stone-400 cursor-not-allowed'
                    }`}
                  >
                    {!reward.available
                      ? 'Indisponível'
                      : canAfford
                      ? 'Resgatar Agora'
                      : `Faltam ${reward.points - (user?.ecoPoints || 0)} pts`
                    }
                  </button>
                </div>
              </motion.div>
            )})}
          </motion.div>
        </AnimatePresence>

        {/* Redeem Modal */}
        <AnimatePresence>
          {showRedeemModal && selectedReward && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowRedeemModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-stone-100 mx-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-pink-50 flex items-center justify-center text-pink-600">
                    <AppIcon name={selectedReward.iconName} size={32} />
                  </div>
                  <button 
                    onClick={() => setShowRedeemModal(false)}
                    className="w-8 h-8 rounded-full bg-stone-50 hover:bg-stone-100 flex items-center justify-center text-stone-400 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
                
                <h2 className="text-2xl font-black text-stone-800 tracking-tight mb-2">{selectedReward.name}</h2>
                <p className="text-stone-500 mb-8">{selectedReward.description}</p>
                
                <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100 mb-8 space-y-4">
                  <div className="flex justify-between items-center text-sm font-medium text-stone-600">
                    <span>Custo do item:</span>
                    <span className="font-bold text-stone-800">{selectedReward.points} EcoPoints</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-medium text-stone-600">
                    <span>Seu saldo atual:</span>
                    <span className="font-bold text-stone-800">{user?.ecoPoints || 0} EcoPoints</span>
                  </div>
                  <div className="h-px w-full bg-stone-200" />
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-stone-800">Saldo após resgate:</span>
                    <span className="font-black text-lg text-amber-500">
                      {(user?.ecoPoints || 0) - selectedReward.points} EcoPoints
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowRedeemModal(false)}
                    className="flex-1 bg-white border border-stone-200 text-stone-700 font-bold py-4 px-4 rounded-xl hover:bg-stone-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmRedeem}
                    className="flex-1 bg-pink-600 hover:bg-pink-700 text-white font-bold py-4 px-4 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    <Check size={18} />
                    Confirmar
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Notification Modal */}
        <AnimatePresence>
          {showNotificationModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowNotificationModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full text-center shadow-2xl border border-stone-100 mx-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className={`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center ${notificationData.type === 'success' ? 'bg-green-50' : 'bg-red-50'}`}>
                  <AppIcon name={notificationData.iconName} size={40} className={notificationData.type === 'success' ? 'text-green-500' : 'text-red-500'} />
                </div>
                
                <h3 className={`text-2xl font-black tracking-tight mb-2 ${
                  notificationData.type === 'success' ? 'text-stone-800' : 'text-red-600'
                }`}>
                  {notificationData.type === 'success' ? 'Sucesso!' : 'Ops!'}
                </h3>
                
                <p className="text-stone-500 mb-8 font-medium">
                  {notificationData.message}
                </p>
                
                <button
                  onClick={() => setShowNotificationModal(false)}
                  className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-sm"
                >
                  Entendi
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Rewards;