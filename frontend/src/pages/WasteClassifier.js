import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useEnterKey } from '../hooks/useEnterKey';
import { useUser } from '../contexts/UserContext';
import { wasteAPI } from '../services/api';
import { useWasteClassifier } from '../hooks/useWasteClassifier';
import { Check, Camera } from 'lucide-react';
import { AppIcon } from '../components/ui/AppIcon';

const WasteClassifier = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [classification, setClassification] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [useCamera, setUseCamera] = useState(false);
  const [stream, setStream] = useState(null);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const { addEcoPoints } = useUser();
  const navigate = useNavigate();
  const { model, loading: modelLoading, classifyImage, calculatePoints, wasteInfo } = useWasteClassifier();

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

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setUseCamera(true);
    } catch (error) {
      console.error('Erro ao acessar câmera:', error);
      alert('Não foi possível acessar a câmera. Use upload de arquivo.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setUseCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0);
      
      canvas.toBlob((blob) => {
        const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
        setSelectedFile(file);
        setPreview(canvas.toDataURL('image/jpeg'));
        stopCamera();
      }, 'image/jpeg');
    }
  };

  const classifyWaste = async () => {
    if (!selectedFile || !preview) return;
    
    setLoading(true);
    
    try {
      // Criar elemento de imagem para classificação
      const img = new Image();
      img.src = preview;
      
      await new Promise((resolve) => {
        img.onload = resolve;
      });
      
      // Classificar com IA
      const result = await classifyImage(img);
      const points = calculatePoints(result.confidence);
      
      // Adicionar EcoPoints
      const newTotal = addEcoPoints(points, `Classificação: ${result.class}`);
      
      console.log('IA Classificou:', result.class, 'Confiança:', (result.confidence * 100).toFixed(1) + '%');
      
      setClassification({
        type: result.class,
        confidence: result.confidence,
        points: points,
        tips: result.tips,
        bin: result.bin,
        iconName: result.iconName,
        color: result.color,
        bgColor: result.bgColor,
        textColor: result.textColor,
        locations: ['Supermercado Central - 0.5km', 'Ponto de Coleta Norte - 1.2km', 'Cooperativa Sul - 2.1km'],
        totalEcoPoints: newTotal
      });
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
      // Salvar no Supabase
      try {
        await wasteAPI.saveClassification({
          category: result.class,
          confidence: result.confidence,
          points: points
        });
      } catch (err) {
        console.log('Erro ao salvar no Supabase:', err);
      }
      
    } catch (error) {
      console.error('Erro na classificação:', error);
      alert('Erro ao classificar resíduo. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="min-h-screen bg-surface-50 py-8 md:py-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-eco-700 via-teal-600 to-eco-700 bg-clip-text text-transparent flex items-center justify-center gap-3 pb-2">
              <div className="w-12 h-12 flex-shrink-0">
                <Icon name="IA" className="w-full h-full" />
              </div>
              <span>Classificador Inteligente</span>
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600">Identifique resíduos com IA e ganhe EcoPoints!</p>
          {modelLoading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 flex items-center justify-center gap-2 text-blue-600"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full"
              />
              <span className="text-sm">Carregando modelo de IA...</span>
            </motion.div>
          )}
          {!modelLoading && model && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-4 flex items-center justify-center gap-2 text-green-600"
            >
              <i className="bi bi-check-circle-fill"></i>
              <span className="text-sm">Modelo de IA pronto!</span>
            </motion.div>
          )}
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Upload Area */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="card p-6 lg:p-8"
            >
              <div 
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
                  dragActive ? 'border-eco-500 bg-eco-50' : 'border-stone-300'
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
                        <Camera size={32} className="text-gray-600" />
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
                
                {!useCamera ? (
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <label
                      htmlFor="file-input"
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold bg-gradient-to-br from-eco-600 to-teal-600 text-white shadow-soft hover:shadow-glow cursor-pointer w-full sm:w-auto transition-all"
                    >
                      <i className="bi bi-cloud-upload text-lg"></i>
                      Selecionar Imagem
                    </label>
                    
                    <button
                      onClick={startCamera}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold bg-white border-2 border-teal-200 text-teal-700 hover:bg-teal-50 w-full sm:w-auto transition-all"
                    >
                      <Icon name="camera" className="w-5 h-5" white />
                      Abrir Câmera
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline
                      className="w-full h-64 object-cover rounded-xl bg-black"
                    />
                    <canvas ref={canvasRef} className="hidden" />
                    <div className="flex gap-4 justify-center">
                      <button
                        onClick={capturePhoto}
                        className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-xl flex items-center gap-2 transform hover:scale-105 transition-all duration-200 shadow-lg"
                      >
                        <i className="bi bi-camera-fill text-lg"></i>
                        Capturar Foto
                      </button>
                      <button
                        onClick={stopCamera}
                        className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-3 rounded-xl flex items-center gap-2 transform hover:scale-105 transition-all duration-200 shadow-lg"
                      >
                        <i className="bi bi-x-circle text-lg"></i>
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {selectedFile && (
                <div className="mt-6">
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={classifyWaste}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white py-4 rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2 transition-all duration-200 shadow-soft"
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
                      Pressione <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">Enter</kbd> para classificar
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
                  className="card p-8"
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
                    className={`p-6 rounded-2xl ${classification.bgColor} mb-6 border-l-4`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <motion.span 
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ repeat: 3, duration: 0.5 }}
                          className="mr-4 flex items-center justify-center w-14 h-14 rounded-xl bg-green-100"
                        >
                          <AppIcon name={classification.iconName} size={36} className="text-green-700" />
                        </motion.span>
                        <div>
                          <div className={`text-2xl font-bold ${classification.textColor}`}>
                            {classification.type}
                          </div>
                          <div className="text-sm text-gray-600">
                            Confiança: {(classification.confidence * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold text-lg ${classification.textColor}`}>
                          {classification.bin}
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
                        className="btn-primary px-6 py-3"
                      >
                        <Check size={20} className="inline mr-2" />
                        Continuar Guia Sustentável
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
            { iconName: "lightbulb", title: "Como Funciona", desc: "Nossa IA analisa a imagem e identifica o tipo de material usando visão computacional avançada.", color: "from-blue-500 to-cyan-500" },
            { iconName: "trophy", title: "Ganhe Pontos", desc: "Cada classificação correta gera EcoPoints que podem ser trocados por recompensas!", color: "from-green-500 to-emerald-500" },
            { iconName: "globe", title: "Impacto Real", desc: "Suas ações contribuem para um planeta mais sustentável e consciente.", color: "from-purple-500 to-pink-500" }
          ].map((card, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="card-hover p-6 relative overflow-hidden"
            >
              <div className="absolute top-2 right-2 opacity-20">
                <AppIcon name={card.iconName} size={28} className="text-gray-500" />
              </div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${card.color} flex items-center justify-center mb-4 shadow-lg`}>
                <AppIcon name={card.iconName} size={28} className="text-white" />
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