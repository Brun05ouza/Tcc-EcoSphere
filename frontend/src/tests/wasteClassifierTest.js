// 🧪 Script de Teste - Classificação de Resíduos com IA
// Execute no console do navegador (F12) na página do Classificador

console.log('🧪 Iniciando testes de classificação de resíduos...\n');

// Teste 1: Verificar se o modelo está carregado
const testModelLoaded = () => {
  console.log('📋 Teste 1: Verificando carregamento do modelo');
  
  const modelStatus = document.querySelector('[class*="text-green-600"]');
  if (modelStatus && modelStatus.textContent.includes('Modelo de IA pronto')) {
    console.log('✅ Modelo carregado com sucesso');
    return true;
  } else {
    console.log('⚠️ Modelo não carregado - usando classificação simulada');
    return false;
  }
};

// Teste 2: Simular upload de imagem
const testImageUpload = () => {
  console.log('\n📋 Teste 2: Simulando upload de imagem');
  
  const fileInput = document.querySelector('input[type="file"]');
  if (fileInput) {
    console.log('✅ Input de arquivo encontrado');
    return true;
  } else {
    console.log('❌ Input de arquivo não encontrado');
    return false;
  }
};

// Teste 3: Verificar botão de classificação
const testClassifyButton = () => {
  console.log('\n📋 Teste 3: Verificando botão de classificação');
  
  const buttons = Array.from(document.querySelectorAll('button'));
  const classifyButton = buttons.find(btn => 
    btn.textContent.includes('Classificar') || 
    btn.textContent.includes('Analisando')
  );
  
  if (classifyButton) {
    console.log('✅ Botão de classificação encontrado');
    return true;
  } else {
    console.log('⚠️ Botão de classificação não encontrado (normal se não houver imagem)');
    return false;
  }
};

// Teste 4: Verificar botão de câmera
const testCameraButton = () => {
  console.log('\n📋 Teste 4: Verificando botão de câmera');
  
  const buttons = Array.from(document.querySelectorAll('button'));
  const cameraButton = buttons.find(btn => 
    btn.textContent.includes('Câmera') || 
    btn.textContent.includes('Abrir Câmera')
  );
  
  if (cameraButton) {
    console.log('✅ Botão de câmera encontrado');
    return true;
  } else {
    console.log('❌ Botão de câmera não encontrado');
    return false;
  }
};

// Executar todos os testes
const runAllTests = () => {
  console.log('═══════════════════════════════════════════════════════');
  console.log('🧪 TESTES DE CLASSIFICAÇÃO DE RESÍDUOS - ECOSPHERE');
  console.log('═══════════════════════════════════════════════════════\n');
  
  const results = {
    modelLoaded: testModelLoaded(),
    imageUpload: testImageUpload(),
    classifyButton: testClassifyButton(),
    cameraButton: testCameraButton()
  };
  
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('📊 RESUMO DOS TESTES');
  console.log('═══════════════════════════════════════════════════════');
  
  const passed = Object.values(results).filter(r => r === true).length;
  const total = Object.keys(results).length;
  
  console.log(`\n✅ Testes Passados: ${passed}/${total}`);
  console.log(`📊 Taxa de Sucesso: ${((passed/total) * 100).toFixed(1)}%\n`);
  
  return results;
};

runAllTests();
window.testWasteClassifier = runAllTests;
