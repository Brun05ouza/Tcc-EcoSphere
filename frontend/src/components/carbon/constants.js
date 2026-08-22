export const INITIAL_FORM_DATA = {
  nome: '',
  tipo: '',
  status: '',
  responsavelTecnico: '',
  pais: 'Brasil',
  cep: '',
  estado: '',
  cidade: '',
  areaHa: '',
  latitude: '',
  longitude: '',
  dataInicio: '',
  dataTermino: '',
  periodoMonitoramento: '',
  descricaoObjetivo: '',
  resultadoEsperado: '',
  cenarioAtual: '',
  intervencaoProposta: '',
  potencialCarbono: '',
  observacoesInternas: '',
};

export const PROJECT_TYPES = [
  'Reflorestamento',
  'Preservação florestal',
  'Recuperação de área degradada',
  'Energia renovável',
  'Agricultura regenerativa',
  'Captura de metano',
  'Eficiência energética',
  'Outro',
];

export const PROJECT_STATUS = [
  'Planejado',
  'Em implantação',
  'Em monitoramento',
  'Concluído',
  'Pausado',
];

export const MONITORING_PERIODS = [
  'Mensal',
  'Trimestral',
  'Semestral',
  'Anual',
  'Personalizado',
];

export const CURRENT_SCENARIOS = [
  'Área degradada',
  'Área preservada',
  'Área agrícola',
  'Área urbana',
  'Pastagem',
  'Mata nativa',
  'Outro',
];

export const PROPOSED_INTERVENTIONS = [
  'Plantio de árvores',
  'Conservação',
  'Mudança de manejo',
  'Substituição energética',
  'Captura de gás',
  'Redução de consumo',
  'Outro',
];

export const CARBON_POTENTIAL = [
  'Baixo',
  'Médio',
  'Alto',
  'A definir',
];

export const NEXT_STEPS = [
  { id: 'cadastro', label: 'Cadastro inicial', active: true },
  { id: 'calculo', label: 'Cálculo de CO₂e', active: false },
  { id: 'evidencias', label: 'Upload de evidências', active: false },
  { id: 'relatorio', label: 'Relatório de confiabilidade', active: false },
  { id: 'auditoria', label: 'Auditoria externa', active: false },
];

export const BRAZILIAN_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];
