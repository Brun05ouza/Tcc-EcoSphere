// Teste da função de validação de senha
const validatePassword = (password) => {
  console.log('Testando senha:', password);
  console.log('Comprimento >= 8:', password.length >= 8);
  console.log('Tem minúscula:', /[a-z]/.test(password));
  console.log('Tem maiúscula:', /[A-Z]/.test(password));
  console.log('Tem número:', /\d/.test(password));
  console.log('Tem símbolo:', /[^\w\s]/.test(password));
  
  if (!password || password.length < 8) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/\d/.test(password)) return false;
  if (!/[^\w\s]/.test(password)) return false;
  return true;
};

// Testar senhas
const senhas = [
  'MinhaSenh@123',
  'Teste123!',
  'SenhaForte#456',
  '123456',
  'senha123'
];

senhas.forEach(senha => {
  console.log('\n--- Testando:', senha, '---');
  console.log('Válida:', validatePassword(senha));
});

console.log('\n--- Teste de requisição ---');
const testData = {
  name: 'Teste Usuario',
  email: 'teste@exemplo.com',
  password: 'MinhaSenh@123'
};

console.log('Dados de teste:', testData);
console.log('Senha válida:', validatePassword(testData.password));