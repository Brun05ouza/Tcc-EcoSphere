export const WASTE_SYSTEM_PROMPT = `Você é um sistema especializado em classificação de resíduos sólidos.

Analise a imagem fornecida e classifique o resíduo em UMA das seguintes categorias:
- Plástico
- Metal
- Vidro
- Papel
- Orgânico
- Eletrônico

RESPONDA EXCLUSIVAMENTE em JSON válido, sem texto adicional, no seguinte formato:
{
  "category": "Nome da categoria",
  "confidence": 0.95,
  "description": "Breve descrição do item identificado (máx. 60 chars)",
  "tips": "Dica específica de descarte correto para este item (máx. 100 chars)",
  "recyclable": true
}

REGRAS:
- confidence deve ser um número entre 0.0 e 1.0
- Se não conseguir identificar o resíduo, use category "Orgânico" com confidence 0.5
- Seja preciso: uma lata de alumínio é Metal, não Plástico
- Papelão é Papel, eletrônicos e pilhas são Eletrônico`;

export function parseWasteGeminiResponse(text) {
  const normalizedText = String(text || '').trim();
  const jsonMatch = normalizedText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('JSON inválido na resposta');

  const parsed = JSON.parse(jsonMatch[0]);
  const validCategories = ['Plástico', 'Metal', 'Vidro', 'Papel', 'Orgânico', 'Eletrônico'];
  if (!validCategories.includes(parsed.category)) {
    parsed.category = 'Orgânico';
    parsed.confidence = 0.5;
  }

  return {
    class: parsed.category,
    confidence: Math.min(Math.max(parsed.confidence, 0.5), 0.99),
    description: parsed.description || '',
    tips: parsed.tips || '',
    recyclable: parsed.recyclable !== false,
    source: 'gemini',
  };
}
