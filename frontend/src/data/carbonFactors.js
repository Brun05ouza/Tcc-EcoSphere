// Base metodológica inicial do EcoSphere.
// ─────────────────────────────────────────────────────────────────
// ATENÇÃO — STATUS DOS FATORES:
//
// • energia_sin_mcti_2024  → valor real inserido (MCTI/SIRENE 2024)
//                            Verificar anualmente em:
//                            gov.br/mcti → SIRENE → Fatores de Emissão
//
// • gasolina / diesel      → valores estimados com base no GHG Protocol Brasil.
//                            Confirmar na planilha oficial do Programa Brasileiro
//                            GHG Protocol (fgv.br/ces/ghg) antes de uso oficial.
//
// • etanol                 → CO₂ biogênico excluído do Escopo 1 (GHG Protocol).
//                            Apenas fração fóssil (N₂O + CH₄ convertidos).
//                            Tratar separado de gasolina/diesel na interface.
//
// • reflorestamento        → estoques IPCC aproximados (Tier 1 / Tabelas 4.7 e 4.8).
//                            Substituir por valores exatos das tabelas antes de
//                            qualquer uso em relatório oficial.
//
// Fórmula para restauração:
// tCO2e_total = (estoque_final_tC_ha - estoque_inicial_tC_ha) × (44/12) × area_ha
// ─────────────────────────────────────────────────────────────────

export const emissionFactors = [
  {
    id: 'energia_sin_mcti_2024',
    categoriaCalculo: 'energia_eletrica',
    item: 'energia_sin',
    unidadeEntrada: 'kWh',
    unidadeSaida: 'tCO2e',
    fator: 0.0000545,
    fonte: 'MCTI/SIRENE — Fator médio anual do Sistema Interligado Nacional',
    urlFonte: 'https://www.gov.br/mcti/pt-br/acompanhe-o-mcti/sirene/dados-e-ferramentas/fatores-de-emissao',
    metodologia: 'Inventário corporativo simplificado — Escopo 2 (location-based)',
    anoReferencia: '2024',
    nivelIncerteza: 'media',
    precisaoFator: 'verificado',
    status: 'ativo',
    observacao: 'Fator válido para 2024. Atualizar anualmente via SIRENE. '
      + 'Em anos de crise hídrica (acionamento de termelétricas) o valor sobe significativamente.'
  },
  {
    id: 'combustivel_gasolina_c',
    categoriaCalculo: 'combustivel',
    item: 'gasolina',
    unidadeEntrada: 'litro',
    unidadeSaida: 'tCO2e',
    fator: 0.002212,
    fonte: 'GHG Protocol Brasil — Programa Brasileiro GHG Protocol (FGV/WRI)',
    urlFonte: 'https://www.wribrasil.org.br/projetos/ghg-protocol',
    metodologia: 'Inventário corporativo simplificado — Escopo 1',
    anoReferencia: '2023',
    nivelIncerteza: 'baixa',
    precisaoFator: 'estimado',
    status: 'ativo',
    observacao: 'Fator para Gasolina C (com etanol anidro na mistura). '
      + 'CO₂ biogênico do etanol anidro excluído conforme GHG Protocol. '
      + 'Confirmar valor exato na planilha do Programa Brasileiro GHG Protocol.'
  },
  {
    id: 'combustivel_diesel_s10',
    categoriaCalculo: 'combustivel',
    item: 'diesel',
    unidadeEntrada: 'litro',
    unidadeSaida: 'tCO2e',
    fator: 0.002603,
    fonte: 'GHG Protocol Brasil — Programa Brasileiro GHG Protocol (FGV/WRI)',
    urlFonte: 'https://www.wribrasil.org.br/projetos/ghg-protocol',
    metodologia: 'Inventário corporativo simplificado — Escopo 1',
    anoReferencia: '2023',
    nivelIncerteza: 'baixa',
    precisaoFator: 'estimado',
    status: 'ativo',
    observacao: 'Fator para Diesel S10. Diesel S500 tem fator ligeiramente diferente. '
      + 'Confirmar valor exato na planilha do Programa Brasileiro GHG Protocol.'
  },
  {
    id: 'combustivel_etanol_hidratado',
    categoriaCalculo: 'combustivel',
    item: 'etanol',
    unidadeEntrada: 'litro',
    unidadeSaida: 'tCO2e',
    fator: 0.000015,
    fonte: 'GHG Protocol Brasil — Programa Brasileiro GHG Protocol (FGV/WRI)',
    urlFonte: 'https://www.wribrasil.org.br/projetos/ghg-protocol',
    metodologia: 'Inventário corporativo simplificado — Escopo 1',
    anoReferencia: '2023',
    nivelIncerteza: 'baixa',
    precisaoFator: 'estimado',
    tipoCarbono: 'biogenic',
    status: 'ativo',
    observacao: 'ATENÇÃO: etanol hidratado tem emissões majoritariamente biogênicas. '
      + 'O CO₂ da combustão não entra no Escopo 1 do GHG Protocol. '
      + 'Este fator representa apenas CH4 e N2O da combustão (fração fóssil mínima). '
      + 'Não comparar diretamente com gasolina ou diesel sem explicar o escopo ao usuário.'
  }
];

export const carbonStockFactors = [
  {
    id: 'mata_atlantica_area_degradada_restauracao',
    categoriaCalculo: 'reflorestamento',
    bioma: 'mata_atlantica',
    categoriaIpcc: 'tropical moist forest',
    usoAnterior: 'area_degradada',
    usoAtual: 'floresta_em_restauracao',
    estoqueInicialTC_ha: 40,
    estoqueFinalTC_ha: 105,
    periodoPadraoAnos: 20,
    fonte: 'IPCC 2006 Guidelines, Volume 4, Chapter 4, Tables 4.7 e 4.8',
    urlFonte: 'https://www.ipcc-nggip.iges.or.jp/public/2006gl/vol4.html',
    metodologia: 'IPCC Tier 1 — Stock Difference Method',
    nivelIncerteza: 'alta',
    precisaoFator: 'estimado',
    status: 'ativo',
    observacao: 'ATENÇÃO: estoques são aproximações Tier 1 para Mata Atlântica (tropical moist forest). '
      + 'O delta real depende da subcategoria florestal, solo e região. '
      + 'Incerteza alta — resultado só serve como estimativa de ordem de grandeza. '
      + 'Substituir por valores exatos das Tabelas 4.7/4.8 antes de qualquer relatório oficial.'
  },
  {
    id: 'cerrado_area_degradada_restauracao',
    categoriaCalculo: 'reflorestamento',
    bioma: 'cerrado',
    categoriaIpcc: 'tropical dry forest / woodland',
    usoAnterior: 'area_degradada',
    usoAtual: 'vegetacao_nativa_em_recuperacao',
    estoqueInicialTC_ha: 18,
    estoqueFinalTC_ha: 42,
    periodoPadraoAnos: 20,
    fonte: 'IPCC 2006 Guidelines, Volume 4, Chapter 4, Tables 4.7 e 4.8',
    urlFonte: 'https://www.ipcc-nggip.iges.or.jp/public/2006gl/vol4.html',
    metodologia: 'IPCC Tier 1 — Stock Difference Method',
    nivelIncerteza: 'alta',
    precisaoFator: 'estimado',
    status: 'ativo',
    observacao: 'ATENÇÃO: estoques são aproximações Tier 1 para Cerrado (tropical dry/woodland). '
      + 'Cerrado tem grande variação de fitofisionomia (campo, cerrado sensu stricto, cerradão). '
      + 'Incerteza alta — substituir por valores das Tabelas 4.7/4.8 antes de uso oficial.'
  }
];
