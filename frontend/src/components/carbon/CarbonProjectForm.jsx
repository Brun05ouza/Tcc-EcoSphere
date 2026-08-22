import React from 'react';
import CarbonFormSection from './CarbonFormSection';
import CarbonFormField from './CarbonFormField';
import {
  PROJECT_TYPES,
  PROJECT_STATUS,
  MONITORING_PERIODS,
  CURRENT_SCENARIOS,
  PROPOSED_INTERVENTIONS,
  CARBON_POTENTIAL,
  BRAZILIAN_STATES,
} from './constants';

const CarbonProjectForm = ({ formData, onChange }) => (
  <div className="space-y-6">
    <CarbonFormSection title="Identificação do Projeto" index={0}>
      <CarbonFormField
        label="Nome do projeto"
        name="nome"
        value={formData.nome}
        onChange={onChange}
        placeholder="Ex: Reflorestamento Fazenda Boa Vista"
      />
      <div className="grid sm:grid-cols-2 gap-5">
        <CarbonFormField
          label="Tipo de projeto"
          name="tipo"
          type="select"
          value={formData.tipo}
          onChange={onChange}
          options={PROJECT_TYPES}
        />
        <CarbonFormField
          label="Status do projeto"
          name="status"
          type="select"
          value={formData.status}
          onChange={onChange}
          options={PROJECT_STATUS}
        />
      </div>
      <CarbonFormField
        label="Responsável técnico"
        name="responsavelTecnico"
        value={formData.responsavelTecnico}
        onChange={onChange}
        placeholder="Nome do responsável ou equipe técnica"
      />
    </CarbonFormSection>

    <CarbonFormSection title="Localização" index={1}>
      <div className="grid sm:grid-cols-3 gap-5">
        <CarbonFormField
          label="País"
          name="pais"
          value={formData.pais}
          onChange={onChange}
        />
        <CarbonFormField
          label="Estado"
          name="estado"
          type="select"
          value={formData.estado}
          onChange={onChange}
          options={BRAZILIAN_STATES}
        />
        <CarbonFormField
          label="Cidade"
          name="cidade"
          value={formData.cidade}
          onChange={onChange}
          placeholder="Nome da cidade"
        />
      </div>
      <CarbonFormField
        label="Área do projeto"
        name="areaHa"
        type="number"
        value={formData.areaHa}
        onChange={onChange}
        placeholder="Ex: 25"
        suffix="hectares"
        min="0"
        step="0.01"
      />
      <div className="grid sm:grid-cols-2 gap-5">
        <CarbonFormField
          label="Latitude"
          name="latitude"
          type="number"
          value={formData.latitude}
          onChange={onChange}
          placeholder="Ex: -23.5505"
          step="any"
        />
        <CarbonFormField
          label="Longitude"
          name="longitude"
          type="number"
          value={formData.longitude}
          onChange={onChange}
          placeholder="Ex: -46.6333"
          step="any"
        />
      </div>
      <p className="text-xs text-slate-500 -mt-2">
        As coordenadas ajudam futuramente na validação por mapa, satélite e histórico ambiental.
      </p>
    </CarbonFormSection>

    <CarbonFormSection title="Período do Projeto" index={2}>
      <div className="grid sm:grid-cols-2 gap-5">
        <CarbonFormField
          label="Data de início"
          name="dataInicio"
          type="date"
          value={formData.dataInicio}
          onChange={onChange}
        />
        <CarbonFormField
          label="Previsão de término"
          name="dataTermino"
          type="date"
          value={formData.dataTermino}
          onChange={onChange}
        />
      </div>
      <CarbonFormField
        label="Período de monitoramento"
        name="periodoMonitoramento"
        type="select"
        value={formData.periodoMonitoramento}
        onChange={onChange}
        options={MONITORING_PERIODS}
      />
    </CarbonFormSection>

    <CarbonFormSection title="Objetivo Ambiental" index={3}>
      <CarbonFormField
        label="Descrição do objetivo"
        name="descricaoObjetivo"
        type="textarea"
        value={formData.descricaoObjetivo}
        onChange={onChange}
        placeholder="Descreva o objetivo ambiental do projeto, como recuperação de vegetação, redução de emissão, preservação de área ou melhoria no manejo."
        rows={4}
      />
      <CarbonFormField
        label="Resultado esperado"
        name="resultadoEsperado"
        type="textarea"
        value={formData.resultadoEsperado}
        onChange={onChange}
        placeholder="Ex: Recuperar 25 hectares de área degradada e preparar o projeto para estimativa futura de remoção de CO₂e."
        rows={3}
      />
    </CarbonFormSection>

    <CarbonFormSection
      title="Base para Cálculo Futuro"
      description="Campos informativos — o cálculo real de CO₂e será implementado futuramente."
      index={4}
    >
      <div className="grid sm:grid-cols-2 gap-5">
        <CarbonFormField
          label="Cenário atual da área"
          name="cenarioAtual"
          type="select"
          value={formData.cenarioAtual}
          onChange={onChange}
          options={CURRENT_SCENARIOS}
        />
        <CarbonFormField
          label="Intervenção proposta"
          name="intervencaoProposta"
          type="select"
          value={formData.intervencaoProposta}
          onChange={onChange}
          options={PROPOSED_INTERVENTIONS}
        />
      </div>
      <CarbonFormField
        label="Potencial de carbono"
        name="potencialCarbono"
        type="select"
        value={formData.potencialCarbono}
        onChange={onChange}
        options={CARBON_POTENTIAL}
        helperText="Esse campo é apenas uma classificação inicial. O cálculo real de CO₂e será implementado futuramente."
      />
    </CarbonFormSection>

    <CarbonFormSection title="Observações Internas" index={5}>
      <CarbonFormField
        label="Observações"
        name="observacoesInternas"
        type="textarea"
        value={formData.observacoesInternas}
        onChange={onChange}
        placeholder="Observações técnicas, pendências, riscos ou informações importantes sobre o projeto."
        rows={4}
      />
    </CarbonFormSection>
  </div>
);

export default CarbonProjectForm;
