export async function lookupCep(cep) {
  const digits = String(cep).replace(/\D/g, '');
  if (digits.length !== 8) {
    throw new Error('Informe um CEP válido com 8 dígitos.');
  }

  const response = await fetch(`https://brasilapi.com.br/api/cep/v2/${digits}`);
  if (!response.ok) {
    throw new Error('CEP não encontrado.');
  }

  const data = await response.json();
  const latitude = data.location?.coordinates?.latitude;
  const longitude = data.location?.coordinates?.longitude;

  return {
    cidade: data.city || '',
    estado: data.state || '',
    latitude: latitude != null ? String(Number(latitude).toFixed(6)) : '',
    longitude: longitude != null ? String(Number(longitude).toFixed(6)) : '',
  };
}

export function formatCep(value) {
  const digits = String(value).replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}
