import { emissionFactors, carbonStockFactors } from '../data/carbonFactors';

const isPositiveNumber = (value) => Number.isFinite(Number(value)) && Number(value) > 0;
const hasRealNumber = (value) => value !== null && value !== undefined && Number.isFinite(Number(value));
const hasValue = (value) => value !== null && value !== undefined && String(value).trim() !== '';

export function findEmissionFactor({ categoriaCalculo, item, anoReferencia } = {}) {
  const candidates = emissionFactors.filter((factor) => (
    factor.categoriaCalculo === categoriaCalculo
    && (!item || factor.item === item)
  ));

  if (anoReferencia) {
    const yearMatch = candidates.find((factor) => String(factor.anoReferencia) === String(anoReferencia));
    if (yearMatch) return yearMatch;
  }

  return candidates[0] || null;
}

export function findCarbonStockFactor({ bioma, usoAnterior, usoAtual } = {}) {
  return carbonStockFactors.find((factor) => (
    factor.bioma === bioma
    && factor.usoAnterior === usoAnterior
    && factor.usoAtual === usoAtual
  )) || null;
}

export function calculateDirectEmission({ quantidade, fator } = {}) {
  if (!isPositiveNumber(quantidade) || !hasRealNumber(fator)) {
    return {
      status: 'indisponivel',
      reason: !hasRealNumber(fator)
        ? 'Fator metodológico real ainda não cadastrado na base.'
        : 'Quantidade inválida para cálculo.',
      totalTCO2e: null
    };
  }

  return {
    status: 'calculado',
    totalTCO2e: Number(quantidade) * Number(fator)
  };
}

export function calculateReforestationStockChange({
  areaHa,
  periodoAnos,
  estoqueInicialTC_ha,
  estoqueFinalTC_ha
} = {}) {
  if (
    !isPositiveNumber(areaHa)
    || !isPositiveNumber(periodoAnos)
    || !hasRealNumber(estoqueInicialTC_ha)
    || !hasRealNumber(estoqueFinalTC_ha)
  ) {
    return {
      status: 'indisponivel',
      reason: (!hasRealNumber(estoqueInicialTC_ha) || !hasRealNumber(estoqueFinalTC_ha))
        ? 'Estoques de carbono reais ainda não cadastrados na base.'
        : 'Dados de área ou período ausentes.',
      totalTCO2e: null,
      annualTCO2e: null
    };
  }

  const deltaTC_ha = Number(estoqueFinalTC_ha) - Number(estoqueInicialTC_ha);
  const totalTCO2e = deltaTC_ha * (44 / 12) * Number(areaHa);
  const annualTCO2e = totalTCO2e / Number(periodoAnos);

  return {
    status: 'calculado',
    deltaTC_ha,
    totalTCO2e,
    annualTCO2e
  };
}

export function getAutomaticMethodology({ tipoAnalise } = {}) {
  const methods = {
    energia_eletrica: {
      metodologia: 'Inventário corporativo simplificado',
      fonte: 'MCTI — SIN',
      tipoCalculo: 'Fator direto',
      nivelIncerteza: 'baixa',
      limitacao: 'Depende do fator anual real do Sistema Interligado Nacional cadastrado na base.'
    },
    combustivel: {
      metodologia: 'Inventário corporativo simplificado',
      fonte: 'GHG Protocol Brasil',
      tipoCalculo: 'Fator direto',
      nivelIncerteza: 'baixa/média',
      limitacao: 'Depende do fator real por combustível cadastrado a partir de fonte metodológica nacional.'
    },
    reflorestamento: {
      metodologia: 'IPCC Tier 1 — Stock Difference Method',
      fonte: 'IPCC 2006 Guidelines, Vol. 4, Cap. 4',
      tipoCalculo: 'Mudança de estoque',
      nivelIncerteza: 'alta',
      limitacao: 'Pré-diagnóstico por estoque de carbono; requer dados técnicos, área, período e validação independente.'
    }
  };

  return methods[tipoAnalise] || null;
}

function buildCompletenessCriteria({ formData = {}, evidences = {}, calculationResult, methodology, factorMatch }) {
  const isReforestation = formData.tipoAnalise === 'reflorestamento';
  const quantityFilled = isReforestation ? isPositiveNumber(formData.areaHa) : isPositiveNumber(formData.quantidade);
  const periodFilled = isReforestation ? isPositiveNumber(formData.periodoAnos) : hasValue(formData.periodo);
  const factorFound = !!factorMatch && (
    formData.tipoAnalise === 'reflorestamento'
      ? hasRealNumber(factorMatch.estoqueInicialTC_ha) && hasRealNumber(factorMatch.estoqueFinalTC_ha)
      : hasRealNumber(factorMatch.fator)
  );

  const required = [
    ['finalidade', 'Finalidade informada', hasValue(formData.finalidade)],
    ['tipoAnalise', 'Tipo de análise definido', hasValue(formData.tipoAnalise)],
    ['nome', 'Nome do projeto/análise informado', hasValue(formData.nome)],
    ['quantidadeArea', isReforestation ? 'Área informada' : 'Quantidade informada', quantityFilled],
    ['periodo', 'Período informado', periodFilled],
    ['metodologia', 'Metodologia automática definida', !!methodology],
    ['fonte', 'Fonte metodológica identificada', !!methodology?.fonte],
    ['fatorEstoque', 'Fator ou estoque encontrado na base com valor real', factorFound]
  ];

  const strong = [
    ['bioma', 'Bioma informado', !isReforestation || hasValue(formData.bioma)],
    ['usoAnterior', 'Uso anterior informado', !isReforestation || hasValue(formData.usoAnterior)],
    ['usoAtual', 'Uso atual/proposto informado', !isReforestation || hasValue(formData.usoAtual)],
    ['localizacao', 'Localização/coordenadas anexadas', !!evidences.localizacao],
    ['evidenciaVisual', 'Evidência visual anexada', !!evidences.fotos],
    ['documentoTecnico', 'Documento técnico anexado', !!evidences.documentoTecnico]
  ];

  const complementary = [
    ['licenca', 'Licença/autorização anexada', !!evidences.licenca],
    ['imagemSatelite', 'Imagem de satélite anexada', !!evidences.imagemSatelite],
    ['medicaoCampo', 'Medição de campo anexada', !!evidences.medicaoCampo],
    ['relatorioAmbiental', 'Relatório ambiental anexado', !!evidences.relatorioAmbiental],
    ['observacaoTecnica', 'Observação técnica informada', hasValue(formData.observacao)]
  ];

  return { required, strong, complementary };
}

function summarizeGroup(criteria, weight) {
  const attended = criteria.filter(([, , ok]) => ok).map(([, label]) => label);
  const pending = criteria.filter(([, , ok]) => !ok).map(([, label]) => label);
  const percentage = criteria.length ? attended.length / criteria.length : 0;

  return {
    weight,
    attended,
    pending,
    points: percentage * weight,
    total: criteria.length
  };
}

function getCompletenessLevel(percentage) {
  if (percentage >= 90) return 'alto';
  if (percentage >= 70) return 'bom';
  if (percentage >= 40) return 'intermediário';
  return 'baixo';
}

export function calculateMethodologicalCompleteness({
  formData = {},
  evidences = {},
  calculationResult = null
} = {}) {
  const methodology = getAutomaticMethodology({ tipoAnalise: formData.tipoAnalise });
  const factorMatch = formData.tipoAnalise === 'reflorestamento'
    ? findCarbonStockFactor(formData)
    : findEmissionFactor({
      categoriaCalculo: formData.tipoAnalise,
      item: formData.item,
      anoReferencia: formData.anoReferencia
    });

  const criteria = buildCompletenessCriteria({ formData, evidences, calculationResult, methodology, factorMatch });
  const groups = {
    required: summarizeGroup(criteria.required, 60),
    strong: summarizeGroup(criteria.strong, 30),
    complementary: summarizeGroup(criteria.complementary, 10)
  };

  const percentage = Math.round(groups.required.points + groups.strong.points + groups.complementary.points);
  const attended = [...groups.required.attended, ...groups.strong.attended, ...groups.complementary.attended];
  const pending = [...groups.required.pending, ...groups.strong.pending, ...groups.complementary.pending];

  return {
    percentage,
    level: getCompletenessLevel(percentage),
    attended,
    pending,
    groups
  };
}

export function runCarbonDiagnosis({ formData = {}, evidences = {} } = {}) {
  const tipoAnalise = formData.tipoAnalise;
  const methodology = getAutomaticMethodology({ tipoAnalise });

  let factorMatch = null;
  let calculation = {
    status: 'indisponivel',
    reason: 'Tipo de análise ou metodologia não definida.',
    totalTCO2e: null
  };

  if (tipoAnalise === 'energia_eletrica' || tipoAnalise === 'combustivel') {
    factorMatch = findEmissionFactor({
      categoriaCalculo: tipoAnalise,
      item: formData.item,
      anoReferencia: formData.anoReferencia
    });
    calculation = calculateDirectEmission({
      quantidade: formData.quantidade,
      fator: factorMatch?.fator
    });
  }

  if (tipoAnalise === 'reflorestamento') {
    factorMatch = findCarbonStockFactor({
      bioma: formData.bioma,
      usoAnterior: formData.usoAnterior,
      usoAtual: formData.usoAtual
    });
    calculation = calculateReforestationStockChange({
      areaHa: formData.areaHa,
      periodoAnos: formData.periodoAnos || factorMatch?.periodoPadraoAnos,
      estoqueInicialTC_ha: factorMatch?.estoqueInicialTC_ha,
      estoqueFinalTC_ha: factorMatch?.estoqueFinalTC_ha
    });
  }

  const completeness = calculateMethodologicalCompleteness({ formData, evidences, calculationResult: calculation });

  return {
    methodology,
    factorMatch,
    calculation,
    completeness,
    disclaimer: 'Resultado preliminar. Não representa crédito certificado e não substitui auditoria externa.'
  };
}
