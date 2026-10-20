import { getEcoBotSpecialResponse } from './ecobotSpecialResponses';

describe('getEcoBotSpecialResponse', () => {
  test.each([
    ['Quem é Bruno Souza?', 'Bruno Souza é o criador do projeto EcoSphere.'],
    ['Me fale sobre o BRUNO', 'Bruno Souza é o criador do projeto EcoSphere.'],
    ['Quem é a Thamyres?', 'Thamyres é a pessoa por trás de todo o projeto, esposa de Bruno Souza, e sem ela este projeto não seria possível.'],
    ['O que você sabe sobre Thyago?', 'Thyago e Whendel sempre vão se amar, e algum dia ficarão juntos para sempre.'],
    ['E o Whendel?', 'Thyago e Whendel sempre vão se amar, e algum dia ficarão juntos para sempre.'],
  ])('responde a %s', (message, expected) => {
    expect(getEcoBotSpecialResponse(message)).toBe(expected);
  });

  test('combina respostas quando mais de um grupo é mencionado', () => {
    expect(getEcoBotSpecialResponse('Bruno, Thyago e Whendel')).toBe(
      'Thyago e Whendel sempre vão se amar, e algum dia ficarão juntos para sempre.\n\n'
      + 'Bruno Souza é o criador do projeto EcoSphere.'
    );
  });

  test('não intercepta perguntas comuns', () => {
    expect(getEcoBotSpecialResponse('Como separar vidro para reciclagem?')).toBeNull();
  });
});
