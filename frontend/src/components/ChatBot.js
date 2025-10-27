import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: 'Olá! 👋 Sou o EcoBot, seu assistente virtual! Como posso ajudar você hoje?',
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

  const callOpenAI = async (message) => {
    const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
    
    if (!apiKey || apiKey === 'SUA_CHAVE_OPENAI_AQUI') {
      return null;
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{
            role: 'system',
            content: 'Você é o EcoBot da plataforma EcoSphere. Responda em português sobre sustentabilidade de forma amigável.'
          }, {
            role: 'user',
            content: message
          }],
          max_tokens: 150
        })
      });

      const data = await response.json();
      return data.choices?.[0]?.message?.content;
    } catch (error) {
      return null;
    }
  };

  const callGemini = async (message) => {
    const apiKey = 'AIzaSyCr4UwLYqelPQ9Pl8bkt72JHMJkfG9S5V4';

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Responda em português: ${message}`
            }]
          }]
        })
      });

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text;
    } catch (error) {
      return null;
    }
  };

  const callAI = async (message) => {
    // Tentar OpenAI primeiro
    let response = await callOpenAI(message);
    if (response) {
      console.log('Usando OpenAI');
      return response;
    }

    // Fallback para Gemini
    response = await callGemini(message);
    if (response) {
      console.log('Usando Gemini');
      return response;
    }

    // Fallback para respostas locais
    console.log('Usando respostas locais');
    return processLocalMessage(message);
  };

  const processLocalMessage = (message) => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('dashboard')) {
      navigate('/dashboard');
      return 'Redirecionando para o Dashboard! 📊';
    }
    
    if (lowerMessage.includes('classificar') || lowerMessage.includes('resíduo')) {
      navigate('/classificar-residuos');
      return 'Redirecionando para classificação de resíduos! 🤖';
    }
    
    if (lowerMessage.includes('reciclagem') || lowerMessage.includes('reciclar')) {
      return 'A reciclagem é fundamental! ♾️\n\n• Separe plástico, papel, vidro e metal\n• Lave embalagens antes do descarte\n• Use nossa IA para identificar materiais\n• Encontre pontos de coleta próximos\n\nQuer classificar algum resíduo agora?';
    }
    
    if (lowerMessage.includes('sustentabilidade') || lowerMessage.includes('meio ambiente')) {
      return 'Sustentabilidade é cuidar do nosso planeta! 🌍\n\n• Reduza o consumo de plástico\n• Economize água e energia\n• Prefira transporte público\n• Recicle corretamente\n• Plante árvores\n\nCada ação conta para um futuro melhor!';
    }
    
    if (lowerMessage.includes('energia') || lowerMessage.includes('elétrica')) {
      return 'Economizar energia é essencial! ⚡\n\n• Use lâmpadas LED\n• Desligue aparelhos da tomada\n• Aproveite luz natural\n• Use eletrodomésticos eficientes\n• Instale painéis solares se possível';
    }
    
    if (lowerMessage.includes('água')) {
      return 'A água é preciosa! 💧\n\n• Feche a torneira ao escovar dentes\n• Tome banhos mais rápidos\n• Conserte vazamentos\n• Reutilize água da chuva\n• Use máquinas só com carga cheia';
    }
    
    return 'Olá! 🌱 Sou o EcoBot, seu assistente de sustentabilidade! Posso ajudar com:\n\n• Dicas de reciclagem\n• Economia de energia\n• Conservação da água\n• Navegação no site\n\nO que você gostaria de saber?';
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

    try {
      const botResponse = await callAI(messageText);
      const botMessage = {
        id: Date.now() + 1,
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Desculpe, ocorreu um erro. Tente novamente.',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
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
            className="fixed bottom-24 right-6 bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 whitespace-nowrap"
          >
            <div className="flex items-center gap-2">
              <span>💬</span>
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
            className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl z-40 flex flex-col overflow-hidden"
          >
            <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-lg">🤖</span>
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
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                />
                <button
                  onClick={sendMessage}
                  disabled={!inputText.trim()}
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl hover:from-green-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
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