import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_MODEL } from './geminiConfig';
import { WASTE_SYSTEM_PROMPT, parseWasteGeminiResponse } from './geminiWasteShared.mjs';

const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

const isConfigured = () => API_KEY && API_KEY !== 'sua_chave_gemini_aqui';

let genAI = null;
const getClient = () => {
  if (!genAI && isConfigured()) {
    genAI = new GoogleGenerativeAI(API_KEY);
  }
  return genAI;
};

// ── Contexto do EcoBot ────────────────────────────────────────────────────────
const ECOBOT_SYSTEM_PROMPT = `Você é o EcoBot, o assistente virtual do EcoSphere — uma plataforma de sustentabilidade ambiental.

PERSONALIDADE:
- Amigável, motivador e especialista em sustentabilidade
- Usa linguagem clara e acessível, sem jargões desnecessários
- Celebra as ações sustentáveis do usuário com entusiasmo moderado
- Respostas concisas (máximo 200 palavras) mas completas

EXPERTISE:
- Reciclagem e separação de resíduos (plástico, papel, vidro, metal, orgânico, eletrônico)
- Economia de água e energia
- Redução da pegada de carbono
- Sustentabilidade urbana e consumo consciente
- Mudanças climáticas e seus impactos
- Compostagem e agricultura urbana
- Mobilidade sustentável

PLATAFORMA EcoSphere (mencione quando relevante):
- Classificador de resíduos com IA: /classificar-residuos
- Monitoramento ambiental: /monitoramento
- Gamificação e EcoPoints: /gamificacao
- Recompensas: /recompensas
- Educação ambiental: /educacao

REGRAS:
- Sempre responda em português brasileiro
- Se a pergunta não for sobre sustentabilidade/meio ambiente, redirecione gentilmente para o tema
- Não invente dados científicos; seja preciso ou diga que não tem certeza
- Nunca mencione outras plataformas concorrentes
- Formate com bullet points quando listar dicas (use •)`;

// ── Chat do EcoBot ─────────────────────────────────────────────────────────────
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const isRateLimitError = (err) =>
  err?.message?.includes('429') || err?.status === 429 || err?.message?.includes('quota');

export async function askEcoBot(userMessage, history = []) {
  if (!isConfigured()) return null;

  try {
    const client = getClient();
    const model = client.getGenerativeModel({
      model: GEMINI_MODEL,
      systemInstruction: ECOBOT_SYSTEM_PROMPT,
    });

    const geminiHistory = history
      .filter((m) => m.sender !== 'bot' || history.indexOf(m) > 0)
      .map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }],
      }));

    const chat = model.startChat({ history: geminiHistory });

    // Retry uma vez se rate limit
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const result = await chat.sendMessage(userMessage);
        return result.response.text();
      } catch (err) {
        if (isRateLimitError(err) && attempt === 0) {
          await sleep(12000); // aguarda 12s e tenta de novo
          continue;
        }
        throw err;
      }
    }
  } catch (err) {
    if (isRateLimitError(err)) {
      return 'Estou sobrecarregado no momento. Tente novamente em alguns segundos! 🌿';
    }
    console.error('[Gemini EcoBot] Erro:', err);
    return null;
  }
}

// Cache simples para evitar chamar a API com a mesma imagem duas vezes
const _classifyCache = new Map();

export async function classifyWasteWithGemini(imageBase64, mimeType = 'image/jpeg') {
  const cacheKey = imageBase64.slice(0, 100);
  if (_classifyCache.has(cacheKey)) return _classifyCache.get(cacheKey);
  if (!isConfigured()) {
    return null; // fallback para TensorFlow
  }

  try {
    const client = getClient();
    const model = client.getGenerativeModel({ model: GEMINI_MODEL });

    const result = await model.generateContent([
      WASTE_SYSTEM_PROMPT,
      {
        inlineData: {
          data: imageBase64,
          mimeType,
        },
      },
    ]);

    const output = parseWasteGeminiResponse(result.response.text());
    _classifyCache.set(cacheKey, output);
    return output;
  } catch (err) {
    if (!isRateLimitError(err)) {
      console.error('[Gemini Waste] Erro:', err);
    }
    return null; // fallback para TensorFlow/nome de arquivo
  }
}

export { isConfigured as isGeminiConfigured };
