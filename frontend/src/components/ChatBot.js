import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { MessageCircle, Bot } from 'lucide-react';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: 'Olá! Sou o EcoBot, seu assistente virtual. Como posso ajudar você hoje?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showHelpMessage, setShowHelpMessage] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useUser();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const showMessage = () => {
      if (!isOpen) {
        setShowHelpMessage(true);
        setTimeout(() => setShowHelpMessage(false), 4000);
      }
    };

    const interval = setInterval(showMessage, 15000);
    const initialTimeout = setTimeout(showMessage, 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(initialTimeout);
    };
  }, [isOpen]);

  const quickActions = [
    { text: 'Ver meus EcoPoints', action: () => navigate('/gamificacao') },
    { text: 'Classificar resíduo', action: () => navigate('/classificar-residuos') },
    { text: 'Resgatar recompensas', action: () => navigate('/recompensas') },
    { text: 'Monitoramento ambiental', action: () => navigate('/monitoramento') }
  ];

  const callAI = async (message) => {
    return processLocalMessage(message);
  };

  const processLocalMessage = (message) => {
    const lowerMessage = message.toLowerCase().trim();
    
    // Respostas afirmativas
    if (lowerMessage === 'sim' || lowerMessage === 's' || lowerMessage === 'ok' || lowerMessage === 'quero' || lowerMessage === 'claro' || lowerMessage === 'sim!' || lowerMessage === 'quero!') {
      navigate('/classificar-residuos');
      return 'Perfeito! Redirecionando para o Classificador de Resíduos...\n\nVocê poderá tirar uma foto ou fazer upload de uma imagem para nossa IA identificar o tipo de resíduo!';
    }
    
    // Saudações
    if (lowerMessage.includes('olá') || lowerMessage.includes('ola') || lowerMessage.includes('oi') || lowerMessage.includes('bom dia') || lowerMessage.includes('boa tarde') || lowerMessage.includes('boa noite') || lowerMessage === 'oi!' || lowerMessage === 'olá!') {
      return 'Olá! Bem-vindo ao EcoSphere!\n\nSou o EcoBot, seu assistente de sustentabilidade. Como posso ajudar você hoje?\n\nExperimente perguntar:\n• "Como economizar água?"\n• "Dicas de reciclagem"\n• "Ver meus pontos"';
    }
    
    // Navegação
    if (lowerMessage.includes('dashboard') || lowerMessage.includes('painel')) {
      navigate('/dashboard');
      return 'Redirecionando para o Dashboard!';
    }
    
    if (lowerMessage.includes('classificar') || lowerMessage.includes('resíduo') || lowerMessage.includes('residuo') || lowerMessage.includes('lixo') || lowerMessage.includes('ia')) {
      navigate('/classificar-residuos');
      return 'Redirecionando para classificação de resíduos!\n\nUse nossa IA para identificar o tipo de material!';
    }
    
    if (lowerMessage.includes('gamificação') || lowerMessage.includes('gamificacao') || lowerMessage.includes('pontos') || lowerMessage.includes('ecopoints') || lowerMessage.includes('ver meus pontos') || lowerMessage.includes('meus pontos')) {
      navigate('/gamificacao');
      return 'Redirecionando para Gamificação!\n\nVeja seus EcoPoints e conquistas!';
    }
    
    if (lowerMessage.includes('recompensa') || lowerMessage.includes('prêmio') || lowerMessage.includes('premio') || lowerMessage.includes('resgatar')) {
      navigate('/recompensas');
      return 'Redirecionando para Recompensas!\n\nResgate seus prêmios!';
    }
    
    if (lowerMessage.includes('monitoramento') || lowerMessage.includes('clima') || lowerMessage.includes('ambiental') || lowerMessage.includes('tempo')) {
      navigate('/monitoramento');
      return 'Redirecionando para Monitoramento Ambiental!\n\nVeja dados climáticos em tempo real!';
    }
    
    // Reciclagem
    if (lowerMessage.includes('reciclagem') || lowerMessage.includes('reciclar')) {
      return 'A reciclagem é fundamental para o meio ambiente!\n\n**Plástico:** Garrafas PET, embalagens\n**Papel:** Caixas, jornais, revistas\n**Vidro:** Garrafas, potes\n**Metal:** Latas de alumínio\n\n**Dica:** Lave as embalagens antes de descartar!\n\nQuer classificar algum resíduo com nossa IA?';
    }
    
    // Sustentabilidade
    if (lowerMessage.includes('sustentabilidade') || lowerMessage.includes('meio ambiente') || lowerMessage.includes('planeta')) {
      return 'Sustentabilidade é cuidar do nosso planeta para as próximas gerações!\n\n**Ações importantes:**\n• Reduza o consumo de plástico\n• Economize água e energia\n• Prefira transporte público\n• Recicle corretamente\n• Plante árvores\n• Compre produtos sustentáveis\n\nCada pequena ação faz diferença!';
    }
    
    // Energia
    if (lowerMessage.includes('energia') || lowerMessage.includes('elétrica') || lowerMessage.includes('luz')) {
      return 'Economizar energia é essencial!\n\n**Dicas práticas:**\n• Use lâmpadas LED (70% mais econômicas)\n• Desligue aparelhos da tomada\n• Aproveite luz natural\n• Use eletrodomésticos eficientes (selo A)\n• Instale painéis solares se possível\n• Regule o ar-condicionado para 23°C\n\nEconomize energia e dinheiro!';
    }
    
    // Água
    if (lowerMessage.includes('água') || lowerMessage.includes('agua')) {
      return 'A água é um recurso precioso!\n\n**Evite desperdício:**\n• Feche a torneira ao escovar dentes (12L economizados)\n• Tome banhos de 5-10 minutos\n• Conserte vazamentos imediatamente\n• Reutilize água da chuva\n• Use máquinas só com carga cheia\n• Lave calçadas com vassoura, não mangueira\n\nPreserve este recurso vital!';
    }
    
    // Plástico
    if (lowerMessage.includes('plástico') || lowerMessage.includes('plastico')) {
      return 'O plástico é um dos maiores poluidores!\n\n**Como reduzir:**\n• Use sacolas reutilizáveis\n• Evite canudos plásticos\n• Prefira garrafas reutilizáveis\n• Compre a granel\n• Recuse embalagens desnecessárias\n\nO plástico leva 400 anos para se decompor!';
    }
    
    // Compostagem
    if (lowerMessage.includes('compostagem') || lowerMessage.includes('orgânico')) {
      return 'Compostagem transforma lixo em adubo!\n\n**Pode compostar:**\n• Cascas de frutas e legumes\n• Borra de café\n• Folhas secas\n• Restos de plantas\n\n**Não compostar:**\n• Carnes e laticínios\n• Óleos e gorduras\n• Fezes de animais\n\nReduza 50% do seu lixo!';
    }
    
    // Ajuda geral
    if (lowerMessage.includes('ajuda') || lowerMessage.includes('help') || lowerMessage.includes('o que você faz')) {
      return '**Sou o EcoBot!** Seu assistente de sustentabilidade.\n\n**Posso ajudar com:**\n• Dicas de reciclagem\n• Economia de energia e água\n• Informações sobre sustentabilidade\n• Navegação no site\n• Classificação de resíduos\n\nPergunte qualquer coisa sobre meio ambiente!';
    }
    
    // Resposta padrão
    return 'Olá! Sou o EcoBot, seu assistente de sustentabilidade!\n\n**Pergunte sobre:**\n• Reciclagem e compostagem\n• Economia de energia\n• Conservação da água\n• Redução de plástico\n• Sustentabilidade\n\n**Ou navegue:**\n• "Ver meus pontos"\n• "Classificar resíduo"\n• "Monitoramento"\n\nComo posso ajudar?';
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    const messageText = inputText;
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    const botResponse = await callAI(messageText);
    const botMessage = {
      id: Date.now() + 1,
      text: botResponse,
      sender: 'bot',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, botMessage]);
    setIsTyping(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <AnimatePresence>
        {showHelpMessage && !isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20, y: 10 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 20, y: 10 }}
            className="fixed bottom-24 right-6 bg-gradient-to-r from-eco-600 to-teal-600 text-white px-4 py-2 rounded-xl shadow-soft-lg z-50 whitespace-nowrap"
          >
            <div className="flex items-center gap-2">
              <MessageCircle size={20} />
              <span className="text-sm font-medium">Precisa de ajuda? Fala comigo!</span>
            </div>
            <div className="absolute -bottom-1 right-6 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-green-500"></div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => {
          setIsOpen(!isOpen);
          setShowHelpMessage(false);
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-full shadow-2xl z-50 flex items-center justify-center"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.i
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              className="bi bi-x-lg text-xl"
            />
          ) : (
            <motion.i
              key="chat"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="bi bi-chat-dots text-xl"
            />
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-soft-lg border border-stone-100 z-40 flex flex-col overflow-hidden"
          >
            <div className="bg-gradient-to-r from-eco-600 to-teal-600 text-white p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Bot size={24} />
              </div>
              <div>
                <h3 className="font-bold">EcoBot</h3>
                <p className="text-xs opacity-90">Assistente Virtual</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl ${
                      message.sender === 'user'
                        ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-line">{message.text}</p>
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-gray-100 p-3 rounded-2xl">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 border-t">
              <div className="flex flex-wrap gap-2 mb-3">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.action}
                    className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full transition-colors"
                  >
                    {action.text}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 border-t">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Digite sua mensagem..."
                  className="flex-1 px-3 py-2 border border-stone-200 rounded-xl focus:ring-2 focus:ring-eco-500/30 focus:border-eco-500 text-sm outline-none transition-all"
                />
                <button
                  onClick={sendMessage}
                  disabled={!inputText.trim()}
                  className="px-4 py-2 bg-gradient-to-r from-eco-600 to-teal-600 text-white rounded-xl hover:from-eco-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <i className="bi bi-send text-sm"></i>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatBot;