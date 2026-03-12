import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useEnterKey } from '../hooks/useEnterKey';
import { useUser } from '../contexts/UserContext';
import { wasteAPI } from '../services/api';
import { useWasteClassifier } from '../hooks/useWasteClassifier';
import { Check, Camera, Sparkles } from 'lucide-react';
import { AppIcon } from '../components/ui/AppIcon';
import LoadingScreen from '../components/ui/LoadingScreen';

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
      const result = await classifyImage(img, selectedFile?.name);
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
              <LoadingScreen fullScreen={false} size={24} />
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-soft-lg border border-stone-100 p-5 sm:p-6 lg:p-8 relative overflow-hidden flex flex-col"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-eco-500 to-teal-500" />
              
              <div className="mb-6">
                <h2 className="text-xl font-bold text-stone-800">Enviar Imagem</h2>
                <p className="text-sm text-stone-500 mt-1">Faça upload ou tire uma foto do resíduo para análise</p>
              </div>

              <div 
                className={`flex-1 flex flex-col justify-center border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 relative ${
                  dragActive 
                    ? 'border-eco-500 bg-eco-50/50' 
                    : preview 
                      ? 'border-stone-200 bg-white' 
                      : 'border-stone-200 bg-stone-50/50 hover:bg-stone-50 hover:border-eco-300 cursor-pointer'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={(e) => {
                  // Só abre o file picker se não tiver preview nem câmera aberta
                  if (!useCamera && !preview && e.target === e.currentTarget) {
                    fileInputRef.current?.click();
                  }
                }}
              >
                <AnimatePresence mode="wait">
                  {preview ? (
                    <motion.div
                      key="preview"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="w-full flex flex-col items-center"
                    >
                      <div className="relative group w-full max-w-sm mx-auto">
                        <img 
                          src={preview} 
                          alt="Preview" 
                          className="w-full h-56 sm:h-64 object-cover rounded-xl shadow-sm border border-stone-200" 
                        />
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreview(null);
                            setSelectedFile(null);
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-stone-700 p-2 rounded-lg shadow-sm hover:bg-red-50 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                          title="Remover imagem"
                        >
                          <i className="bi bi-trash-fill"></i>
                        </button>
                      </div>
                      <div className="mt-4 flex items-center justify-center gap-2 text-sm text-eco-700 bg-eco-50 px-4 py-2 rounded-full font-medium">
                        <Check size={16} />
                        Imagem pronta para análise
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="upload"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-stone-500 flex flex-col items-center pointer-events-none"
                    >
                      <div className="w-20 h-20 bg-white rounded-full shadow-sm border border-stone-100 flex items-center justify-center mb-5 text-eco-500">
                        <motion.div 
                          animate={{ y: [0, -6, 0] }}
                          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                        >
                          <i className="bi bi-cloud-arrow-up-fill text-4xl"></i>
                        </motion.div>
                      </div>
                      <p className="text-lg font-medium text-stone-700 mb-1">Arraste uma imagem aqui</p>
                      <p className="text-sm text-stone-400 mb-6">PNG, JPG ou WEBP (Max. 5MB)</p>
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
                
                {!useCamera && !preview && (
                  <div className="flex flex-col sm:flex-row gap-3 justify-center mt-auto">
                    <label
                      htmlFor="file-input"
                      className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-medium bg-white border-2 border-stone-200 text-stone-700 hover:border-eco-500 hover:text-eco-600 hover:bg-eco-50 cursor-pointer w-full sm:w-auto transition-all shadow-sm"
                    >
                      <i className="bi bi-folder2-open text-lg"></i>
                      Procurar Arquivo
                    </label>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startCamera();
                      }}
                      className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-medium bg-white border-2 border-stone-200 text-stone-700 hover:border-teal-500 hover:text-teal-600 hover:bg-teal-50 w-full sm:w-auto transition-all shadow-sm"
                    >
                      <Camera size={18} />
                      Abrir Câmera
                    </button>
                  </div>
                )}
                
                {useCamera && !preview && (
                  <div className="space-y-4 w-full mt-4" onClick={(e) => e.stopPropagation()}>
                    <div className="relative rounded-xl overflow-hidden shadow-inner bg-black">
                      <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline
                        className="w-full h-56 sm:h-64 object-cover"
                      />
                      {/* Borda de foco da câmera animada (UI) */}
                      <div className="absolute inset-0 pointer-events-none border-2 border-white/20 m-4 rounded-lg flex items-center justify-center">
                         <div className="w-16 h-16 border-2 border-white/50 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                         </div>
                      </div>
                    </div>
                    <canvas ref={canvasRef} className="hidden" />
                    
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <button
                        onClick={capturePhoto}
                        className="flex-1 sm:flex-none bg-eco-600 hover:bg-eco-700 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 transform active:scale-95 transition-all shadow-md font-medium"
                      >
                        <i className="bi bi-camera-fill text-lg"></i>
                        Tirar Foto
                      </button>
                      <button
                        onClick={stopCamera}
                        className="flex-1 sm:flex-none bg-white border-2 border-stone-200 hover:bg-red-50 text-stone-600 hover:text-red-600 hover:border-red-200 px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all font-medium"
                      >
                        <X size={18} />
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {selectedFile && (
                <div className="mt-6 pt-6 border-t border-stone-100">
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={classifyWaste}
                    disabled={loading}
                    className="w-full relative overflow-hidden group bg-stone-900 text-white py-4 rounded-xl font-semibold disabled:opacity-70 flex items-center justify-center gap-3 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
                  >
                    {/* Efeito de brilho de fundo no botão */}
                    <div className="absolute inset-0 bg-gradient-to-r from-eco-500 via-teal-500 to-eco-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="relative flex items-center gap-2 z-10">
                      {loading ? (
                        <>
                          <LoadingScreen fullScreen={false} size={20} color="white" />
                          <span>Analisando com IA...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={20} className="text-amber-300" />
                          <span>Identificar Resíduo</span>
                          <i className="bi bi-arrow-right ml-1 opacity-70 group-hover:translate-x-1 transition-transform"></i>
                        </>
                      )}
                    </div>
                  </motion.button>
                  
                  {!loading && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="text-center mt-3"
                    >
                      <span className="text-xs text-stone-400 flex items-center justify-center gap-1.5">
                        Pressione <kbd className="px-1.5 py-0.5 bg-stone-100 border border-stone-200 rounded-md text-[10px] font-sans text-stone-600 font-bold shadow-sm">Enter</kbd> para classificar
                      </span>
                    </motion.div>
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
                  className="bg-white rounded-3xl shadow-soft-lg border border-stone-100 p-5 sm:p-6 lg:p-8 relative overflow-hidden flex flex-col h-full"
                >
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-violet-500 to-purple-500" />
                  
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-stone-800">Resultado da Análise</h2>
                      <p className="text-sm text-stone-500 mt-1">Classificação feita por Inteligência Artificial</p>
                    </div>
                    {showSuccess && (
                      <motion.div
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="text-green-500 bg-green-50 w-10 h-10 rounded-full flex items-center justify-center shadow-sm"
                      >
                        <i className="bi bi-check-lg text-xl"></i>
                      </motion.div>
                    )}
                  </div>
                  
                  <motion.div
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    className={`p-6 rounded-2xl ${classification.bgColor} mb-6 border border-black/5 relative overflow-hidden group`}
                  >
                    {/* Efeito de brilho sutil no fundo */}
                    <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between relative z-10 gap-4">
                      <div className="flex items-center gap-4">
                        <motion.div 
                          animate={{ rotate: [0, 5, -5, 0] }}
                          transition={{ repeat: 3, duration: 0.6, delay: 0.2 }}
                          className="flex items-center justify-center w-14 h-14 shrink-0 rounded-2xl bg-white/40 shadow-sm backdrop-blur-md"
                        >
                          <AppIcon name={classification.iconName} size={32} className={classification.textColor} />
                        </motion.div>
                        <div>
                          <div className={`text-2xl font-black ${classification.textColor} tracking-tight leading-tight`}>
                            {classification.type}
                          </div>
                          <div className="flex items-center mt-1">
                            <span className="text-xs font-semibold bg-white/50 px-2 py-1 rounded-md text-stone-700 shadow-sm border border-white/40">
                              Confiança: {(classification.confidence * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-left sm:text-right flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                        <div className={`text-sm font-bold uppercase tracking-wider opacity-80 ${classification.textColor} mb-0 sm:mb-1.5`}>
                          {classification.bin}
                        </div>
                        <motion.div 
                          initial={{ scale: 0, y: 10 }}
                          animate={{ scale: 1, y: 0 }}
                          transition={{ delay: 0.4, type: "spring" }}
                          className="inline-flex items-center gap-1.5 bg-white shadow-sm px-3 py-1.5 rounded-xl border border-stone-100"
                        >
                          <Sparkles size={16} className="text-amber-500" />
                          <span className="font-bold text-green-600 text-sm">+{classification.points} pts</span>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>

                  <div className="grid grid-cols-1 gap-4 flex-1">
                    <div className="bg-stone-50 border border-stone-100 p-5 rounded-2xl hover:border-eco-200 hover:bg-white transition-colors duration-300">
                      <h3 className="font-semibold mb-2 flex items-center gap-2 text-stone-800">
                        <div className="w-8 h-8 rounded-lg bg-eco-100 flex items-center justify-center">
                          <i className="bi bi-recycle text-eco-600"></i>
                        </div>
                        Dicas de Descarte
                      </h3>
                      <p className="text-stone-600 text-sm leading-relaxed sm:pl-10">{classification.tips}</p>
                    </div>
                    
                    <div className="bg-stone-50 border border-stone-100 p-5 rounded-2xl hover:border-blue-200 hover:bg-white transition-colors duration-300">
                      <h3 className="font-semibold mb-3 flex items-center gap-2 text-stone-800">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                          <i className="bi bi-geo-alt-fill text-blue-600"></i>
                        </div>
                        Pontos de Coleta
                      </h3>
                      <div className="space-y-2.5 sm:pl-10">
                        {classification.locations?.map((location, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 + 0.3 }}
                            className="flex items-center gap-3 text-sm text-stone-600 bg-white p-2.5 rounded-xl border border-stone-100 shadow-sm"
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                            {location}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mt-2 text-center">
                      <motion.button
                        onClick={() => navigate('/guia')}
                        className="w-full sm:w-auto bg-white border-2 border-stone-200 text-stone-700 hover:border-eco-500 hover:text-eco-600 hover:bg-eco-50 px-6 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all shadow-sm mx-auto"
                      >
                        <i className="bi bi-book text-lg"></i>
                        Ver Guia Sustentável
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
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-6 mt-8 sm:mt-12 max-w-5xl mx-auto"
        >
          {[
            { iconName: "lightbulb", title: "Como Funciona", desc: "Nossa inteligência identifica o tipo de material instantaneamente usando visão computacional.", bg: "bg-blue-50", iconColor: "text-blue-500" },
            { iconName: "trophy", title: "Ganhe Pontos", desc: "Cada classificação correta gera EcoPoints que podem ser trocados por recompensas exclusivas.", bg: "bg-amber-50", iconColor: "text-amber-500" },
            { iconName: "globe", title: "Impacto Real", desc: "Suas ações do dia a dia contribuem para um planeta muito mais sustentável e consciente.", bg: "bg-eco-50", iconColor: "text-eco-600" }
          ].map((card, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="flex items-start gap-4 p-5 rounded-3xl bg-transparent hover:bg-white hover:shadow-soft-lg border border-transparent hover:border-stone-100 transition-all duration-300"
            >
              <div className={`w-12 h-12 shrink-0 rounded-2xl ${card.bg} flex items-center justify-center`}>
                <AppIcon name={card.iconName} size={24} className={card.iconColor} />
              </div>
              <div>
                <h3 className="text-base font-bold text-stone-800 mb-1">{card.title}</h3>
                <p className="text-stone-500 text-sm leading-relaxed">{card.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default WasteClassifier;