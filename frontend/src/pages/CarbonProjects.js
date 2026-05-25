import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Check,
  ChevronLeft,
  ChevronRight,
  Clipboard,
  ClipboardCheck,
  FileText,
  Leaf,
  ShieldCheck
} from 'lucide-react';
import { getAutomaticMethodology, runCarbonDiagnosis } from '../utils/carbonEngine';

const disclaimer = 'Este módulo não emite créditos de carbono oficiais. Os resultados são estimativas preliminares e não substituem auditoria externa, certificadora ou validação técnica independente.';

const steps = ['Finalidade', 'Tipo de análise', 'Dados mínimos', 'Metodologia', 'Evidências', 'Resultado'];

const purposes = [
  'ESG voluntário',
  'Diagnóstico interno',
  'Preparação para auditoria futura'
];

const analysisTypes = [
  {
    value: 'energia_eletrica',
    title: 'Energia elétrica',
    description: 'Estimativa de emissões a partir do consumo em kWh.'
  },
  {
    value: 'combustivel',
    title: 'Combustível',
    description: 'Estimativa de emissões a partir de litros consumidos.'
  },
  {
    value: 'reflorestamento',
    title: 'Reflorestamento/restauração',
    description: 'Estimativa preliminar por mudança de estoque de carbono.'
  }
];

const evidenceOptions = [
  ['fotos', 'Fotos da área'],
  ['localizacao', 'Coordenadas/localização'],
  ['documentoTecnico', 'Documento técnico'],
  ['relatorioAmbiental', 'Relatório ambiental'],
  ['licenca', 'Licença/autorização'],
  ['imagemSatelite', 'Imagem de satélite'],
  ['medicaoCampo', 'Medição de campo']
];

const initialFormData = {
  finalidade: '',
  tipoAnalise: '',
  nome: '',
  periodo: '',
  quantidade: '',
  anoReferencia: '2024',
  item: '',
  bioma: '',
  areaHa: '',
  usoAnterior: '',
  usoAtual: '',
  periodoAnos: '',
  observacao: '',
  preliminaryAcknowledged: false
};

const formatLabel = (value) => ({
  energia_eletrica: 'Energia elétrica',
  combustivel: 'Combustível',
  reflorestamento: 'Reflorestamento/restauração',
  energia_sin: 'Energia SIN',
  gasolina: 'Gasolina',
  diesel: 'Diesel',
  etanol: 'Etanol',
  mata_atlantica: 'Mata Atlântica',
  cerrado: 'Cerrado',
  area_degradada: 'Área degradada',
  pastagem_degradada: 'Pastagem degradada',
  solo_exposto: 'Solo exposto',
  floresta_em_restauracao: 'Floresta em restauração',
  vegetacao_nativa_em_recuperacao: 'Vegetação nativa em recuperação'
}[value] || value || 'Não informado');

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-sm font-semibold text-stone-700 mb-2">{label}</span>
      {children}
    </label>
  );
}

function SelectableCard({ selected, title, description, onClick, icon: Icon = Leaf }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left card-hover p-5 transition-all ${
        selected ? 'border-eco-300 bg-eco-50 shadow-soft-lg' : ''
      }`}
    >
      <div className="flex items-start gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
          selected ? 'bg-eco-600 text-white' : 'bg-eco-50 text-eco-600'
        }`}>
          <Icon size={20} />
        </div>
        <div>
          <h3 className="font-bold text-stone-800 mb-1">{title}</h3>
          {description && <p className="text-sm text-stone-500 leading-relaxed">{description}</p>}
        </div>
      </div>
    </button>
  );
}

function buildReport({ formData, evidences, result }) {
  const evidenceLabels = evidenceOptions
    .filter(([key]) => evidences[key])
    .map(([, label]) => label);
  const calculation = result?.calculation;
  const methodology = result?.methodology;

  return `# Relatório preliminar EcoSphere — Projetos CO₂e

## Identificação
Projeto/análise: ${formData.nome || 'Não informado'}
Finalidade: ${formData.finalidade || 'Não informada'}
Tipo de análise: ${formatLabel(formData.tipoAnalise)}
Período analisado: ${formData.periodo || formData.periodoAnos || 'Não informado'}

## Metodologia aplicada
Metodologia: ${methodology?.metodologia || 'Não definida'}
Fonte: ${methodology?.fonte || 'Não identificada'}
Tipo de cálculo: ${methodology?.tipoCalculo || 'Não definido'}
Nível de incerteza: ${methodology?.nivelIncerteza || 'Não definido'}

## Dados informados
${summarizeFormData(formData).join('\n')}

## Resultado
Status do cálculo: ${calculation?.status === 'calculado' ? 'disponível' : 'indisponível'}
Estimativa total: ${calculation?.totalTCO2e !== null && calculation?.totalTCO2e !== undefined ? `${calculation.totalTCO2e.toFixed(4)} tCO₂e` : 'não calculado'}
Estimativa anual: ${calculation?.annualTCO2e !== null && calculation?.annualTCO2e !== undefined ? `${calculation.annualTCO2e.toFixed(4)} tCO₂e/ano` : 'não aplicável'}

## Completude metodológica
Índice: ${result?.completeness?.percentage ?? 0}%
Nível: ${result?.completeness?.level || 'baixo'}
Critérios atendidos: ${(result?.completeness?.attended || []).join(', ') || 'Nenhum'}
Pendências: ${(result?.completeness?.pending || []).join(', ') || 'Nenhuma'}

## Evidências
${evidenceLabels.length ? evidenceLabels.join(', ') : 'Nenhuma evidência marcada'}

## Limitação de uso
Este relatório é uma estimativa preliminar do EcoSphere. Ele não representa
emissão oficial de crédito de carbono, não substitui auditoria externa, não
substitui certificadora e não deve ser usado como validação oficial de
compensação ambiental.`;
}

function summarizeFormData(formData) {
  const summary = [
    `Nome: ${formData.nome || 'Não informado'}`,
    `Observação técnica: ${formData.observacao || 'Não informada'}`
  ];

  if (formData.tipoAnalise === 'energia_eletrica') {
    summary.push(`Consumo: ${formData.quantidade || 'Não informado'} kWh`);
    summary.push(`Ano de referência: ${formData.anoReferencia || 'Não informado'}`);
  }

  if (formData.tipoAnalise === 'combustivel') {
    summary.push(`Combustível: ${formatLabel(formData.item)}`);
    summary.push(`Quantidade: ${formData.quantidade || 'Não informada'} litros`);
  }

  if (formData.tipoAnalise === 'reflorestamento') {
    summary.push(`Bioma: ${formatLabel(formData.bioma)}`);
    summary.push(`Área: ${formData.areaHa || 'Não informada'} ha`);
    summary.push(`Uso anterior: ${formatLabel(formData.usoAnterior)}`);
    summary.push(`Uso atual/proposto: ${formatLabel(formData.usoAtual)}`);
    summary.push(`Período: ${formData.periodoAnos || 'Não informado'} anos`);
  }

  return summary;
}

function CarbonProjects() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(initialFormData);
  const [evidences, setEvidences] = useState({});
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [copyFallbackReport, setCopyFallbackReport] = useState('');

  const methodology = useMemo(
    () => getAutomaticMethodology({ tipoAnalise: formData.tipoAnalise }),
    [formData.tipoAnalise]
  );

  const updateField = (field, value) => {
    setResult(null);
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const selectType = (tipoAnalise) => {
    setResult(null);
    setFormData((current) => ({
      ...current,
      tipoAnalise,
      item: tipoAnalise === 'energia_eletrica' ? 'energia_sin' : '',
      quantidade: '',
      areaHa: '',
      periodoAnos: '',
      bioma: '',
      usoAnterior: '',
      usoAtual: ''
    }));
  };

  const isStepValid = () => {
    if (currentStep === 0) return !!formData.finalidade;
    if (currentStep === 1) return !!formData.tipoAnalise;
    if (currentStep === 2) return isDataStepValid();
    if (currentStep === 3) return !!methodology && formData.preliminaryAcknowledged;
    return true;
  };

  const isDataStepValid = () => {
    if (!formData.nome) return false;
    if (formData.tipoAnalise === 'energia_eletrica') {
      return !!formData.periodo && Number(formData.quantidade) > 0 && !!formData.anoReferencia;
    }
    if (formData.tipoAnalise === 'combustivel') {
      return !!formData.periodo && !!formData.item && Number(formData.quantidade) > 0;
    }
    if (formData.tipoAnalise === 'reflorestamento') {
      return !!formData.bioma
        && Number(formData.areaHa) > 0
        && !!formData.usoAnterior
        && !!formData.usoAtual
        && Number(formData.periodoAnos) > 0;
    }
    return false;
  };

  const goNext = () => {
    if (!isStepValid()) return;
    setCurrentStep((step) => Math.min(step + 1, steps.length - 1));
  };

  const generateDiagnosis = () => {
    const diagnosis = runCarbonDiagnosis({ formData, evidences });
    setResult(diagnosis);
    setCopied(false);
    setCopyFallbackReport('');
    setCurrentStep(5);
  };

  const copyReport = async () => {
    const report = buildReport({ formData, evidences, result });
    setCopyFallbackReport('');

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(report);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
        return;
      }
    } catch {
      // Continua para o fallback abaixo quando o navegador negar permissao.
    }

    try {
      const textarea = document.createElement('textarea');
      textarea.value = report;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.top = '0';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();

      const copiedWithFallback = document.execCommand('copy');
      document.body.removeChild(textarea);

      if (copiedWithFallback) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
        return;
      }
    } catch {
      // Se ate o fallback for bloqueado, mostra o relatorio para copia manual.
    }

    setCopyFallbackReport(report);
    setCopied(false);
  };

  return (
    <div className="min-h-screen bg-surface-50 py-8 md:py-12">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-5">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-eco-500 to-teal-600 flex items-center justify-center shadow-lg shadow-eco-500/20">
                  <img src={require('../assets/icons/carbono.svg')} alt="" className="w-5 h-5 brightness-0 invert" />
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-stone-800 tracking-tight">Projetos CO₂e</h1>
              </div>
              <p className="text-stone-500 max-w-3xl">
                Pré-diagnóstico ambiental para estimativas preliminares de carbono, evidências e relatórios ESG voluntários.
              </p>
            </div>
            <div className="w-fit rounded-full border border-eco-100 bg-eco-50 px-4 py-2 text-sm font-semibold text-eco-700">
              Estimativa preliminar • Não certificável • Base para auditoria futura
            </div>
          </div>

          <div className="card p-4 border-amber-100 bg-amber-50/60">
            <div className="flex items-start gap-3">
              <AlertTriangle size={18} className="text-amber-600 mt-0.5 shrink-0" />
              <p className="text-sm text-stone-700 leading-relaxed">{disclaimer}</p>
            </div>
          </div>
        </motion.div>

        <div className="card p-4 sm:p-5 mb-6">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-sm font-semibold text-stone-600">
              Etapa {currentStep + 1} de {steps.length}
            </span>
            <span className="text-sm font-bold text-eco-600">{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
          </div>
          <div className="w-full bg-stone-200 rounded-full h-2.5 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-eco-500 to-teal-500 rounded-full"
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-6 gap-2">
            {steps.map((step, index) => (
              <div
                key={step}
                className={`text-xs font-semibold rounded-xl px-3 py-2 text-center ${
                  index === currentStep ? 'bg-eco-50 text-eco-700' : 'bg-stone-50 text-stone-500'
                }`}
              >
                {step}
              </div>
            ))}
          </div>
        </div>

        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card p-6 sm:p-8"
        >
          {currentStep === 0 && renderPurposeStep({ formData, updateField })}
          {currentStep === 1 && renderTypeStep({ formData, selectType })}
          {currentStep === 2 && renderDataStep({ formData, updateField })}
          {currentStep === 3 && renderMethodologyStep({ methodology, formData, updateField })}
          {currentStep === 4 && renderEvidenceStep({ evidences, setEvidences })}
          {currentStep === 5 && renderResultStep({ result, formData, evidences, copyReport, copied, copyFallbackReport, generateDiagnosis })}

          <div className="flex flex-col sm:flex-row justify-between gap-3 mt-8 pt-6 border-t border-stone-100">
            <button
              type="button"
              onClick={() => setCurrentStep((step) => Math.max(step - 1, 0))}
              disabled={currentStep === 0}
              className={`btn-secondary ${currentStep === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <ChevronLeft size={18} />
              Voltar
            </button>

            {currentStep < 4 && (
              <button
                type="button"
                onClick={goNext}
                disabled={!isStepValid()}
                className={`btn-primary ${!isStepValid() ? 'opacity-50 cursor-not-allowed hover:scale-100' : ''}`}
              >
                Continuar
                <ChevronRight size={18} />
              </button>
            )}

            {currentStep === 4 && (
              <button
                type="button"
                onClick={generateDiagnosis}
                className="btn-primary"
              >
                <ClipboardCheck size={18} />
                Gerar diagnóstico
              </button>
            )}

            {currentStep === 5 && (
              <button
                type="button"
                onClick={copyReport}
                disabled={!result}
                className={`btn-primary ${!result ? 'opacity-50 cursor-not-allowed hover:scale-100' : ''}`}
              >
                <Clipboard size={18} />
                {copied ? 'Relatório copiado!' : 'Copiar relatório'}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function renderPurposeStep({ formData, updateField }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-stone-800 mb-2">Finalidade</h2>
      <p className="text-stone-500 mb-6">
        A finalidade ajuda o EcoSphere a enquadrar o relatório, mas não transforma o resultado em certificação oficial.
      </p>
      <div className="grid md:grid-cols-3 gap-4">
        {purposes.map((purpose) => (
          <SelectableCard
            key={purpose}
            selected={formData.finalidade === purpose}
            title={purpose}
            description="Enquadramento do relatório preliminar."
            onClick={() => updateField('finalidade', purpose)}
            icon={FileText}
          />
        ))}
      </div>
    </div>
  );
}

function renderTypeStep({ formData, selectType }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-stone-800 mb-2">Tipo de análise</h2>
      <p className="text-stone-500 mb-6">Escolha o tipo de pré-diagnóstico. A metodologia será definida automaticamente.</p>
      <div className="grid md:grid-cols-3 gap-4">
        {analysisTypes.map((type) => (
          <SelectableCard
            key={type.value}
            selected={formData.tipoAnalise === type.value}
            title={type.title}
            description={type.description}
            onClick={() => selectType(type.value)}
            icon={Leaf}
          />
        ))}
      </div>
    </div>
  );
}

function renderDataStep({ formData, updateField }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-stone-800 mb-2">Dados mínimos</h2>
      <p className="text-stone-500 mb-6">Informe apenas os dados necessários para o enquadramento metodológico inicial.</p>

      <div className="grid md:grid-cols-2 gap-4">
        <Field label={formData.tipoAnalise === 'reflorestamento' ? 'Nome do projeto' : 'Nome do projeto/análise'}>
          <input className="input-base" value={formData.nome} onChange={(event) => updateField('nome', event.target.value)} />
        </Field>

        {formData.tipoAnalise !== 'reflorestamento' && (
          <Field label="Período analisado">
            <input className="input-base" value={formData.periodo} onChange={(event) => updateField('periodo', event.target.value)} placeholder="Ex.: Jan-Dez/2024" />
          </Field>
        )}

        {formData.tipoAnalise === 'energia_eletrica' && (
          <>
            <Field label="Consumo em kWh">
              <input type="number" min="0" className="input-base" value={formData.quantidade} onChange={(event) => updateField('quantidade', event.target.value)} />
            </Field>
            <Field label="Ano de referência do fator">
              <input className="input-base" value={formData.anoReferencia} onChange={(event) => updateField('anoReferencia', event.target.value)} />
            </Field>
          </>
        )}

        {formData.tipoAnalise === 'combustivel' && (
          <>
            <Field label="Tipo de combustível">
              <select className="input-base" value={formData.item} onChange={(event) => updateField('item', event.target.value)}>
                <option value="">Selecione</option>
                <option value="gasolina">Gasolina</option>
                <option value="diesel">Diesel</option>
                <option value="etanol">Etanol</option>
              </select>
            </Field>
            <Field label="Quantidade em litros">
              <input type="number" min="0" className="input-base" value={formData.quantidade} onChange={(event) => updateField('quantidade', event.target.value)} />
            </Field>
          </>
        )}

        {formData.tipoAnalise === 'reflorestamento' && (
          <>
            <Field label="Bioma">
              <select className="input-base" value={formData.bioma} onChange={(event) => updateField('bioma', event.target.value)}>
                <option value="">Selecione</option>
                <option value="mata_atlantica">Mata Atlântica</option>
                <option value="cerrado">Cerrado</option>
              </select>
            </Field>
            <Field label="Área em hectares">
              <input type="number" min="0" className="input-base" value={formData.areaHa} onChange={(event) => updateField('areaHa', event.target.value)} />
            </Field>
            <Field label="Uso anterior">
              <select className="input-base" value={formData.usoAnterior} onChange={(event) => updateField('usoAnterior', event.target.value)}>
                <option value="">Selecione</option>
                <option value="area_degradada">Área degradada</option>
                <option value="pastagem_degradada">Pastagem degradada</option>
                <option value="solo_exposto">Solo exposto</option>
              </select>
            </Field>
            <Field label="Uso atual/proposto">
              <select className="input-base" value={formData.usoAtual} onChange={(event) => updateField('usoAtual', event.target.value)}>
                <option value="">Selecione</option>
                <option value="floresta_em_restauracao">Floresta em restauração</option>
                <option value="vegetacao_nativa_em_recuperacao">Vegetação nativa em recuperação</option>
              </select>
            </Field>
            <Field label="Período em anos">
              <input type="number" min="0" className="input-base" value={formData.periodoAnos} onChange={(event) => updateField('periodoAnos', event.target.value)} />
            </Field>
          </>
        )}

        <div className="md:col-span-2">
          <Field label="Observação (opcional)">
            <textarea className="input-base min-h-[110px]" value={formData.observacao} onChange={(event) => updateField('observacao', event.target.value)} />
          </Field>
        </div>
      </div>
    </div>
  );
}

function renderMethodologyStep({ methodology, formData, updateField }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-stone-800 mb-2">Metodologia aplicada automaticamente</h2>
      <p className="text-stone-500 mb-6">O usuário não escolhe metodologia. O EcoSphere aplica a opção compatível com o tipo de análise.</p>

      <div className="card p-6 bg-gradient-to-br from-white to-eco-50/60 mb-6">
        <h3 className="text-lg font-bold text-stone-800 mb-4">Metodologia aplicada pelo EcoSphere</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <InfoLine label="Metodologia" value={methodology?.metodologia} />
          <InfoLine label="Fonte esperada" value={methodology?.fonte} />
          <InfoLine label="Tipo de cálculo" value={methodology?.tipoCalculo} />
          <InfoLine label="Nível de incerteza" value={methodology?.nivelIncerteza} />
          <div className="md:col-span-2">
            <InfoLine label="Limitação" value={methodology?.limitacao} />
          </div>
        </div>
      </div>

      <label className="flex items-start gap-3 card p-4 cursor-pointer">
        <input
          type="checkbox"
          checked={formData.preliminaryAcknowledged}
          onChange={(event) => updateField('preliminaryAcknowledged', event.target.checked)}
          className="mt-1 h-4 w-4 rounded border-stone-300 text-eco-600 focus:ring-eco-500"
        />
        <span className="text-sm font-medium text-stone-700">
          Entendo que o resultado é preliminar e não representa crédito de carbono certificado.
        </span>
      </label>
    </div>
  );
}

function renderEvidenceStep({ evidences, setEvidences }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-stone-800 mb-2">Evidências</h2>
      <p className="text-stone-500 mb-6">
        As evidências aumentam a completude metodológica do diagnóstico, mas não certificam créditos de carbono.
      </p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {evidenceOptions.map(([key, label]) => (
          <button
            type="button"
            key={key}
            onClick={() => setEvidences((current) => ({ ...current, [key]: !current[key] }))}
            className={`card-hover p-4 text-left flex items-center gap-3 ${
              evidences[key] ? 'border-eco-300 bg-eco-50' : ''
            }`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              evidences[key] ? 'bg-eco-600 text-white' : 'bg-stone-100 text-stone-500'
            }`}>
              <Check size={16} />
            </div>
            <span className="font-semibold text-stone-700">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function renderResultStep({ result, formData, evidences, copyReport, copied, copyFallbackReport, generateDiagnosis }) {
  if (!result) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-stone-800 mb-3">Resultado</h2>
        <p className="text-stone-500 mb-6">Gere o diagnóstico para visualizar o resultado e o relatório copiável.</p>
        <button type="button" className="btn-primary" onClick={generateDiagnosis}>
          <ClipboardCheck size={18} />
          Gerar diagnóstico
        </button>
      </div>
    );
  }

  const calculation = result.calculation;
  const unavailable = calculation.status !== 'calculado';
  const factorLabel = result.factorMatch?.id || 'Nenhum fator compatível encontrado';
  const factorSource = result.factorMatch?.fonte || result.methodology?.fonte || 'Fonte não identificada';
  const pendingValue = formData.tipoAnalise === 'reflorestamento'
    ? 'estoque inicial, estoque final e período metodológico reais'
    : 'fator de emissão real';

  return (
    <div>
      <h2 className="text-2xl font-bold text-stone-800 mb-6">Resultado</h2>

      <div className={`card p-6 mb-6 ${unavailable ? 'border-amber-100 bg-amber-50/60' : 'border-eco-100 bg-eco-50/60'}`}>
        <div className="flex items-start gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${unavailable ? 'bg-amber-100 text-amber-600' : 'bg-eco-100 text-eco-600'}`}>
            {unavailable ? <AlertTriangle size={20} /> : <Check size={20} />}
          </div>
          <div>
            <h3 className="text-xl font-bold text-stone-800 mb-2">
              {unavailable ? 'Cálculo indisponível' : 'Estimativa calculada'}
            </h3>
            {unavailable ? (
              <div className="space-y-3 text-stone-700 leading-relaxed">
                <p>
                  O EcoSphere encontrou a metodologia e a fonte esperada, mas o valor metodológico real ainda não foi cadastrado na base. Isso é uma trava de segurança para não gerar número artificial de CO₂e.
                </p>
                <p><strong>Status:</strong> rascunho metodológico</p>
                <p><strong>Motivo:</strong> {calculation.reason || 'fator ou estoque ainda não cadastrado'}</p>
                <p><strong>Registro da base:</strong> {factorLabel}</p>
                <p><strong>Fonte esperada:</strong> {factorSource}</p>
                <p><strong>Próxima ação:</strong> preencher {pendingValue} em <span className="font-mono text-xs bg-white/70 px-2 py-1 rounded-lg">carbonFactors.js</span> antes de gerar estimativa numérica.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                <Metric label="Estimativa total" value={`${calculation.totalTCO2e.toFixed(4)} tCO₂e`} />
                <Metric label="Estimativa anual" value={calculation.annualTCO2e ? `${calculation.annualTCO2e.toFixed(4)} tCO₂e/ano` : 'Não aplicável'} />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-6">
          <h3 className="text-lg font-bold text-stone-800 mb-4">Detalhes metodológicos</h3>
          <div className="space-y-3 text-sm">
            <InfoLine label="Tipo de cálculo" value={result.methodology?.tipoCalculo} />
            <InfoLine label="Fonte" value={result.methodology?.fonte} />
            <InfoLine label="Metodologia" value={result.methodology?.metodologia} />
            <InfoLine label="Incerteza" value={result.methodology?.nivelIncerteza} />
            <InfoLine label="Registro metodológico" value={factorLabel} />
            <InfoLine label="Limitação" value={result.methodology?.limitacao} />
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-bold text-stone-800 mb-2">
            Completude metodológica: {result.completeness.percentage}%
          </h3>
          <div className="w-full bg-stone-200 rounded-full h-2.5 overflow-hidden mb-3">
            <div className="h-full bg-gradient-to-r from-eco-500 to-teal-500 rounded-full" style={{ width: `${result.completeness.percentage}%` }} />
          </div>
          <p className="text-sm font-semibold text-stone-700 mb-4">Nível: {result.completeness.level}</p>
          <p className="text-xs text-stone-500 leading-relaxed mb-4">
            Este índice mede a completude do cadastro e das evidências. Ele não representa validação oficial, aprovação de crédito ou certificação ambiental.
          </p>
          <ListBlock title="Critérios atendidos" items={result.completeness.attended} />
          <ListBlock title="Pendências" items={result.completeness.pending} />
        </div>
      </div>

      <div className="card p-6 bg-gradient-to-br from-white to-eco-50/60">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-stone-800">Relatório copiável</h3>
            <p className="text-sm text-stone-500">
              Inclui identificação, metodologia, dados, resultado, completude, evidências e limitação de uso.
            </p>
          </div>
          <button type="button" className="btn-secondary" onClick={copyReport}>
            <Clipboard size={18} />
            {copied ? 'Relatório copiado!' : 'Copiar relatório'}
          </button>
        </div>
        {copyFallbackReport && (
          <div className="mt-5 rounded-2xl border border-amber-100 bg-amber-50/70 p-4">
            <p className="text-sm font-semibold text-stone-700 mb-3">
              O navegador bloqueou a cópia automática. Selecione o texto abaixo e copie manualmente.
            </p>
            <textarea
              readOnly
              value={copyFallbackReport}
              className="input-base min-h-[220px] bg-white font-mono text-xs leading-relaxed"
              onFocus={(event) => event.target.select()}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function InfoLine({ label, value }) {
  return (
    <div>
      <span className="block text-xs font-black uppercase tracking-widest text-stone-400 mb-1">{label}</span>
      <span className="font-semibold text-stone-700">{value || 'Não definido'}</span>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-2xl bg-white/80 border border-eco-100 p-4">
      <div className="text-sm text-stone-500 mb-1">{label}</div>
      <div className="text-2xl font-black text-stone-800">{value}</div>
    </div>
  );
}

function ListBlock({ title, items }) {
  return (
    <div className="mb-4">
      <h4 className="text-sm font-bold text-stone-800 mb-2">{title}</h4>
      <div className="flex flex-wrap gap-2">
        {(items.length ? items : ['Nenhum']).map((item) => (
          <span key={item} className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-600">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export default CarbonProjects;
