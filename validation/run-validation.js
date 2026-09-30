const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

const VALIDATION_DIR = __dirname;
const PROJECT_DIR = path.resolve(VALIDATION_DIR, '..');
const FRONTEND_DIR = path.join(PROJECT_DIR, 'frontend');
const IMAGES_DIR = path.join(VALIDATION_DIR, 'test-images');
const RESULT_JSON = path.join(VALIDATION_DIR, 'resultado.json');
const RESULT_MD = path.join(VALIDATION_DIR, 'resultado.md');
const PROGRESS_JSON = path.join(VALIDATION_DIR, '.validation-progress.json');

const CATEGORY_MAP = [
  ['vidro', 'Vidro'],
  ['papel', 'Papel'],
  ['plastico', 'Plástico'],
  ['metal', 'Metal'],
  ['organico', 'Orgânico'],
  ['eletronico', 'Eletrônico'],
];
const VALID_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif']);
const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504]);

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  for (const rawLine of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const separator = line.indexOf('=');
    if (separator < 1) continue;
    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

async function loadSharedConfiguration() {
  loadEnvFile(path.join(VALIDATION_DIR, '.env'));
  loadEnvFile(path.join(FRONTEND_DIR, '.env'));

  const configPath = path.join(FRONTEND_DIR, 'src', 'services', 'geminiConfig.js');
  const configSource = fs.readFileSync(configPath, 'utf8');
  const configUrl = `data:text/javascript;base64,${Buffer.from(configSource).toString('base64')}`;
  const { GEMINI_MODEL } = await import(configUrl);

  const sharedPath = path.join(FRONTEND_DIR, 'src', 'services', 'geminiWasteShared.mjs');
  const { WASTE_SYSTEM_PROMPT, parseWasteGeminiResponse } = await import(pathToFileURL(sharedPath).href);

  return { GEMINI_MODEL, WASTE_SYSTEM_PROMPT, parseWasteGeminiResponse };
}

function mimeTypeFor(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  if (extension === '.png') return 'image/png';
  if (extension === '.webp') return 'image/webp';
  if (extension === '.heic') return 'image/heic';
  if (extension === '.heif') return 'image/heif';
  return 'image/jpeg';
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function retryDelayMs(error, attempt) {
  const retryInfo = error.body?.error?.details?.find((detail) => (
    String(detail?.['@type'] || '').endsWith('RetryInfo') && detail.retryDelay
  ));
  const retryText = retryInfo?.retryDelay || error.message?.match(/retry in ([\d.]+)s/i)?.[1];
  const apiDelay = retryText ? Math.ceil(Number.parseFloat(retryText) * 1000) + 1500 : 0;
  const exponentialDelay = Math.min(60000, 3000 * (2 ** (attempt - 1)));
  return Math.max(apiDelay, exponentialDelay);
}

async function classifyImage({ apiKey, model, prompt, parseResponse, filePath }) {
  const imageBase64 = fs.readFileSync(filePath).toString('base64');
  const requestBody = {
    contents: [{
      parts: [
        { text: prompt },
        { inline_data: { data: imageBase64, mime_type: mimeTypeFor(filePath) } },
      ],
    }],
  };

  let lastError;
  for (let attempt = 1; attempt <= 8; attempt += 1) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey,
          },
          body: JSON.stringify(requestBody),
        }
      );
      const responseBody = await response.json();
      if (!response.ok) {
        const apiError = new Error(responseBody?.error?.message || `Gemini HTTP ${response.status}`);
        apiError.status = response.status;
        apiError.body = responseBody;
        apiError.dailyQuotaExceeded = responseBody?.error?.details?.some((detail) => (
          detail?.violations?.some((violation) => String(violation.quotaId || '').includes('PerDay'))
        ));
        throw apiError;
      }

      const text = (responseBody.candidates?.[0]?.content?.parts || [])
        .map((part) => part.text || '')
        .join('')
        .trim();
      return parseResponse(text);
    } catch (error) {
      lastError = error;
      if (error.dailyQuotaExceeded) throw error;
      if (!RETRYABLE_STATUS.has(error.status) || attempt === 8) break;
      const delay = retryDelayMs(error, attempt);
      console.warn(`  tentativa ${attempt} falhou (${error.status}); repetindo em ${delay / 1000}s...`);
      await sleep(delay);
    }
  }

  throw lastError;
}

function average(values) {
  if (!values.length) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function percentage(value) {
  return value == null ? 'N/A' : `${(value * 100).toFixed(2)}%`;
}

function buildSummary(items) {
  const attemptedItems = items.filter((item) => !item.skipped);
  const availableItems = attemptedItems.filter((item) => !item.erro);
  const apiFailures = attemptedItems.filter((item) => item.erro);
  const correctItems = availableItems.filter((item) => item.acertou);
  const incorrectItems = availableItems.filter((item) => !item.acertou);
  const categories = {};

  for (const [directory, label] of CATEGORY_MAP) {
    const categoryItems = availableItems.filter((item) => item.categoriaEsperada === label);
    categories[label] = categoryItems.length
      ? {
          status: 'avaliada',
          total: categoryItems.length,
          corretas: categoryItems.filter((item) => item.acertou).length,
          acuracia: categoryItems.filter((item) => item.acertou).length / categoryItems.length,
        }
      : {
          status: 'sem imagens de teste ainda',
          total: 0,
          corretas: 0,
          acuracia: null,
          diretorio: directory,
        };
  }

  const predictedLabels = Array.from(new Set([
    ...CATEGORY_MAP.map(([, label]) => label),
    ...availableItems.map((item) => item.categoriaPrevista),
  ])).filter(Boolean);
  const confusionMatrix = {};
  for (const [, expectedLabel] of CATEGORY_MAP) {
    const expectedItems = availableItems.filter((item) => item.categoriaEsperada === expectedLabel);
    if (!expectedItems.length) continue;
    confusionMatrix[expectedLabel] = Object.fromEntries(
      predictedLabels.map((predictedLabel) => [
        predictedLabel,
        expectedItems.filter((item) => item.categoriaPrevista === predictedLabel).length,
      ])
    );
  }

  return {
    total: availableItems.length,
    totalTentadas: attemptedItems.length,
    corretas: correctItems.length,
    erros: incorrectItems.length,
    falhasDeApi: apiFailures.length,
    acuraciaGeral: availableItems.length ? correctItems.length / availableItems.length : null,
    acuraciaPorCategoria: categories,
    matrizDeConfusao: confusionMatrix,
    confiancaMedia: {
      acertos: average(correctItems.map((item) => item.confidence).filter(Number.isFinite)),
      erros: average(incorrectItems.map((item) => item.confidence).filter(Number.isFinite)),
    },
  };
}

function matrixMarkdown(matrix) {
  const expectedLabels = Object.keys(matrix);
  const predictedLabels = Array.from(new Set(expectedLabels.flatMap((label) => Object.keys(matrix[label]))));
  if (!expectedLabels.length) return '_Sem dados._';

  const lines = [
    `| Esperada \\ Prevista | ${predictedLabels.join(' | ')} |`,
    `|---|${predictedLabels.map(() => '---:').join('|')}|`,
  ];
  for (const expectedLabel of expectedLabels) {
    lines.push(`| ${expectedLabel} | ${predictedLabels.map((label) => matrix[expectedLabel][label] || 0).join(' | ')} |`);
  }
  return lines.join('\n');
}

function buildMarkdown(report) {
  const categoryLines = Object.entries(report.resumo.acuraciaPorCategoria).map(([label, data]) => (
    data.status === 'avaliada'
      ? `| ${label} | ${data.corretas}/${data.total} | ${percentage(data.acuracia)} |`
      : `| ${label} | 0/0 | sem imagens de teste ainda |`
  ));

  const detailLines = report.resultados.map((item) => (
    `| ${item.arquivo} | ${item.categoriaEsperada} | ${item.categoriaPrevista} | ${item.confidence == null ? 'N/A' : item.confidence.toFixed(2)} | ${item.acertou ? 'Sim' : 'Não'} |`
  ));

  return `# Resultado da validação Gemini

- Data: ${report.executadoEm}
- Modelo: \`${report.modelo}\`
- Imagens avaliadas: ${report.resumo.total}
- Falhas de API excluídas da acurácia: ${report.resumo.falhasDeApi}
- Acurácia geral: **${percentage(report.resumo.acuraciaGeral)}** (${report.resumo.corretas}/${report.resumo.total})
- Confiança média nos acertos: ${report.resumo.confiancaMedia.acertos == null ? 'N/A' : report.resumo.confiancaMedia.acertos.toFixed(4)}
- Confiança média nos erros: ${report.resumo.confiancaMedia.erros == null ? 'N/A' : report.resumo.confiancaMedia.erros.toFixed(4)}

## Acurácia por categoria

| Categoria | Acertos | Acurácia |
|---|---:|---:|
${categoryLines.join('\n')}

## Matriz de confusão

${matrixMarkdown(report.resumo.matrizDeConfusao)}

## Resultados por imagem

| Arquivo | Esperada | Prevista | Confiança | Acertou |
|---|---|---|---:|:---:|
${detailLines.join('\n')}
`;
}

async function main() {
  const { GEMINI_MODEL, WASTE_SYSTEM_PROMPT, parseWasteGeminiResponse } = await loadSharedConfiguration();
  const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
  if (!apiKey || apiKey === 'sua_chave_gemini') {
    throw new Error('REACT_APP_GEMINI_API_KEY não configurada em validation/.env nem frontend/.env');
  }

  console.log(`Modelo: ${GEMINI_MODEL}`);
  console.log(`Imagens: ${IMAGES_DIR}`);
  let resultados = [];
  if (fs.existsSync(PROGRESS_JSON)) {
    const progress = JSON.parse(fs.readFileSync(PROGRESS_JSON, 'utf8'));
    if (progress.modelo === GEMINI_MODEL && Array.isArray(progress.resultados)) {
      resultados = progress.resultados.filter((item) => !item.erro);
      console.log(`Progresso retomado: ${resultados.length} classificação(ões) concluída(s)`);
    }
  }

  for (const [directory, expectedLabel] of CATEGORY_MAP) {
    const categoryPath = path.join(IMAGES_DIR, directory);
    const files = fs.existsSync(categoryPath)
      ? fs.readdirSync(categoryPath)
          .filter((fileName) => VALID_EXTENSIONS.has(path.extname(fileName).toLowerCase()))
          .sort()
      : [];

    if (!files.length) {
      console.log(`${expectedLabel}: sem imagens de teste ainda`);
      continue;
    }

    console.log(`\n${expectedLabel}: ${files.length} imagem(ns)`);
    for (const fileName of files) {
      const relativeFile = path.join(directory, fileName).replace(/\\/g, '/');
      const previousResult = resultados.find((item) => item.arquivo === relativeFile && !item.erro);
      if (previousResult) {
        console.log(`- ${relativeFile}: ${previousResult.categoriaPrevista} (${previousResult.confidence.toFixed(2)}) [retomado]`);
        continue;
      }
      process.stdout.write(`- ${relativeFile}: `);
      try {
        const prediction = await classifyImage({
          apiKey,
          model: GEMINI_MODEL,
          prompt: WASTE_SYSTEM_PROMPT,
          parseResponse: parseWasteGeminiResponse,
          filePath: path.join(categoryPath, fileName),
        });
        const acertou = prediction.class === expectedLabel;
        resultados.push({
          arquivo: relativeFile,
          categoriaEsperada: expectedLabel,
          categoriaPrevista: prediction.class,
          confidence: prediction.confidence,
          acertou,
        });
        console.log(`${prediction.class} (${prediction.confidence.toFixed(2)}) ${acertou ? '✓' : '✗'}`);
      } catch (error) {
        if (error.dailyQuotaExceeded) {
          fs.writeFileSync(
            PROGRESS_JSON,
            `${JSON.stringify({ modelo: GEMINI_MODEL, resultados }, null, 2)}\n`,
            'utf8'
          );
          throw new Error(
            `Cota diária do modelo ${GEMINI_MODEL} esgotada. `
            + `Progresso preservado (${resultados.length} classificação(ões)); execute novamente após a renovação da cota.`
          );
        }
        resultados.push({
          arquivo: relativeFile,
          categoriaEsperada: expectedLabel,
          categoriaPrevista: 'Erro de API',
          confidence: null,
          acertou: false,
          erro: error.message,
          statusHttp: error.status || null,
        });
        console.log(`ERRO: ${error.message}`);
      }
      fs.writeFileSync(
        PROGRESS_JSON,
        `${JSON.stringify({ modelo: GEMINI_MODEL, resultados }, null, 2)}\n`,
        'utf8'
      );
      await sleep(1500);
    }
  }

  const report = {
    executadoEm: new Date().toISOString(),
    modelo: GEMINI_MODEL,
    fonteDasImagens: 'TrashNet (Yang & Thung, 2016), amostra aleatória com sementes fixas',
    resumo: buildSummary(resultados),
    resultados,
  };

  fs.writeFileSync(RESULT_JSON, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  fs.writeFileSync(RESULT_MD, buildMarkdown(report), 'utf8');
  if (report.resumo.falhasDeApi === 0 && fs.existsSync(PROGRESS_JSON)) fs.unlinkSync(PROGRESS_JSON);

  console.log('\n=== RESUMO ===');
  console.log(`Acurácia geral: ${percentage(report.resumo.acuraciaGeral)} (${report.resumo.corretas}/${report.resumo.total})`);
  console.log('\nAcurácia por categoria:');
  for (const [label, data] of Object.entries(report.resumo.acuraciaPorCategoria)) {
    console.log(`- ${label}: ${data.status === 'avaliada' ? `${percentage(data.acuracia)} (${data.corretas}/${data.total})` : data.status}`);
  }
  console.log('\nMatriz de confusão:');
  console.log(matrixMarkdown(report.resumo.matrizDeConfusao));
  console.log(`\nConfiança média — acertos: ${report.resumo.confiancaMedia.acertos?.toFixed(4) || 'N/A'}; erros: ${report.resumo.confiancaMedia.erros?.toFixed(4) || 'N/A'}`);
  console.log(`\nResultados salvos em ${RESULT_JSON} e ${RESULT_MD}`);

  if (report.resumo.acuraciaGeral != null && report.resumo.acuraciaGeral < 0.7) {
    console.warn('\nATENÇÃO: acurácia geral abaixo de 70%. O prompt não foi alterado.');
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
