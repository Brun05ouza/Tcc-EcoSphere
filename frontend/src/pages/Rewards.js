import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../contexts/UserContext';

const Rewards = () => {
  const [selectedCategory, setSelectedCategory] = useState('education');
  const { user, spendEcoPoints } = useUser();
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [selectedReward, setSelectedReward] = useState(null);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationData, setNotificationData] = useState({ type: '', message: '', icon: '' });

  const categories = [
    { id: 'education', label: 'Educação', icon: 'bi-book', color: 'from-blue-500 to-cyan-500' },
    { id: 'products', label: 'Eco-Friendly', icon: 'bi-leaf', color: 'from-green-500 to-emerald-500' },
    { id: 'digital', label: 'Digital', icon: 'bi-phone', color: 'from-purple-500 to-pink-500' },
    { id: 'experiences', label: 'Experiências', icon: 'bi-compass', color: 'from-orange-500 to-red-500' },
    { id: 'donations', label: 'Doações', icon: 'bi-heart', color: 'from-pink-500 to-rose-500' }
  ];

  const rewards = {
    education: [
      { id: 1, name: 'Curso de Sustentabilidade', description: 'Certificado online de 20h sobre práticas sustentáveis', points: 300, icon: '🎓', available: true },
      { id: 2, name: 'E-book Ambiental', description: 'Coleção de 5 e-books sobre meio ambiente', points: 150, icon: '📚', available: true },
      { id: 3, name: 'Webinar Exclusivo', description: 'Acesso a webinars mensais com especialistas', points: 200, icon: '💻', available: true },
      { id: 4, name: 'Mentoria Verde', description: '1h de mentoria com consultor ambiental', points: 500, icon: '👨‍🏫', available: false }
    ],
    products: [
      { id: 5, name: 'Garrafa Reutilizável', description: 'Garrafa de aço inox 500ml com design exclusivo', points: 200, icon: '🍶', available: true },
      { id: 6, name: 'Kit Canudos de Bambu', description: 'Set com 4 canudos de bambu + escova de limpeza', points: 100, icon: '🎋', available: true },
      { id: 7, name: 'Sacola Ecológica', description: 'Sacola de algodão orgânico reutilizável', points: 80, icon: '👜', available: true },
      { id: 8, name: 'Kit Limpeza Natural', description: 'Produtos de limpeza biodegradáveis', points: 350, icon: '🧽', available: true }
    ],
    digital: [
      { id: 9, name: 'Tema Premium', description: 'Desbloqueie temas exclusivos para o app', points: 50, icon: '🎨', available: true },
      { id: 10, name: 'Badge Especial', description: 'Badge única "Eco Champion" para seu perfil', points: 100, icon: '🏆', available: true },
      { id: 11, name: 'Relatório Avançado', description: 'Acesso a relatórios detalhados por 3 meses', points: 250, icon: '📊', available: true },
      { id: 12, name: 'Avatar Personalizado', description: 'Crie seu avatar exclusivo no app', points: 150, icon: '👤', available: true }
    ],
    experiences: [
      { id: 13, name: 'Visita ao Parque Ecológico', description: 'Ingresso para parque ecológico + guia', points: 600, icon: '🌳', available: true },
      { id: 14, name: 'Workshop de Reciclagem', description: 'Aprenda a fazer objetos com materiais recicláveis', points: 400, icon: '♻️', available: true },
      { id: 15, name: 'Trilha Ecológica', description: 'Trilha guiada em reserva ambiental', points: 500, icon: '🥾', available: false },
      { id: 16, name: 'Palestra Ambiental', description: 'Ingresso para evento sobre sustentabilidade', points: 300, icon: '🎤', available: true }
    ],
    donations: [
      { id: 17, name: 'Plante uma Árvore', description: 'Plantio de árvore nativa em seu nome', points: 200, icon: '🌱', available: true },
      { id: 18, name: 'Limpeza de Praia', description: 'Apoie ação de limpeza de praias', points: 150, icon: '🏖️', available: true },
      { id: 19, name: 'Doação para ONG', description: 'R$ 10 para ONG ambiental de sua escolha', points: 300, icon: '💚', available: true },
      { id: 20, name: 'Projeto Comunitário', description: 'Apoie horta comunitária local', points: 400, icon: '🥬', available: true }
    ]
  };

  const showNotification = (type, message, icon) => {
    setNotificationData({ type, message, icon });
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
        '😢'
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
        '🎉'
      );
    } else {
      showNotification(
        'error',
        'Erro ao processar resgate. Tente novamente.',
        '😢'
      );
    }
  };

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
            🎁 Resgate de EcoPoints
          </h1>
          <p className="text-xl text-gray-600">Troque seus pontos por recompensas incríveis!</p>
        </motion.div>

        {/* User Points */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-600 to-blue-600 rounded-3xl p-6 text-white mb-8 text-center"
        >
          <div className="flex items-center justify-center gap-4">
            <i className="bi bi-gem text-3xl text-yellow-300"></i>
            <div>
              <div className="text-3xl font-bold">{user?.ecoPoints || 0}</div>
              <div className="text-green-100">EcoPoints Disponíveis</div>
            </div>
          </div>
        </motion.div>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {categories.map((category) => (
            <motion.button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-6 py-3 rounded-2xl font-medium transition-all ${
                selectedCategory === category.id
                  ? 'bg-white shadow-lg text-gray-800'
                  : 'bg-white/50 text-gray-600 hover:bg-white/80'
              }`}
            >
              <i className={`${category.icon} mr-2`}></i>
              {category.label}
            </motion.button>
          ))}
        </div>

        {/* Rewards Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {rewards[selectedCategory]?.map((reward, index) => (
              <motion.div
                key={reward.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className={`bg-white rounded-2xl shadow-lg p-6 ${
                  !reward.available ? 'opacity-60' : ''
                }`}
              >
                <div className="text-center mb-4">
                  <div className="text-5xl mb-3">{reward.icon}</div>
                  <h3 className="font-bold text-lg mb-2">{reward.name}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{reward.description}</p>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <i className="bi bi-gem text-yellow-500"></i>
                    <span className="font-bold text-lg">{reward.points}</span>
                    <span className="text-sm text-gray-500">pontos</span>
                  </div>
                  {!reward.available && (
                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                      Em breve
                    </span>
                  )}
                </div>

                <button
                  onClick={() => handleRedeem(reward)}
                  disabled={!reward.available || (user?.ecoPoints || 0) < reward.points}
                  className={`w-full py-3 px-4 rounded-xl font-medium transition-all ${
                    !reward.available || (user?.ecoPoints || 0) < reward.points
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white'
                  }`}
                >
                  {!reward.available
                    ? 'Indisponível'
                    : (user?.ecoPoints || 0) < reward.points
                    ? `Faltam ${reward.points - (user?.ecoPoints || 0)} pontos`
                    : 'Resgatar'
                  }
                </button>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Redeem Modal */}
        <AnimatePresence>
          {showRedeemModal && selectedReward && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowRedeemModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl p-8 max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center">
                  <div className="text-6xl mb-4">{selectedReward.icon}</div>
                  <h2 className="text-2xl font-bold mb-2">{selectedReward.name}</h2>
                  <p className="text-gray-600 mb-6">{selectedReward.description}</p>
                  
                  <div className="bg-gray-50 p-4 rounded-xl mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span>Custo:</span>
                      <span className="font-bold">{selectedReward.points} EcoPoints</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span>Você tem:</span>
                      <span className="font-bold">{user?.ecoPoints || 0} EcoPoints</span>
                    </div>
                    <hr className="my-2" />
                    <div className="flex justify-between items-center">
                      <span>Restará:</span>
                      <span className="font-bold text-green-600">
                        {(user?.ecoPoints || 0) - selectedReward.points} EcoPoints
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowRedeemModal(false)}
                      className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={confirmRedeem}
                      className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white py-3 px-4 rounded-xl transition-all"
                    >
                      Confirmar Resgate
                    </button>
                  </div>
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
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowNotificationModal(false)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0, y: 20 }}
                className="bg-white rounded-2xl p-8 max-w-sm w-full text-center"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-6xl mb-4">{notificationData.icon}</div>
                
                <h3 className={`text-xl font-bold mb-3 ${
                  notificationData.type === 'success' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {notificationData.type === 'success' ? 'Sucesso!' : 'Ops!'}
                </h3>
                
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {notificationData.message}
                </p>
                
                <motion.button
                  onClick={() => setShowNotificationModal(false)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-full py-3 px-6 rounded-xl font-medium text-white transition-all ${
                    notificationData.type === 'success'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
                      : 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600'
                  }`}
                >
                  Entendi
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Rewards;