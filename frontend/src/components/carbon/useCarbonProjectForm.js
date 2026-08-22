import { useState, useCallback } from 'react';
import { INITIAL_FORM_DATA } from './constants';

export function useCarbonProjectForm() {
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const getSummary = useCallback(() => {
    const locationParts = [formData.cidade, formData.estado, formData.pais].filter(Boolean);
    return {
      nome: formData.nome || '—',
      tipo: formData.tipo || '—',
      status: formData.status || '—',
      area: formData.areaHa ? `${formData.areaHa} ha` : '— ha',
      localizacao: locationParts.length > 0 ? locationParts.join(', ') : '—',
      potencial: formData.potencialCarbono || '—',
    };
  }, [formData]);

  const validate = useCallback(() => {
    if (!formData.nome.trim()) return 'Informe o nome do projeto.';
    if (!formData.tipo) return 'Selecione o tipo de projeto.';
    if (!formData.status) return 'Selecione o status do projeto.';
    return null;
  }, [formData]);

  const handleSaveMock = useCallback(() => {
    const error = validate();
    if (error) return { success: false, message: error, type: 'warning' };
    return {
      success: true,
      message: 'Projeto salvo localmente para demonstração. A integração com banco de dados será implementada em etapa futura.',
      type: 'success',
    };
  }, [validate]);

  return { formData, handleChange, getSummary, handleSaveMock };
}
