import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Pie } from 'react-chartjs-2';

const History = () => {
  const [classifications] = useState([
    { id: 1, type: 'Plástico', confidence: 0.92, points: 92, date: '2024-01-15 14:30', image: '🥤' },
    { id: 2, type: 'Papel', confidence: 0.88, points: 88, date: '2024-01-15 10:20', image: '📄' },
    { id: 3, type: 'Vidro', confidence: 0.95, points: 95, date: '2024-01-14 16:45', image: '🍾' },
    { id: 4, type: 'Metal', confidence: 0.91, points: 91, date: '2024-01-14 09:15', image: '🥫' },
    { id: 5, type: 'Plástico', confidence: 0.87, points: 87, date: '2024-01-13 18:00', image: '🧴' },
    { id: 6, type: 'Papel', confidence: 0.93, points: 93, date: '2024-01-13 11:30', image: '📦' },
    { id: 7, type: 'Orgânico', confidence: 0.89, points: 89, date: '2024-01-12 15:20', image: '🍌' },
    { id: 8, type: 'Plástico', confidence: 0.94, points: 94, date: '2024-01-12 08:45', image: '🛍️' }
  ]);

  const stats = {
    total: classifications.length,
    totalPoints: classifications.reduce((sum, c) => sum + c.points, 0),
    avgConfidence: (classifications.reduce((sum, c) => sum + c.confidence, 0) / classifications.length * 100).toFixed(1),
    co2Saved: (classifications.length * 2.5).toFixed(1)
  };

  const typeCount = classifications.reduce((acc, c) => {
    acc[c.type] = (acc[c.type] || 0) + 1;
    return acc;
  }, {});

  const chartData = {
    labels: Object.keys(typeCount),
    datasets: [{
      data: Object.values(typeCount),
      backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
    }]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4">
            📊 Histórico de Classificações
          </h1>
          <p className="text-xl text-gray-600">Acompanhe suas ações sustentáveis</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Classificações', value: stats.total, icon: '🔍', color: 'from-blue-500 to-cyan-500' },
            { label: 'EcoPoints Ganhos', value: stats.totalPoints, icon: '⭐', color: 'from-green-500 to-emerald-500' },
            { label: 'Confiança Média', value: `${stats.avgConfidence}%`, icon: '🎯', color: 'from-purple-500 to-pink-500' },
            { label: 'CO2 Economizado', value: `${stats.co2Saved}kg`, icon: '🌍', color: 'from-orange-500 to-red-500' }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center text-2xl mb-3`}>
                {stat.icon}
              </div>
              <div className="text-3xl font-bold text-gray-800 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h2 className="text-xl font-bold mb-4">Distribuição por Tipo</h2>
            <Pie data={chartData} options={{ maintainAspectRatio: true }} />
          </motion.div>

          {/* History List */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6"
          >
            <h2 className="text-xl font-bold mb-4">Classificações Recentes</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {classifications.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="text-4xl">{item.image}</div>
                  <div className="flex-1">
                    <div className="font-bold text-gray-800">{item.type}</div>
                    <div className="text-sm text-gray-500">{item.date}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">+{item.points} pts</div>
                    <div className="text-xs text-gray-500">{(item.confidence * 100).toFixed(0)}% confiança</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default History;
