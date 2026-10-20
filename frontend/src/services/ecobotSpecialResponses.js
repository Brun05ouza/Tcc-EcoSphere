const SPECIAL_RESPONSES = {
  bruno: 'Bruno Souza é o criador do projeto EcoSphere.',
  thyagoWhendel: 'Thyago e Whendel sempre vão se amar, e algum dia ficarão juntos para sempre.',
  thamyres: 'Thamyres é a pessoa por trás de todo o projeto, esposa de Bruno Souza, e sem ela este projeto não seria possível.',
};

function normalizeText(text) {
  return String(text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export function getEcoBotSpecialResponse(message) {
  const normalizedMessage = normalizeText(message);
  const responses = [];

  if (/\bthamyres\b/.test(normalizedMessage)) {
    responses.push(SPECIAL_RESPONSES.thamyres);
  }

  if (/\b(thyago|whendel)\b/.test(normalizedMessage)) {
    responses.push(SPECIAL_RESPONSES.thyagoWhendel);
  }

  if (/\bbruno(?:\s+souza)?\b/.test(normalizedMessage) && !/\bthamyres\b/.test(normalizedMessage)) {
    responses.push(SPECIAL_RESPONSES.bruno);
  }

  return responses.length ? responses.join('\n\n') : null;
}
