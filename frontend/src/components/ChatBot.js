import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { chatbotAPI } from '../services/api';
import { fetchWeatherData, SOURCE_LABELS } from '../services/weatherService';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

const chatAvatarSrc = `${process.env.PUBLIC_URL || ''}/chat-tcc.svg`;
const HELP_TEXT = 'Precisa de alguma ajuda?';
const WELCOME_TEXT = 'Olá! Sou o EcoBot, seu assistente virtual. Como posso ajudar você hoje?';
const CITY_SUGGESTIONS = ['São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Curitiba', 'Salvador'];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function isOpenMonitoringIntent(text) {
  const t = String(text || '').toLowerCase().trim();
  return (
    t.includes('abrir monitoramento')
    || t.includes('ir para monitoramento')
    || t.includes('levar para o monitoramento')
    || t.includes('levar pro monitoramento')
    || t.includes('painel de monitoramento')
    || t === 'monitoramento'
    || t === 'abrir monitoramente'
  );
}

function isWeatherIntent(text) {
  if (isOpenMonitoringIntent(text)) return false;
  const t = String(text || '').toLowerCase();
  return /temperatura|clima|previs[aã]o|umidade|qualidade do ar|vento|faz calor|faz frio|graus|como est[aá] o tempo|\btempo\b|meteorolog|dados ambientais/.test(t);
}

const ESCORT_PHRASE = 'Pera ai, vou te levar la...';

function buildWeatherCard(city, bairro, result) {
  const data = result?.environmentalData || {};
  const air = data.qualidadeAr;
  const airText = air?.label
    || (air?.aqi != null ? `EAQI ${air.aqi}` : 'Indisponivel');
  const place = result?.placeLabel
    || (bairro ? `${city} · ${bairro}` : city);

  return {
    place,
    temperature: data.temperatura ?? '—',
    feelsLike: data.sensacao ?? '—',
    humidity: data.umidade ?? '—',
    wind: data.vento ?? '—',
    air: airText,
    uv: data.uv == null ? 'Indisponivel' : String(data.uv),
    condition: data.descricao || '—',
    source: result?.source || 'simulated',
    sourceLabel: SOURCE_LABELS[result?.source] || SOURCE_LABELS.simulated,
  };
}

function TypingDots({ className = 'bg-stone-400', size = 'md' }) {
  const dot = size === 'lg' ? 'w-2 h-2' : 'w-1.5 h-1.5';
  return (
    <span className="inline-flex items-center gap-1" aria-hidden>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={`block ${dot} rounded-full ${className}`}
          style={{
            animation: 'ecobot-typing 1.2s ease-in-out infinite',
            animationDelay: `${i * 0.16}s`,
          }}
        />
      ))}
    </span>
  );
}

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showHelpMessage, setShowHelpMessage] = useState(false);
  const [helpPhase, setHelpPhase] = useState('typing'); // typing | text
  const [helpTyped, setHelpTyped] = useState('');
  const [aiReady, setAiReady] = useState(false);
  const [weatherFlow, setWeatherFlow] = useState(null); // { step, city?, bairro? }
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [loadingLabel, setLoadingLabel] = useState('');
  const [escort, setEscort] = useState(null); // { typed, phase }
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const welcomeStartedRef = useRef(false);
  const navigate = useNavigate();

  useBodyScrollLock(isOpen || Boolean(escort));

  useEffect(() => {
    chatbotAPI.getStatus()
      .then((res) => setAiReady(Boolean(res.data?.configured)))
      .catch(() => setAiReady(false));
  }, []);

  const scrollToBottom = () => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
      return;
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!isOpen) return;
    scrollToBottom();
  }, [messages, isTyping, isOpen, weatherLoading, loadingLabel]);

  const pushBotMessage = async (text, delayMs = 850) => {
    setIsTyping(true);
    await sleep(delayMs);
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        text,
        sender: 'bot',
        timestamp: new Date(),
      },
    ]);
    setIsTyping(false);
  };

  // Mensagem inicial: 3 pontinhos por 2s, depois o texto
  useEffect(() => {
    if (!isOpen || welcomeStartedRef.current) return undefined;
    welcomeStartedRef.current = true;
    setIsTyping(true);

    const timer = setTimeout(() => {
      setMessages([
        {
          id: Date.now(),
          text: WELCOME_TEXT,
          sender: 'bot',
          timestamp: new Date(),
        },
      ]);
      setIsTyping(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [isOpen]);

  // Balão de ajuda: pontinhos → some → digita letra a letra
  useEffect(() => {
    if (isOpen) {
      setShowHelpMessage(false);
      return undefined;
    }

    let hideTimer;
    let typingTimer;
    let charTimer;
    let interval;
    let initialTimeout;

    const clearCycleTimers = () => {
      clearTimeout(typingTimer);
      clearTimeout(hideTimer);
      clearInterval(charTimer);
    };

    const startHelpCycle = () => {
      clearCycleTimers();
      setShowHelpMessage(true);
      setHelpPhase('typing');
      setHelpTyped('');

      typingTimer = setTimeout(() => {
        setHelpPhase('text');
        let charIndex = 0;
        setHelpTyped('');

        charTimer = setInterval(() => {
          charIndex += 1;
          setHelpTyped(HELP_TEXT.slice(0, charIndex));
          if (charIndex >= HELP_TEXT.length) {
            clearInterval(charTimer);
            hideTimer = setTimeout(() => {
              setShowHelpMessage(false);
              setHelpPhase('typing');
              setHelpTyped('');
            }, 3200);
          }
        }, 38);
      }, 1400);
    };

    interval = setInterval(startHelpCycle, 16000);
    initialTimeout = setTimeout(startHelpCycle, 2500);

    return () => {
      clearInterval(interval);
      clearTimeout(initialTimeout);
      clearCycleTimers();
    };
  }, [isOpen]);

  const quickActions = [
    { text: 'Ver meus EcoPoints', action: () => navigate('/gamificacao') },
    { text: 'Classificar resíduo', action: () => navigate('/classificar-residuos') },
    { text: 'Resgatar recompensas', action: () => navigate('/recompensas') },
    { text: 'Monitoramento ambiental', action: () => { escortToMonitoring(); } }
  ];

  const escortToMonitoring = async () => {
    setIsOpen(false);
    setShowHelpMessage(false);
    setWeatherFlow(null);
    setWeatherLoading(false);
    setEscort({ phase: 'enter', typed: '' });

    await sleep(450);
    let typed = '';
    for (let i = 0; i < ESCORT_PHRASE.length; i += 1) {
      typed += ESCORT_PHRASE[i];
      setEscort({ phase: 'talk', typed });
      await sleep(34);
    }

    await sleep(1100);
    setEscort({ phase: 'go', typed: ESCORT_PHRASE });
    navigate('/monitoramento');
    await sleep(850);
    setEscort(null);
  };

  const applyNavigationShortcuts = (message) => {
    const lowerMessage = message.toLowerCase();
    if (isOpenMonitoringIntent(lowerMessage)) return;
    if (lowerMessage.includes('dashboard') || lowerMessage.includes('painel')) navigate('/dashboard');
    else if (lowerMessage.includes('classificar') || lowerMessage.includes('resíduo') || lowerMessage.includes('residuo') || lowerMessage.includes('lixo')) navigate('/classificar-residuos');
    else if (lowerMessage.includes('gamificação') || lowerMessage.includes('gamificacao') || lowerMessage.includes('pontos') || lowerMessage.includes('ecopoints') || lowerMessage.includes('missão') || lowerMessage.includes('missao') || lowerMessage.includes('badge')) navigate('/gamificacao');
    else if (lowerMessage.includes('recompensa') || lowerMessage.includes('resgatar')) navigate('/recompensas');
    else if (lowerMessage.includes('educação') || lowerMessage.includes('educacao') || lowerMessage.includes('curso')) navigate('/educacao');
    else if (lowerMessage.includes('perfil')) navigate('/perfil');
  };

  const startWeatherFlow = async () => {
    setWeatherFlow({ step: 'city' });
    await pushBotMessage(
      'Claro! Vou usar o monitoramento ambiental do EcoSphere pra te ajudar com isso.',
      700
    );
    await pushBotMessage('Em qual cidade você está?', 900);
  };

  const runWeatherLookup = async (city, bairro) => {
    setWeatherFlow({ step: 'loading', city, bairro });
    setWeatherLoading(true);
    setLoadingLabel('Conectando ao Open-Meteo...');
    await sleep(400);
    setLoadingLabel(`Localizando ${city}${bairro ? ` · ${bairro}` : ''}...`);

    try {
      const result = await fetchWeatherData(city, bairro || undefined);
      setLoadingLabel(
        result.source === 'open-meteo'
          ? 'Dados reais recebidos'
          : result.source === 'openweathermap'
            ? 'Dados via OpenWeatherMap'
            : 'Servico externo indisponivel — resumo contingente'
      );
      await sleep(350);
      setWeatherLoading(false);
      setWeatherFlow(null);
      setIsTyping(true);
      await sleep(450);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          sender: 'bot',
          timestamp: new Date(),
          kind: 'weather',
          weather: buildWeatherCard(city, bairro, result),
          text: '',
        },
      ]);
      setIsTyping(false);
      await pushBotMessage(
        'Quer ver o painel completo? Digite "abrir monitoramento".',
        500
      );
    } catch (err) {
      console.error('EcoBot clima:', err);
      setWeatherLoading(false);
      setWeatherFlow(null);
      await pushBotMessage(
        'Nao consegui consultar agora. Tente de novo ou abra o painel em /monitoramento.',
        500
      );
    }
  };

  const handleWeatherFlowReply = async (message) => {
    const text = String(message || '').trim();
    const lower = text.toLowerCase();

    if (lower === 'cancelar' || lower === 'sair') {
      setWeatherFlow(null);
      setWeatherLoading(false);
      await pushBotMessage('Tudo bem! Se quiser o clima depois, e so pedir novamente.', 600);
      return;
    }

    if (weatherFlow?.step === 'city') {
      if (text.length < 2) {
        await pushBotMessage('Me conta o nome da cidade, por favor 🙂', 600);
        return;
      }
      setWeatherFlow({ step: 'bairro', city: text });
      await pushBotMessage(`Perfeito, ${text}!`, 650);
      await pushBotMessage(
        'E qual o bairro? Se preferir, digite "pular".',
        850
      );
      return;
    }

    if (weatherFlow?.step === 'bairro') {
      const skip = ['pular', 'pula', 'não', 'nao', 'n', 'skip', '-'].includes(lower);
      const bairro = skip ? '' : text;
      await pushBotMessage(
        skip
          ? 'Beleza! Vou consultar só pela cidade...'
          : `Ótimo! Consultando ${weatherFlow.city} · ${bairro}...`,
        700
      );
      await runWeatherLookup(weatherFlow.city, bairro);
    }
  };

  const callAI = async (message) => {
    applyNavigationShortcuts(message);

    try {
      const history = messages.map((m) => ({
        sender: m.sender,
        text: m.text,
      }));
      const res = await chatbotAPI.ask(message, history);
      if (res.data?.reply) {
        setAiReady(true);
        return res.data.reply;
      }
    } catch (err) {
      console.error('EcoBot OpenRouter:', err);
    }

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

  const sendMessage = async (rawText) => {
    const messageText = String(rawText ?? inputText).trim();
    if (!messageText || weatherLoading || escort) return;

    const userMessage = {
      id: Date.now(),
      text: messageText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');

    if (isOpenMonitoringIntent(messageText)) {
      await escortToMonitoring();
      return;
    }

    if (weatherFlow && weatherFlow.step !== 'loading') {
      await handleWeatherFlowReply(messageText);
      return;
    }

    if (isWeatherIntent(messageText)) {
      await startWeatherFlow();
      return;
    }

    setIsTyping(true);
    const botResponse = await callAI(messageText);
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now() + 1,
        text: botResponse,
        sender: 'bot',
        timestamp: new Date(),
      },
    ]);
    setIsTyping(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const openChat = () => {
    setIsOpen(true);
    setShowHelpMessage(false);
    setHelpPhase('typing');
    setHelpTyped('');
  };

  return (
    <>
      <style>
        {`@keyframes ecobot-typing {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.45; }
          30% { transform: translateY(-3px); opacity: 1; }
        }
        @keyframes ecobot-ring {
          0%, 100% { transform: scale(1); opacity: 0.55; }
          50% { transform: scale(1.12); opacity: 0.2; }
        }
        @keyframes ecobot-progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(220%); }
        }
        @keyframes ecobot-bounce-soft {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }`}
      </style>

      <AnimatePresence>
        {escort && (
          <motion.div
            key="ecobot-escort"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex items-center justify-center px-6"
            style={{
              background: 'radial-gradient(circle at 50% 40%, rgba(236,253,245,0.96), rgba(15,118,110,0.55) 70%, rgba(15,23,42,0.72))',
              backdropFilter: 'blur(8px)',
            }}
          >
            <motion.div
              initial={{ scale: 0.7, y: 40, opacity: 0 }}
              animate={{
                scale: escort.phase === 'go' ? 1.05 : 1,
                y: escort.phase === 'go' ? -12 : 0,
                opacity: 1,
                x: escort.phase === 'go' ? 24 : 0,
              }}
              transition={{ type: 'spring', stiffness: 260, damping: 18 }}
              className="relative flex flex-col items-center max-w-sm w-full"
            >
              <div className="relative mb-4">
                <motion.div
                  className="absolute -inset-4 rounded-full bg-white/30 blur-xl"
                  animate={{ opacity: [0.35, 0.7, 0.35], scale: [0.95, 1.08, 0.95] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                />
                <img
                  src={chatAvatarSrc}
                  alt="EcoBot"
                  className="relative w-36 h-36 object-contain drop-shadow-2xl"
                  style={{ animation: escort.phase === 'talk' ? 'ecobot-bounce-soft 1.4s ease-in-out infinite' : undefined }}
                  draggable={false}
                />
              </div>

              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.15 }}
                className="relative w-full bg-white rounded-3xl rounded-bl-md shadow-2xl border border-white/80 px-5 py-4"
              >
                <p className="text-[11px] font-bold uppercase tracking-wide text-eco-600 mb-1">
                  EcoBot
                </p>
                <p
                  className="text-[18px] font-semibold text-stone-800 min-h-[1.6em]"
                  style={{ fontFamily: '"Nunito", "Segoe UI", system-ui, sans-serif' }}
                >
                  {escort.typed}
                  {escort.phase !== 'go' && (
                    <span className="inline-block w-[2px] h-[1em] ml-0.5 align-[-2px] bg-eco-500 animate-pulse" />
                  )}
                </p>
                <span className="absolute -bottom-2 left-8 w-4 h-4 bg-white rotate-45 border-r border-b border-stone-100" />
              </motion.div>

              {escort.phase === 'go' && (
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-5 text-sm font-semibold text-white/95"
                >
                  Abrindo monitoramento...
                </motion.p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showHelpMessage && !isOpen && (
          <motion.button
            type="button"
            onClick={openChat}
            initial={{ opacity: 0, x: 16, y: 8 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 12, y: 6 }}
            className="fixed bottom-[6.75rem] right-6 z-50 max-w-[min(17rem,calc(100vw-5.5rem))] text-left border-0 bg-transparent p-0 cursor-pointer"
          >
            <div className="relative bg-white text-stone-700 px-3.5 py-2.5 rounded-2xl rounded-br-md shadow-soft-lg border border-stone-100 min-h-[2.75rem] flex items-center">
              <AnimatePresence mode="wait">
                {helpPhase === 'typing' ? (
                  <motion.span
                    key="help-typing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="inline-flex items-center justify-center px-2 py-1"
                  >
                    <TypingDots className="bg-[#25D366]" size="lg" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="help-text"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm font-medium leading-snug text-stone-700"
                  >
                    {helpTyped}
                    <span className="inline-block w-[2px] h-3.5 ml-0.5 align-middle bg-eco-500 animate-pulse" />
                  </motion.span>
                )}
              </AnimatePresence>
              <span className="absolute -bottom-1.5 right-5 w-3 h-3 bg-white border-r border-b border-stone-100 rotate-45" />
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        aria-label={isOpen ? 'Fechar chat' : 'Abrir chat'}
        onClick={() => {
          if (isOpen) {
            setIsOpen(false);
          } else {
            openChat();
          }
        }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.95 }}
        className={`fixed bottom-5 right-5 z-50 flex items-center justify-center border-0 outline-none focus:outline-none ${
          isOpen
            ? 'w-14 h-14 rounded-full bg-stone-800 text-white shadow-soft-lg'
            : 'w-[4.5rem] h-[4.5rem] bg-transparent p-0'
        }`}
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
            <motion.span
              key="chat"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative flex items-center justify-center w-full h-full"
            >
              <span
                className="absolute inset-0 rounded-full bg-gradient-to-br from-eco-400/35 to-teal-400/30"
                style={{ animation: 'ecobot-ring 2.8s ease-in-out infinite' }}
              />
              <span className="absolute inset-[3px] rounded-full bg-white shadow-[0_8px_24px_rgba(15,118,110,0.22)] ring-2 ring-white" />
              <img
                src={chatAvatarSrc}
                alt="EcoBot"
                className="relative z-[1] w-[3.35rem] h-[3.35rem] object-contain select-none pointer-events-none"
                draggable={false}
              />
              <span className="absolute bottom-1 right-1 z-[2] w-3.5 h-3.5 rounded-full bg-[#25D366] border-2 border-white shadow-sm" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            className="fixed z-40 bottom-24 right-3 sm:right-6 w-[min(34rem,calc(100vw-1.5rem))] h-[min(42rem,calc(100dvh-7.5rem))] bg-white rounded-3xl shadow-soft-lg border border-stone-100 flex flex-col overflow-hidden"
            style={{ fontFamily: '"Nunito", "Segoe UI", system-ui, -apple-system, sans-serif' }}
          >
            <div className="shrink-0 bg-gradient-to-r from-eco-600 to-teal-600 text-white px-4 py-3.5 flex items-center gap-3">
              <div className="relative shrink-0">
                <img
                  src={chatAvatarSrc}
                  alt=""
                  className="w-12 h-12 object-contain bg-white/15 rounded-full p-0.5 ring-2 ring-white/25"
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#25D366] border-2 border-eco-700" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold leading-tight">EcoBot</h3>
                <p className="text-xs opacity-90 flex items-center gap-1.5 mt-0.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-300" />
                  online · Assistente virtual
                </p>
              </div>
              {aiReady && (
                <div className="flex items-center gap-1 bg-white/15 backdrop-blur px-2 py-1 rounded-lg shrink-0">
                  <Sparkles size={11} className="text-amber-300" />
                  <span className="text-[10px] font-bold text-white/90">IA</span>
                </div>
              )}
            </div>

            <div
              ref={messagesContainerRef}
              className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-3.5 py-4 space-y-2.5 bg-[#F0F2F5]"
            >
              {messages.map((message) => {
                const isUser = message.sender === 'user';
                const timeLabel = new Date(message.timestamp).toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                });

                if (message.kind === 'weather' && message.weather) {
                  const w = message.weather;
                  const realSource = w.source === 'open-meteo' || w.source === 'openweathermap';
                  return (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-start"
                    >
                      <div className="relative w-full max-w-[94%] rounded-2xl rounded-bl-sm bg-white shadow-sm border border-stone-100 overflow-hidden">
                        <div className="px-3.5 pt-3 pb-2 bg-gradient-to-r from-eco-50 to-teal-50 border-b border-stone-100">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-eco-700">
                            Monitoramento ambiental
                          </p>
                          <p className="text-[15px] font-bold text-stone-800 mt-0.5 leading-snug">
                            {w.place}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 p-3">
                          {[
                            { label: 'Temperatura', value: `${w.temperature}°C` },
                            { label: 'Sensação', value: `${w.feelsLike}°C` },
                            { label: 'Umidade', value: `${w.humidity}%` },
                            { label: 'Vento', value: `${w.wind} km/h` },
                            { label: 'Qualidade do ar', value: w.air },
                            { label: 'UV', value: w.uv },
                          ].map((item) => (
                            <div
                              key={item.label}
                              className="rounded-xl bg-stone-50 border border-stone-100 px-2.5 py-2"
                            >
                              <p className="text-[10px] font-semibold uppercase tracking-wide text-stone-400">
                                {item.label}
                              </p>
                              <p className="text-[14px] font-bold text-stone-800 mt-0.5">
                                {item.value}
                              </p>
                            </div>
                          ))}
                        </div>
                        <div className="px-3.5 pb-2.5 flex items-center justify-between gap-2">
                          <p className="text-[12px] text-stone-500">
                            Condicao: <span className="font-semibold text-stone-700">{w.condition}</span>
                          </p>
                          <span
                            className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              realSource
                                ? 'bg-eco-50 text-eco-700 border border-eco-100'
                                : 'bg-amber-50 text-amber-700 border border-amber-100'
                            }`}
                          >
                            {realSource ? 'API externa' : 'Simulado'}
                          </span>
                        </div>
                        <span className="block text-right text-[10px] text-[#8696A0] px-3 pb-2 select-none">
                          {timeLabel}
                        </span>
                      </div>
                    </motion.div>
                  );
                }

                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`relative max-w-[88%] px-3 pt-2 pb-1.5 shadow-sm ${
                        isUser
                          ? 'bg-[#D9FDD3] text-[#111B21] rounded-2xl rounded-br-sm'
                          : 'bg-white text-[#111B21] rounded-2xl rounded-bl-sm'
                      }`}
                    >
                      <p
                        className="text-[15px] font-normal whitespace-pre-line tracking-[0.01em]"
                        style={{ lineHeight: 1.45 }}
                      >
                        {message.text}
                      </p>
                      <span
                        className={`mt-1 block text-right text-[10px] leading-none select-none ${
                          isUser ? 'text-[#667781]' : 'text-[#8696A0]'
                        }`}
                      >
                        {timeLabel}
                      </span>
                    </div>
                  </motion.div>
                );
              })}

              {isTyping && !weatherLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-white shadow-sm px-4 py-3 rounded-2xl rounded-bl-sm">
                    <TypingDots className="bg-[#8696A0]" size="lg" />
                  </div>
                </motion.div>
              )}

              {weatherLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="w-full max-w-[92%] bg-white shadow-sm rounded-2xl rounded-bl-sm border border-eco-100 overflow-hidden">
                    <div className="px-3.5 pt-3 pb-2.5">
                      <div className="flex items-center gap-2.5 mb-2">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-eco-50">
                          <TypingDots className="bg-eco-500" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold text-stone-800 leading-tight">
                            Consultando monitoramento
                          </p>
                          <p className="text-[12px] text-stone-500 mt-0.5 truncate">
                            {loadingLabel || 'Aguarde um instante...'}
                          </p>
                        </div>
                      </div>
                      <div className="h-1.5 rounded-full bg-stone-100 overflow-hidden">
                        <div
                          className="h-full w-1/2 rounded-full bg-gradient-to-r from-eco-500 to-teal-400"
                          style={{ animation: 'ecobot-progress 1.35s ease-in-out infinite' }}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="shrink-0 p-4 border-t border-stone-100 bg-white">
              {weatherFlow?.step === 'city' && !weatherLoading && (
                <div className="mb-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-stone-400 mb-2">
                    Cidades rapidas
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {CITY_SUGGESTIONS.map((city) => (
                      <button
                        key={city}
                        type="button"
                        onClick={() => sendMessage(city)}
                        disabled={isTyping}
                        className="text-left text-[13px] font-semibold text-eco-900 bg-gradient-to-br from-eco-50 to-teal-50 hover:from-eco-100 hover:to-teal-100 px-3.5 py-2.5 rounded-xl border border-eco-100 shadow-sm transition-all active:scale-[0.98] disabled:opacity-50"
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {weatherFlow?.step === 'bairro' && !weatherLoading && (
                <div className="flex flex-wrap gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => sendMessage('pular')}
                    disabled={isTyping}
                    className="text-[13px] font-semibold bg-eco-50 hover:bg-eco-100 text-eco-800 px-4 py-2 rounded-xl border border-eco-100 transition-colors disabled:opacity-50"
                  >
                    Pular bairro
                  </button>
                  <button
                    type="button"
                    onClick={() => sendMessage('cancelar')}
                    disabled={isTyping}
                    className="text-[13px] font-medium bg-stone-50 hover:bg-stone-100 text-stone-500 px-4 py-2 rounded-xl border border-stone-100 transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                </div>
              )}
              {!weatherFlow && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={action.action}
                      className="text-xs bg-stone-100 hover:bg-stone-200 text-stone-700 px-3 py-1.5 rounded-full transition-colors"
                    >
                      {action.text}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-2 rounded-2xl border border-stone-200 bg-white px-3 py-2.5 shadow-sm focus-within:border-eco-500 focus-within:ring-4 focus-within:ring-eco-500/15 transition-all">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={weatherLoading || isTyping}
                  placeholder={
                    weatherFlow?.step === 'city'
                      ? 'Digite sua cidade...'
                      : weatherFlow?.step === 'bairro'
                        ? 'Digite o bairro ou "pular"...'
                        : 'Escreva sua duvida sobre sustentabilidade...'
                  }
                  className="flex-1 min-w-0 px-1 py-1.5 bg-transparent text-[15px] text-stone-800 placeholder:text-stone-400 outline-none disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => sendMessage()}
                  disabled={!inputText.trim() || isTyping || weatherLoading}
                  className="shrink-0 w-11 h-11 flex items-center justify-center bg-gradient-to-r from-eco-600 to-teal-600 text-white rounded-xl hover:from-eco-700 hover:to-teal-700 disabled:opacity-45 disabled:cursor-not-allowed transition-colors shadow-sm"
                  aria-label="Enviar mensagem"
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