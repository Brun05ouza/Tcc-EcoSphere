import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useEnterKey } from '../hooks/useEnterKey';
import { useUser } from '../contexts/UserContext';
import { wasteAPI } from '../services/api';

const WasteClassifier = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [classification, setClassification] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const fileInputRef = useRef(null);
  const { addEcoPoints } = useUser();
  const navigate = useNavigate();

  // Classificar com Enter quando há imagem
  useEnterKey(() => {
    if (selectedFile && !loading) {
      classifyWaste();
    }
  }, [selectedFile, loading]);

  const handleFiles = (files) => {
    const file = files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);
      setClassification(null);
    }
  };

  const handleFileSelect = (event) => {
    handleFiles(event.target.files);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const classifyWaste = async () => {
    if (!selectedFile) return;
    
    setLoading(true);
    
    try {
      // Simular análise de IA
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // Simulação de classificação baseada no nome do arquivo
      const fileName = selectedFile.name.toLowerCase();
      let wasteType, confidence, points, tips;
      
      if (fileName.includes('garrafa') || fileName.includes('plastic') || fileName.includes('pet')) {
        wasteType = 'plastico';
        confidence = 0.92;
        points = 25;
        tips = 'Remova rótulos e tampas. Lave antes de descartar. Pode ser reciclado infinitas vezes!';
      } else if (fileName.includes('papel') || fileName.includes('paper') || fileName.includes('cardboard')) {
        wasteType = 'papel';
        confidence = 0.88;
        points = 20;
        tips = 'Mantenha seco e limpo. Remova fitas adesivas. Papel é 100% reciclável!';
      } else if (fileName.includes('vidro') || fileName.includes('glass') || fileName.includes('bottle')) {
        wasteType = 'vidro';
        confidence = 0.95;
        points = 30;
        tips = 'Remova tampas e rótulos. Vidro pode ser reciclado infinitas vezes sem perder qualidade!';
      } else if (fileName.includes('metal') || fileName.includes('lata') || fileName.includes('can')) {
        wasteType = 'metal';
        confidence = 0.90;
        points = 35;
        tips = 'Lave bem antes de descartar. Metais são 100% recicláveis e economizam muita energia!';
      } else {
        // Classificação aleatória para outras imagens
        const types = [
          { type: 'plastico', conf: 0.85, pts: 25, tip: 'Remova rótulos e tampas. Lave antes de descartar.' },
          { type: 'papel', conf: 0.82, pts: 20, tip: 'Mantenha seco e limpo. Remova fitas adesivas.' },
          { type: 'vidro', conf: 0.88, pts: 30, tip: 'Remova tampas e rótulos. Cuidado com fragmentos.' },
          { type: 'metal', conf: 0.91, pts: 35, tip: 'Lave bem antes de descartar. Economiza muita energia!' }
        ];
        const random = types[Math.floor(Math.random() * types.length)];
        wasteType = random.type;
        confidence = random.conf;
        points = random.pts;
        tips = random.tip;
      }
      
      // Adicionar EcoPoints
      const newTotal = addEcoPoints(points, 'Classificação de resíduo');
      
      console.log('🎮 WasteClassifier: Pontos adicionados:', points, 'Total:', newTotal);
      
      setClassification({
        type: wasteType,
        confidence: confidence,
        points: points,
        tips: tips,
        locations: ['Supermercado Central - 0.5km', 'Ponto de Coleta Norte - 1.2km', 'Cooperativa Sul - 2.1km'],
        totalEcoPoints: newTotal
      });
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Erro na classificação:', error);
      alert('Erro ao classificar resíduo. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const wasteTypes = {
    plastico: { color: 'from-red-500 to-pink-500', bgColor: 'bg-red-50', textColor: 'text-red-800', icon: '♻️', bin: 'Lixeira Vermelha' },
    papel: { color: 'from-blue-500 to-cyan-500', bgColor: 'bg-blue-50', textColor: 'text-blue-800', icon: '📄', bin: 'Lixeira Azul' },
    vidro: { color: 'from-green-500 to-emerald-500', bgColor: 'bg-green-50', textColor: 'text-green-800', icon: '🍶', bin: 'Lixeira Verde' },
    metal: { color: 'from-yellow-500 to-orange-500', bgColor: 'bg-yellow-50', textColor: 'text-yellow-800', icon: '🥫', bin: 'Lixeira Amarela' },
    organico: { color: 'from-amber-600 to-orange-600', bgColor: 'bg-amber-50', textColor: 'text-amber-800', icon: '🍎', bin: 'Lixeira Marrom' }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4">
            🤖 Classificador Inteligente
          </h1>
          <p className="text-lg sm:text-xl text-gray-600">Identifique resíduos com IA e ganhe EcoPoints!</p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Upload Area */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white p-4 sm:p-6 lg:p-8 rounded-3xl shadow-xl"
            >
              <div 
                className={`border-3 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
                  dragActive ? 'border-green-500 bg-green-50' : 'border-gray-300'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <AnimatePresence mode="wait">
                  {preview ? (
                    <motion.div
                      key="preview"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                    >
                      <img src={preview} alt="Preview" className="max-w-full h-64 mx-auto object-contain mb-4 rounded-xl" />
                      <p className="text-gray-600 mb-4">Imagem carregada com sucesso!</p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="upload"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-gray-500 mb-4"
                    >
                      <motion.div 
                        animate={{ y: [0, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="text-6xl mb-4"
                      >
                        📷
                      </motion.div>
                      <p className="text-lg mb-2">Arraste uma imagem aqui ou</p>
                      <p className="text-sm text-gray-400">Clique para selecionar</p>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-input"
                />
                
                <div className="flex gap-4 justify-center">
                  <label
                    htmlFor="file-input"
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-xl cursor-pointer flex items-center gap-2 transform hover:scale-105 transition-all duration-200 shadow-lg"
                  >
                    <i className="bi bi-cloud-upload text-lg"></i>
                    Selecionar Imagem
                  </label>
                  
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl flex items-center gap-2 transform hover:scale-105 transition-all duration-200 shadow-lg"
                  >
                    <i className="bi bi-camera text-lg"></i>
                    Câmera
                  </button>
                </div>
              </div>

              {selectedFile && (
                <div className="mt-6">
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={classifyWaste}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2 transform hover:scale-105 transition-all duration-200"
                  >
                    {loading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1 }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        />
                        Analisando com IA...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-magic text-lg"></i>
                        Classificar Resíduo
                      </>
                    )}
                  </motion.button>
                  {!loading && (
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="text-center text-sm text-gray-500 mt-2"
                    >
                      ⌨️ Pressione <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">Enter</kbd> para classificar
                    </motion.p>
                  )}
                </div>
              )}
            </motion.div>

            {/* Results */}
            <AnimatePresence>
              {classification && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white p-8 rounded-3xl shadow-xl"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Resultado da Análise</h2>
                    {showSuccess && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-green-600"
                      >
                        <i className="bi bi-check-circle-fill text-3xl"></i>
                      </motion.div>
                    )}
                  </div>
                  
                  <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    className={`p-6 rounded-2xl ${wasteTypes[classification.type]?.bgColor} mb-6 border-l-4`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <motion.span 
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ repeat: 3, duration: 0.5 }}
                          className="text-4xl mr-4"
                        >
                          {wasteTypes[classification.type]?.icon}
                        </motion.span>
                        <div>
                          <div className={`text-2xl font-bold capitalize ${wasteTypes[classification.type]?.textColor}`}>
                            {classification.type}
                          </div>
                          <div className="text-sm text-gray-600">
                            Confiança: {(classification.confidence * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold text-lg ${wasteTypes[classification.type]?.textColor}`}>
                          {wasteTypes[classification.type]?.bin}
                        </div>
                        <motion.div 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.5 }}
                          className="text-green-600 font-bold text-xl flex items-center gap-1"
                        >
                          <i className="bi bi-award text-lg"></i>
                          +{classification.points} EcoPoints
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>

                  <div className="grid md:grid-cols-1 gap-6">
                    <div className="bg-gray-50 p-6 rounded-2xl">
                      <h3 className="font-bold mb-3 flex items-center gap-2">
                        <i className="bi bi-arrow-repeat text-green-600 text-lg"></i>
                        Dicas de Descarte
                      </h3>
                      <p className="text-gray-700 leading-relaxed">{classification.tips}</p>
                    </div>
                    
                    <div className="bg-gray-50 p-6 rounded-2xl">
                      <h3 className="font-bold mb-3 flex items-center gap-2">
                        <i className="bi bi-geo-alt-fill text-blue-600 text-lg"></i>
                        Pontos de Coleta Próximos
                      </h3>
                      <div className="space-y-2">
                        {classification.locations?.map((location, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="text-sm text-gray-600 flex items-center gap-2"
                          >
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            {location}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mt-6 text-center">
                      <motion.button
                        onClick={() => navigate('/guia')}
                        className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all"
                      >
                        ✅ Continuar Guia Sustentável
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        {/* Info Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-8 sm:mt-12"
        >
          {[
            { icon: "bi bi-lightbulb", emoji: "💡", title: "Como Funciona", desc: "Nossa IA analisa a imagem e identifica o tipo de material usando visão computacional avançada.", color: "from-blue-500 to-cyan-500" },
            { icon: "bi bi-trophy", emoji: "🏆", title: "Ganhe Pontos", desc: "Cada classificação correta gera EcoPoints que podem ser trocados por recompensas!", color: "from-green-500 to-emerald-500" },
            { icon: "bi bi-heart-fill", emoji: "🌍", title: "Impacto Real", desc: "Suas ações contribuem para um planeta mais sustentável e consciente.", color: "from-purple-500 to-pink-500" }
          ].map((card, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute top-2 right-2 text-2xl opacity-20">{card.emoji}</div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${card.color} flex items-center justify-center mb-4 shadow-lg`}>
                <i className={`${card.icon} text-xl text-white`}></i>
              </div>
              <h3 className="font-bold text-gray-800 mb-2">{card.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{card.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default WasteClassifier;