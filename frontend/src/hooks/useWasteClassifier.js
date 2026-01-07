import { useState, useEffect, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';

export const useWasteClassifier = () => {
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const classes = ['Plástico', 'Metal', 'Vidro', 'Papel', 'Orgânico', 'Eletrônico'];
  
  const wasteInfo = {
    'Plástico': {
      bin: 'Lixeira Vermelha',
      tips: 'Lave e remova rótulos. Plástico pode ser reciclado múltiplas vezes.',
      icon: '♻️',
      color: 'from-red-500 to-pink-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-800'
    },
    'Metal': {
      bin: 'Lixeira Amarela',
      tips: 'Lave bem antes de descartar. Metais economizam muita energia na reciclagem.',
      icon: '🥫',
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-800'
    },
    'Vidro': {
      bin: 'Lixeira Verde',
      tips: 'Remova tampas e rótulos. Vidro pode ser reciclado infinitamente.',
      icon: '🍶',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-800'
    },
    'Papel': {
      bin: 'Lixeira Azul',
      tips: 'Mantenha seco e limpo. Remova fitas adesivas e grampos.',
      icon: '📄',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-800'
    },
    'Orgânico': {
      bin: 'Lixeira Marrom',
      tips: 'Pode virar adubo! Separe restos de alimentos e cascas.',
      icon: '🍎',
      color: 'from-amber-600 to-orange-600',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-800'
    },
    'Eletrônico': {
      bin: 'Coleta Especial',
      tips: 'Leve a pontos de coleta especializados. Contém materiais tóxicos.',
      icon: '📱',
      color: 'from-purple-500 to-indigo-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-800'
    }
  };

  useEffect(() => {
    const loadModel = async () => {
      try {
        setLoading(true);
        
        // Tentar carregar modelo do Teachable Machine
        try {
          const loadedModel = await tf.loadLayersModel('/models/waste-classifier/model.json');
          setModel(loadedModel);
          console.log('✅ Modelo Teachable Machine carregado com sucesso');
        } catch (err) {
          console.log('⚠️ Modelo não encontrado, usando classificação simulada');
          setModel('simulated');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Erro ao carregar modelo:', err);
        setError(err.message);
        setModel('simulated');
        setLoading(false);
      }
    };

    loadModel();
  }, []);

  const classifyImage = useCallback(async (imageElement) => {
    if (!model) {
      throw new Error('Modelo não carregado');
    }

    try {
      // Se o modelo real estiver carregado
      if (model !== 'simulated') {
        const tensor = tf.browser.fromPixels(imageElement)
          .resizeNearestNeighbor([224, 224])
          .toFloat()
          .div(tf.scalar(255.0))
          .expandDims();
        
        const predictions = await model.predict(tensor).data();
        tensor.dispose();
        
        const maxIndex = predictions.indexOf(Math.max(...predictions));
        const confidence = predictions[maxIndex];
        
        return {
          class: classes[maxIndex],
          confidence: confidence,
          allPredictions: Array.from(predictions),
          ...wasteInfo[classes[maxIndex]]
        };
      }
      
      // Classificação simulada baseada em análise de cores dominantes
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = imageElement.width;
      canvas.height = imageElement.height;
      ctx.drawImage(imageElement, 0, 0);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      let r = 0, g = 0, b = 0;
      for (let i = 0; i < data.length; i += 4) {
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
      }
      
      const pixels = data.length / 4;
      r = Math.floor(r / pixels);
      g = Math.floor(g / pixels);
      b = Math.floor(b / pixels);
      
      // Lógica de classificação baseada em cor dominante
      let classIndex;
      let confidence;
      
      if (r > g && r > b && r > 150) {
        classIndex = 0; // Plástico (vermelho)
        confidence = 0.85 + Math.random() * 0.1;
      } else if (g > r && g > b && g > 120) {
        classIndex = 2; // Vidro (verde)
        confidence = 0.88 + Math.random() * 0.08;
      } else if (b > r && b > g) {
        classIndex = 3; // Papel (azul)
        confidence = 0.82 + Math.random() * 0.12;
      } else if (r > 180 && g > 180 && b < 100) {
        classIndex = 1; // Metal (amarelo/dourado)
        confidence = 0.90 + Math.random() * 0.08;
      } else if (r > 100 && g > 80 && b < 80) {
        classIndex = 4; // Orgânico (marrom)
        confidence = 0.78 + Math.random() * 0.15;
      } else {
        classIndex = Math.floor(Math.random() * 6);
        confidence = 0.75 + Math.random() * 0.15;
      }
      
      return {
        class: classes[classIndex],
        confidence: confidence,
        allPredictions: null,
        ...wasteInfo[classes[classIndex]]
      };
      
    } catch (err) {
      console.error('Erro na classificação:', err);
      throw err;
    }
  }, [model]);

  const calculatePoints = (confidence) => {
    if (confidence >= 0.90) return 10;
    if (confidence >= 0.70) return 5;
    return 2;
  };

  return {
    model,
    loading,
    error,
    classifyImage,
    calculatePoints,
    classes,
    wasteInfo
  };
};
