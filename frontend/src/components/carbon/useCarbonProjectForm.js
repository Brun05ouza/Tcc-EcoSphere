import { useState, useCallback, useRef } from 'react';
import { INITIAL_FORM_DATA } from './constants';
import { lookupCep, formatCep } from './cepService';

export function useCarbonProjectForm() {
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState('');
  const cepRequestRef = useRef(0);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === 'cep') setCepError('');
  }, []);

  const handleCepChange = useCallback((e) => {
    const formatted = formatCep(e.target.value);
    setFormData((prev) => ({ ...prev, cep: formatted }));
    setCepError('');

    const digits = formatted.replace(/\D/g, '');
    if (digits.length === 8) {
      const requestId = cepRequestRef.current + 1;
      cepRequestRef.current = requestId;
      setCepLoading(true);

      lookupCep(digits)
        .then((result) => {
          if (cepRequestRef.current !== requestId) return;
          setFormData((prev) => ({
            ...prev,
            cep: formatted,
            cidade: result.cidade || prev.cidade,
            estado: result.estado || prev.estado,
            latitude: result.latitude || prev.latitude,
            longitude: result.longitude || prev.longitude,
          }));
        })
        .catch((error) => {
          if (cepRequestRef.current !== requestId) return;
          setCepError(error.message || 'Não foi possível buscar o CEP.');
        })
        .finally(() => {
          if (cepRequestRef.current === requestId) setCepLoading(false);
        });
    }
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

  return {
    formData,
    handleChange,
    handleCepChange,
    cepLoading,
    cepError,
    getSummary,
    handleSaveMock,
  };
}
