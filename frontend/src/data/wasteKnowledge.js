// Tabela de conhecimento do classificador local.
// Cada classe do modelo (id) aponta para a categoria CONAMA nº 275/2001,
// a cor da lixeira e a orientação de descarte mostrada ao usuário.
//
// IMPORTANTE:
// 1) Os ids devem ser IGUAIS aos nomes das classes digitadas no Teachable Machine.
// 2) Revise e valide as orientações antes de publicar: elas são a resposta
//    que o usuário lê. Ajuste ao que a coleta da sua cidade aceita.

export const CATEGORIAS = {
  'Plástico': { cor: 'Vermelha' },
  'Metal': { cor: 'Amarela' },
  'Vidro': { cor: 'Verde' },
  'Papel': { cor: 'Azul' },
  'Orgânico': { cor: 'Marrom' },
  'Eletrônico': { cor: 'Laranja' },
};

export const NO_OBJECT_ID = 'sem_objeto';

export const WASTE_CLASSES = [
  {
    id: 'garrafa_pet',
    nome: 'Garrafa PET',
    categoria: 'Plástico',
    reciclavel: true,
    dica: 'Esvazie, enxágue e amasse a garrafa. Descarte na lixeira vermelha (plástico).',
  },
  {
    id: 'embalagem_plastica',
    nome: 'Embalagem plástica',
    categoria: 'Plástico',
    reciclavel: true,
    dica: 'Retire os restos de comida e enxágue. Embalagens limpas vão na lixeira vermelha; as muito sujas ou de materiais misturados podem não ser aceitas pela coleta seletiva.',
  },
  {
    id: 'lata_aluminio',
    nome: 'Lata de alumínio',
    categoria: 'Metal',
    reciclavel: true,
    dica: 'Esvazie e enxágue; pode amassar para ocupar menos espaço. Descarte na lixeira amarela (metal).',
  },
  {
    id: 'garrafa_vidro',
    nome: 'Garrafa de vidro',
    categoria: 'Vidro',
    reciclavel: true,
    dica: 'Esvazie e enxágue. Descarte na lixeira verde (vidro). Se quebrar, embale os cacos em jornal ou caixa para proteger quem faz a coleta.',
  },
  {
    id: 'papel',
    nome: 'Papel',
    categoria: 'Papel',
    reciclavel: true,
    dica: 'Mantenha seco e sem gordura. Descarte na lixeira azul (papel). Papel engordurado ou molhado não é reciclável.',
  },
  {
    id: 'papelao',
    nome: 'Papelão',
    categoria: 'Papel',
    reciclavel: true,
    dica: 'Desmonte a caixa e mantenha-a seca e limpa. Descarte na lixeira azul (papel).',
  },
  {
    id: 'organico',
    nome: 'Casca de fruta ou resto de comida',
    categoria: 'Orgânico',
    reciclavel: false,
    dica: 'Descarte na lixeira marrom (orgânicos) ou faça compostagem. Não misture com materiais recicláveis.',
  },
  {
    id: 'pilha_bateria',
    nome: 'Pilha ou bateria',
    categoria: 'Eletrônico',
    reciclavel: false,
    dica: 'Não jogue no lixo comum, pois contém substâncias perigosas. Leve a um ponto de coleta específico, como comércios que recebem pilhas e baterias ou ecopontos.',
  },
  {
    id: 'eletronico',
    nome: 'Eletrônico (celular, cabo, fone)',
    categoria: 'Eletrônico',
    reciclavel: false,
    dica: 'Não descarte no lixo comum. Leve a um ponto de entrega de lixo eletrônico ou a uma loja do fabricante que receba o aparelho.',
  },
  {
    id: NO_OBJECT_ID,
    nome: 'Nenhum objeto',
    categoria: null,
    reciclavel: null,
    dica: 'Aponte a câmera para um resíduo.',
  },
];

export const OBJECT_CLASSES = WASTE_CLASSES.filter((c) => c.id !== NO_OBJECT_ID);

export function getWasteClass(id) {
  return WASTE_CLASSES.find((c) => c.id === id) || null;
}

export function getBinColor(categoria) {
  return CATEGORIAS[categoria] ? CATEGORIAS[categoria].cor : null;
}
