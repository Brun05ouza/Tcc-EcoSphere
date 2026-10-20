/**
 * Pontos de coleta reais (São Paulo/SP).
 * Fontes:
 * - Prefeitura de SP — Ecopontos (entrega voluntária):
 *   https://prefeitura.sp.gov.br/web/subprefeituras/w/ecoponto-estação-de-entrega-voluntária-de-inservíveis
 * - Rede Green Eletron / lojas parceiras (pilhas e eletrônicos de pequeno porte)
 *
 * Horário típico dos Ecopontos municipais: seg–sáb 6h–22h; dom/feriados 6h–18h.
 */

const MAPS = (query) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

/** Recicláveis comuns (plástico, metal, vidro, papel) + volumosos/entulho nos Ecopontos */
const ECOPONTOS_RECICLAVEIS = [
  {
    name: 'Ecoponto Santa Cruz',
    address: 'Rua Santa Cruz, 1452 (baixo do Viaduto Santa Cruz) — Vila Mariana',
    city: 'São Paulo/SP',
    cep: '04122-000',
    accepts: ['Plástico', 'Metal', 'Vidro', 'Papel'],
    mapsUrl: MAPS('Ecoponto Santa Cruz Rua Santa Cruz 1452 São Paulo'),
    source: 'Prefeitura de São Paulo',
  },
  {
    name: 'Ecoponto Tereza Cristina',
    address: 'Rua Tereza Cristina, 10 (esquina com Av. do Estado) — Vila Monumento',
    city: 'São Paulo/SP',
    cep: '01553-000',
    accepts: ['Plástico', 'Metal', 'Vidro', 'Papel'],
    mapsUrl: MAPS('Ecoponto Tereza Cristina São Paulo'),
    source: 'Prefeitura de São Paulo',
  },
  {
    name: 'Ecoponto Comandante Taylor',
    address: 'Rua Comandante Taylor, 690 (baixo do Viaduto) — Ipiranga',
    city: 'São Paulo/SP',
    cep: '04218-000',
    accepts: ['Plástico', 'Metal', 'Vidro', 'Papel'],
    mapsUrl: MAPS('Ecoponto Comandante Taylor Ipiranga São Paulo'),
    source: 'Prefeitura de São Paulo',
  },
  {
    name: 'Ecoponto Parque Peruche',
    address: 'Av. Engenheiro Caetano Álvares, 3142 — Parque Peruche',
    city: 'São Paulo/SP',
    cep: '02535-008',
    accepts: ['Plástico', 'Metal', 'Vidro', 'Papel'],
    mapsUrl: MAPS('Ecoponto Parque Peruche São Paulo'),
    source: 'Prefeitura de São Paulo',
  },
  {
    name: 'Ecoponto Giovani Gronchi',
    address: 'Av. Giovani Gronchi, 3413 — Morumbi',
    city: 'São Paulo/SP',
    cep: '05651-002',
    accepts: ['Plástico', 'Metal', 'Vidro', 'Papel'],
    mapsUrl: MAPS('Ecoponto Giovani Gronchi Morumbi São Paulo'),
    source: 'Prefeitura de São Paulo',
  },
  {
    name: 'Ecoponto Jabaquara',
    address: 'Rua Jupatis, 140 — Vila Mira',
    city: 'São Paulo/SP',
    cep: '04377-200',
    accepts: ['Plástico', 'Metal', 'Vidro', 'Papel'],
    mapsUrl: MAPS('Ecoponto Jabaquara Rua Jupatis São Paulo'),
    source: 'Prefeitura de São Paulo',
  },
];

/** Pilhas, baterias e eletrônicos de pequeno porte */
const PONTOS_ELETRONICOS = [
  {
    name: 'Green Eletron — buscador de pontos',
    address: 'Rede nacional de coleta de eletrônicos e pilhas (encontre o mais próximo)',
    city: 'Brasil',
    cep: null,
    accepts: ['Eletrônico'],
    mapsUrl: 'https://greeneletron.org.br/pontos-de-coleta/',
    source: 'Green Eletron',
  },
  {
    name: 'Atacadão Ipiranga (Recicla Pilhas)',
    address: 'Rua do Manifesto, 931 — Ipiranga',
    city: 'São Paulo/SP',
    cep: null,
    accepts: ['Eletrônico'],
    mapsUrl: MAPS('Atacadão Rua do Manifesto 931 Ipiranga São Paulo'),
    source: 'Ambipar / Recicla Pilhas',
  },
  {
    name: 'Assaí Mooca (Recicla Pilhas)',
    address: 'Rua Javari, 403 — Mooca',
    city: 'São Paulo/SP',
    cep: null,
    accepts: ['Eletrônico'],
    mapsUrl: MAPS('Assaí Rua Javari 403 Mooca São Paulo'),
    source: 'Ambipar / Recicla Pilhas',
  },
  {
    name: 'Ecoponto Santa Cruz (apoio a entrega voluntária)',
    address: 'Rua Santa Cruz, 1452 — Vila Mariana',
    city: 'São Paulo/SP',
    cep: '04122-000',
    accepts: ['Eletrônico'],
    mapsUrl: MAPS('Ecoponto Santa Cruz Vila Mariana São Paulo'),
    source: 'Prefeitura de São Paulo',
  },
];

/** Orgânicos: compostagem / coleta municipal (orientação + locais públicos) */
const PONTOS_ORGANICOS = [
  {
    name: 'Composta São Paulo / Prefeitura',
    address: 'Programa municipal de compostagem e orientação de orgânicos',
    city: 'São Paulo/SP',
    cep: null,
    accepts: ['Orgânico'],
    mapsUrl: 'https://www.prefeitura.sp.gov.br/',
    source: 'Prefeitura de São Paulo',
  },
  {
    name: 'CEAGESP — compostagem (referência pública)',
    address: 'Av. Dr. Gastão Vidigal, 1946 — Vila Leopoldina',
    city: 'São Paulo/SP',
    cep: '05314-000',
    accepts: ['Orgânico'],
    mapsUrl: MAPS('CEAGESP Av Dr Gastão Vidigal 1946 São Paulo'),
    source: 'CEAGESP',
  },
];

/**
 * @param {string|null} categoria CONAMA (ex.: 'Plástico')
 * @param {number} limit
 */
export function getCollectionPoints(categoria, limit = 4) {
  let pool = ECOPONTOS_RECICLAVEIS;
  if (categoria === 'Eletrônico') pool = PONTOS_ELETRONICOS;
  else if (categoria === 'Orgânico') pool = PONTOS_ORGANICOS;
  else if (categoria) {
    pool = ECOPONTOS_RECICLAVEIS.filter(
      (p) => !p.accepts?.length || p.accepts.includes(categoria)
    );
    if (!pool.length) pool = ECOPONTOS_RECICLAVEIS;
  }
  return pool.slice(0, limit);
}

export const COLLECTION_POINTS_DISCLAIMER =
  'Endereços oficiais da Prefeitura de São Paulo e redes parceiras. Confirme horários e materiais aceitos no local antes de ir.';
