import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Pie } from 'react-chartjs-2';
import { wasteAPI } from '../services/api';
import { BarChart3 } from 'lucide-react';
import { AppIcon } from '../components/ui/AppIcon';

const TYPE_ICON = { Plástico: 'plastic', Papel: 'paper', Vidro: 'glass', Metal: 'metal', Orgânico: 'organico', Eletrônico: 'eletronico' };

const History = () => {
  const [classifications, setClassifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    wasteAPI.getHistorico().then((res) => {
      const list = (res.data || []).map((c) => ({
        id: c.id,
        type: c.category,
        confidence: c.confidence,
        points: c.points,
        date: c.timestamp ? new Date(c.timestamp).toLocaleString('pt-BR') : '-',
        iconName: TYPE_ICON[c.category] || 'recycle',
      }));
      setClassifications(list);
    }).catch(() => setClassifications([])).finally(() => setLoading(false));
  }, []);

  const stats = {
    total: classifications.length,
    totalPoints: classifications.reduce((sum, c) => sum + c.points, 0),
    avgConfidence: classifications.length
      ? (classifications.reduce((sum, c) => sum + c.confidence, 0) / classifications.length * 100).toFixed(1)
      : '0',
    co2Saved: (classifications.length * 2.5).toFixed(1),
  };

  const typeCount = classifications.reduce((acc, c) => {
    acc[c.type] = (acc[c.type] || 0) + 1;
    return acc;
  }, {});

  const chartData = {
    labels: Object.keys(typeCount).length ? Object.keys(typeCount) : ['Nenhum dado'],
    datasets: [{
      data: Object.values(typeCount).length ? Object.values(typeCount) : [1],
      backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1']
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
          <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4 flex items-center justify-center gap-3">
            <BarChart3 size={48} className="text-green-600" />
            Histórico de Classificações
          </h1>
          <p className="text-xl text-gray-600">Acompanhe suas ações sustentáveis</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Classificações', value: stats.total, iconName: 'search', color: 'from-blue-500 to-cyan-500' },
            { label: 'EcoPoints Ganhos', value: stats.totalPoints, iconName: 'star', color: 'from-green-500 to-emerald-500' },
            { label: 'Confiança Média', value: `${stats.avgConfidence}%`, iconName: 'target', color: 'from-purple-500 to-pink-500' },
            { label: 'CO2 Economizado', value: `${stats.co2Saved}kg`, iconName: 'globe', color: 'from-orange-500 to-red-500' }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
                <AppIcon name={stat.iconName} size={28} className="text-white" />
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
            {loading && <p className="text-gray-500">Carregando...</p>}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {!loading && classifications.length === 0 && <p className="text-gray-500">Nenhuma classificação ainda.</p>}
              {classifications.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-green-100">
                    <AppIcon name={item.iconName} size={28} className="text-green-700" />
                  </div>
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
