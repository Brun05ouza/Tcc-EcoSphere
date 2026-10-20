const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'openai/gpt-4o-mini';

export const ECOBOT_SYSTEM_PROMPT = `Você é o EcoBot, assistente do EcoSphere (plataforma de sustentabilidade).

ESTILO:
- Respostas curtas e claras em português brasileiro (2–6 frases ou lista curta)
- Tom amigável, sem enrolação
- Use • para listas curtas

ATALHOS DO PROJETO (quando o usuário pedir navegação ou função, diga o caminho e confirme a ação):
- Classificar resíduos com IA → /classificar-residuos
- Gamificação / EcoPoints / missões / badges → /gamificacao
- Recompensas → /recompensas
- Monitoramento ambiental / clima → /monitoramento
- Educação ambiental → /educacao
- Dashboard → /dashboard
- Perfil → /perfil

TEMAS QUE VOCÊ COBRE:
- Reciclagem e separação (plástico, papel, vidro, metal, orgânico, eletrônico)
- Economia de água e energia
- Consumo consciente e redução de plástico
- Compostagem
- EcoPoints e missões da plataforma
- Clima e monitoramento ambiental da própria plataforma EcoSphere

CLIMA / TEMPERATURA / MONITORAMENTO:
- O EcoSphere TEM monitoramento ambiental em /monitoramento
- NUNCA diga que não consegue falar de clima ou temperatura
- Se perguntarem temperatura/clima/tempo/qualidade do ar, diga que vai consultar o monitoramento e peça a cidade (e depois o bairro). Respostas curtas.
- Não invente números de temperatura; o app consulta os dados depois que o usuário informar o local

REGRAS:
- Se pedirem para ir a uma tela, responda em 1 frase e cite o atalho (ex.: "Vou te levar para /gamificacao")
- Se a pergunta não for de sustentabilidade/plataforma/clima do EcoSphere, redirecione gentilmente
- Não invente dados científicos; se não souber, diga
- Não mencione OpenRouter, Gemini nem modelos`;

export function isOpenRouterConfigured() {
  const key = process.env.OPENROUTER_API_KEY;
  return Boolean(key && key.trim() && !key.includes('sua_chave'));
}

/**
 * @param {Array<{role: 'user'|'assistant'|'system', content: string}>} messages
 * @returns {Promise<string|null>}
 */
export async function askOpenRouter(messages) {
  if (!isOpenRouterConfigured()) return null;

  const model = process.env.OPENROUTER_MODEL || DEFAULT_MODEL;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45000);

  try {
    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.FRONTEND_ORIGIN || 'http://localhost:3000',
        'X-Title': 'EcoSphere EcoBot',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.5,
        max_tokens: 450,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      console.error('[OpenRouter]', response.status, errText.slice(0, 300));
      return null;
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content;
    return typeof text === 'string' && text.trim() ? text.trim() : null;
  } catch (err) {
    if (err?.name === 'AbortError') {
      console.error('[OpenRouter] timeout');
    } else {
      console.error('[OpenRouter]', err?.message || err);
    }
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/** Monta histórico curto para o modelo. */
export function buildChatMessages(userMessage, history = []) {
  const recent = (Array.isArray(history) ? history : [])
    .filter((m) => m && m.text && (m.sender === 'user' || m.sender === 'bot'))
    .slice(-8)
    .map((m) => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: String(m.text),
    }));

  return [
    { role: 'system', content: ECOBOT_SYSTEM_PROMPT },
    ...recent,
    { role: 'user', content: String(userMessage || '').trim() },
  ];
}
