import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Doughnut } from 'react-chartjs-2';
import { wasteAPI } from '../services/api';
import { BarChart3, Database, Target, Leaf, Award, Sparkles, Clock } from 'lucide-react';
import { AppIcon } from '../components/ui/AppIcon';
import LoadingScreen from '../components/ui/LoadingScreen';

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
    <div className="min-h-screen bg-surface-50 py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/20">
                <Database className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-stone-800 tracking-tight">
                Histórico de Dados
              </h1>
            </div>
            <p className="text-stone-500 ml-13 flex items-center gap-2">
              <Sparkles size={16} className="text-green-500" />
              <span>Registro de classificações e análises da IA</span>
            </p>
          </div>
          
          <div className="bg-white px-5 py-2.5 rounded-2xl shadow-sm border border-stone-100 flex items-center gap-3 w-fit">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-sm font-medium text-stone-600">Sincronizado</span>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {[
            { label: 'Análises Realizadas', value: stats.total, icon: Database, color: 'text-blue-600', bg: 'bg-blue-50', border: 'hover:border-blue-200' },
            { label: 'EcoPoints Ganhos', value: stats.totalPoints, icon: Award, color: 'text-green-600', bg: 'bg-green-50', border: 'hover:border-green-200' },
            { label: 'Precisão Média', value: `${stats.avgConfidence}%`, icon: Target, color: 'text-purple-600', bg: 'bg-purple-50', border: 'hover:border-purple-200' },
            { label: 'CO2 Evitado', value: `${stats.co2Saved}kg`, icon: Leaf, color: 'text-orange-600', bg: 'bg-orange-50', border: 'hover:border-orange-200' }
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
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
              <div className="text-sm font-semibold text-stone-500 mb-1">{stat.label}</div>
              <div className="text-2xl md:text-3xl font-black text-stone-800 tracking-tight">{stat.value}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-3xl shadow-soft border border-stone-100 p-6 md:p-8"
          >
            <h3 className="text-lg font-bold text-stone-800 mb-6 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
              </div>
              Distribuição por Tipo
            </h3>
            <div className="h-64 flex items-center justify-center relative">
              <Doughnut 
                data={chartData} 
                options={{ 
                  responsive: true,
                  maintainAspectRatio: false,
                  cutout: '75%',
                  plugins: { 
                    legend: { 
                      position: 'bottom',
                      labels: { usePointStyle: true, padding: 20, font: { family: 'Inter, sans-serif', weight: '500' } }
                    } 
                  } 
                }} 
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                <span className="text-3xl font-black text-stone-800">{stats.total}</span>
                <span className="text-xs font-medium text-stone-500 uppercase tracking-widest">Total</span>
              </div>
            </div>
          </motion.div>

          {/* History List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-2 bg-white rounded-3xl shadow-soft border border-stone-100 p-6 md:p-8 flex flex-col"
          >
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-stone-100">
              <h3 className="text-lg font-bold text-stone-800 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-stone-600" />
                </div>
                Registro Detalhado
              </h3>
              <div className="text-sm font-medium text-stone-500">
                Exibindo {classifications.length} itens
              </div>
            </div>

            {loading && (
              <div className="flex flex-col items-center justify-center flex-1 text-stone-400 gap-3 min-h-[300px]">
                <LoadingScreen fullScreen={false} size={32} />
                <p className="font-medium">Carregando registros da IA...</p>
              </div>
            )}
            
            <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar" style={{ maxHeight: '400px' }}>
              {!loading && classifications.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center py-12 min-h-[300px]">
                  <div className="w-16 h-16 rounded-2xl bg-stone-50 flex items-center justify-center mb-4">
                    <Database className="w-8 h-8 text-stone-300" />
                  </div>
                  <p className="text-stone-800 font-medium mb-1">Nenhum dado registrado</p>
                  <p className="text-sm text-stone-500">Suas análises aparecerão aqui.</p>
                </div>
              )}
              
              {classifications.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl border border-stone-50 hover:bg-stone-50 transition-colors group cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <AppIcon name={item.iconName} size={24} className="text-stone-600" />
                    </div>
                    <div>
                      <div className="font-bold text-stone-800">{item.type}</div>
                      <div className="text-sm text-stone-500 font-medium mt-0.5">{item.date}</div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1 rounded-lg">
                      <Award size={14} />
                      <span className="font-bold text-sm">+{item.points}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-400">
                      <Target size={12} />
                      {(item.confidence * 100).toFixed(0)}% precisão
                    </div>
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
