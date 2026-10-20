import * as tf from '@tensorflow/tfjs';
import { WASTE_CLASSES, NO_OBJECT_ID, getWasteClass } from '../data/wasteKnowledge';

/** Confiança mínima para perguntar "É {objeto}?" sem listar alternativas. */
export const CONFIDENCE_THRESHOLD = 0.80;

const MODEL_URL = '/models/waste-classifier/model.json';
const METADATA_URL = '/models/waste-classifier/metadata.json';

let modelSingleton = null;
let labelsSingleton = null;
let imageSizeSingleton = 224;
let loadPromise = null;
let mockMode = false;

export function isMockModelEnabled() {
  return process.env.REACT_APP_USE_MOCK_MODEL === 'true';
}

export function isSimulatedEnabled() {
  return process.env.REACT_APP_ENABLE_SIMULATED === 'true';
}

export function isLocalModelReady() {
  return Boolean(modelSingleton) || mockMode;
}

export function isUsingMockModel() {
  return mockMode;
}

function validateLabels(labels) {
  const expected = new Set(WASTE_CLASSES.map((c) => c.id));
  const got = new Set(labels);
  const unknown = labels.filter((id) => !expected.has(id));
  const missing = [...expected].filter((id) => !got.has(id));

  if (unknown.length || missing.length) {
    console.error('[localClassifier] Labels incompatíveis com wasteKnowledge.js', {
      metadataLabels: labels,
      unknownInMetadata: unknown,
      missingFromMetadata: missing,
    });
    const parts = [];
    if (unknown.length) parts.push(`desconhecidas no metadata: ${unknown.join(', ')}`);
    if (missing.length) parts.push(`faltando no metadata: ${missing.join(', ')}`);
    throw new Error(`Labels do modelo inválidas (${parts.join('; ')})`);
  }
}

async function warmUp(model, imageSize) {
  const zeros = tf.zeros([1, imageSize, imageSize, 3]);
  try {
    const out = model.predict(zeros);
    const tensor = Array.isArray(out) ? out[0] : out;
    await tensor.data();
    if (Array.isArray(out)) out.forEach((t) => t.dispose());
    else tensor.dispose();
  } finally {
    zeros.dispose();
  }
}

function topKFromScores(scores, labels, k = 3) {
  return scores
    .map((confidence, index) => ({ id: labels[index], confidence }))
    .filter((item) => item.id)
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, k);
}

function requireRealModel() {
  return process.env.REACT_APP_REQUIRE_REAL_MODEL === 'true';
}

function enableEstimativaMode(reason) {
  mockMode = true;
  labelsSingleton = WASTE_CLASSES.map((c) => c.id);
  imageSizeSingleton = 224;
  console.warn('[localClassifier] Modo estimativa (sem rede neural treinada):', reason || '');
  return {
    model: null,
    labels: labelsSingleton,
    imageSize: imageSizeSingleton,
    mock: true,
  };
}

/**
 * Estimativa leve sem NN — confiança moderada de propósito,
 * para deixar claro que o resultado não é preciso.
 */
function mockClassify() {
  const objectIds = WASTE_CLASSES.filter((c) => c.id !== NO_OBJECT_ID).map((c) => c.id);
  const pickIdx = Math.floor(Date.now() / 4000) % objectIds.length;
  const secondIdx = (pickIdx + 1) % objectIds.length;
  const thirdIdx = (pickIdx + 2) % objectIds.length;
  // Faixa ~55–72%: abaixo do limiar de “certeza” (80%)
  const topConf = 0.55 + ((Date.now() % 170) / 1000);
  const scores = objectIds.map(() => 0.03);
  scores[pickIdx] = topConf;
  scores[secondIdx] = Math.max(0.12, 0.95 - topConf - 0.2);
  scores[thirdIdx] = 0.08;
  const labels = [...objectIds, NO_OBJECT_ID];
  scores.push(0.04);
  return topKFromScores(scores, labels, 3);
}

export async function loadLocalModel() {
  if (modelSingleton || mockMode) {
    return { model: modelSingleton, labels: labelsSingleton, imageSize: imageSizeSingleton, mock: mockMode };
  }
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    if (isMockModelEnabled()) {
      return enableEstimativaMode('REACT_APP_USE_MOCK_MODEL=true');
    }

    try {
      const metaRes = await fetch(METADATA_URL, { cache: 'no-store' });
      if (!metaRes.ok) {
        throw new Error('metadata.json não encontrado');
      }
      const metaType = metaRes.headers.get('content-type') || '';
      if (metaType.includes('text/html')) {
        throw new Error('metadata.json não encontrado');
      }
      const metadata = await metaRes.json();
      const labels = Array.isArray(metadata.labels) ? metadata.labels : [];
      const imageSize = Number(metadata.imageSize) || 224;
      validateLabels(labels);

      // CRA devolve index.html para arquivos ausentes — validar antes do TF.js
      const modelRes = await fetch(MODEL_URL, { cache: 'no-store' });
      if (!modelRes.ok) {
        throw new Error('model.json não publicado');
      }
      const modelType = modelRes.headers.get('content-type') || '';
      const modelText = await modelRes.text();
      if (modelType.includes('text/html') || modelText.trimStart().startsWith('<')) {
        throw new Error('model.json não publicado');
      }
      try {
        JSON.parse(modelText);
      } catch (_) {
        throw new Error('model.json inválido');
      }

      let model;
      try {
        model = await tf.loadLayersModel(MODEL_URL);
      } catch (err) {
        const msg = String(err?.message || err);
        if (/parse model JSON|weights|404|Failed to fetch/i.test(msg)) {
          throw new Error('model.json / weights.bin ausentes ou inválidos');
        }
        throw err;
      }
      await warmUp(model, imageSize);

      modelSingleton = model;
      labelsSingleton = labels;
      imageSizeSingleton = imageSize;
      mockMode = false;

      return { model, labels, imageSize, mock: false };
    } catch (err) {
      if (requireRealModel()) throw err;
      // Sem NN treinada: segue em modo estimativa (não bloqueia a página)
      return enableEstimativaMode(err?.message || String(err));
    }
  })();

  try {
    return await loadPromise;
  } catch (err) {
    loadPromise = null;
    modelSingleton = null;
    labelsSingleton = null;
    mockMode = false;
    throw err;
  }
}

export function unloadLocalModel() {
  if (modelSingleton) {
    try {
      modelSingleton.dispose();
    } catch (_) {
      /* ignore */
    }
  }
  modelSingleton = null;
  labelsSingleton = null;
  imageSizeSingleton = 224;
  loadPromise = null;
  mockMode = false;
}

/**
 * Heurística leve por cor dominante (não é NN).
 * Confiança propositalmente moderada (~55–72%).
 */
function estimateFromColors(imageElement) {
  if (!imageElement) return null;
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;
    const w = imageElement.videoWidth || imageElement.naturalWidth || imageElement.width || 0;
    const h = imageElement.videoHeight || imageElement.naturalHeight || imageElement.height || 0;
    if (w < 8 || h < 8) return null;

    // Amostra pequena para performance na câmera
    const sw = 64;
    const sh = 64;
    canvas.width = sw;
    canvas.height = sh;
    ctx.drawImage(imageElement, 0, 0, sw, sh);
    const { data } = ctx.getImageData(0, 0, sw, sh);

    let r = 0;
    let g = 0;
    let b = 0;
    const pixels = data.length / 4;
    for (let i = 0; i < data.length; i += 4) {
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
    }
    r = Math.floor(r / pixels);
    g = Math.floor(g / pixels);
    b = Math.floor(b / pixels);

    let ranked;
    if (r > 150 && g > 100 && b < 90) {
      ranked = ['lata_aluminio', 'embalagem_plastica', 'papel'];
    } else if (r > g && r > b && r > 140) {
      ranked = ['embalagem_plastica', 'garrafa_pet', 'organico'];
    } else if (g > r && g > b && g > 110) {
      ranked = ['garrafa_vidro', 'organico', 'embalagem_plastica'];
    } else if (b > r && b > g) {
      ranked = ['papel', 'papelao', 'embalagem_plastica'];
    } else if (r > 90 && g > 70 && b < 90) {
      ranked = ['organico', 'papelao', 'papel'];
    } else if (r < 80 && g < 80 && b < 80) {
      ranked = ['eletronico', 'pilha_bateria', 'embalagem_plastica'];
    } else {
      ranked = ['embalagem_plastica', 'papel', 'garrafa_pet'];
    }

    const spread = Math.min(12, Math.abs(r - g) + Math.abs(g - b)) / 100;
    const topConf = Math.min(0.72, 0.55 + spread);

    return [
      { id: ranked[0], confidence: topConf },
      { id: ranked[1], confidence: 0.14 },
      { id: ranked[2], confidence: 0.08 },
    ];
  } catch (_) {
    return null;
  }
}

/**
 * Classifica um HTMLImageElement, HTMLVideoElement ou HTMLCanvasElement.
 * @returns {Promise<Array<{ id: string, confidence: number }>>}
 */
export async function classifyElement(imageElement) {
  if (mockMode || (isMockModelEnabled() && !modelSingleton)) {
    if (!mockMode) await loadLocalModel();
    return estimateFromColors(imageElement) || mockClassify();
  }

  if (!modelSingleton || !labelsSingleton) {
    throw new Error('Modelo local não carregado');
  }

  const imageSize = imageSizeSingleton;
  const labels = labelsSingleton;
  const model = modelSingleton;

  const scores = tf.tidy(() => {
    const pixels = tf.browser.fromPixels(imageElement);
    const resized = tf.image.resizeBilinear(pixels, [imageSize, imageSize]);
    const normalized = resized.toFloat().div(127.5).sub(1);
    const batched = normalized.expandDims(0);
    const prediction = model.predict(batched);
    const output = Array.isArray(prediction) ? prediction[0] : prediction;
    return output;
  });

  try {
    const data = await scores.data();
    return topKFromScores(Array.from(data), labels, 3);
  } finally {
    scores.dispose();
  }
}

/** Heurística por nome de arquivo — só com REACT_APP_ENABLE_SIMULATED=true. */
export function classifyByFileNameSimulated(fileName) {
  if (!isSimulatedEnabled() || !fileName) return null;
  const name = fileName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const map = [
    [/pet|garrafa_pet/, 'garrafa_pet'],
    [/embalagem|plastico|plastic/, 'embalagem_plastica'],
    [/lata|aluminio|metal/, 'lata_aluminio'],
    [/vidro|glass/, 'garrafa_vidro'],
    [/papelao|caixa/, 'papelao'],
    [/papel|paper/, 'papel'],
    [/organico|comida|casca/, 'organico'],
    [/pilha|bateria/, 'pilha_bateria'],
    [/eletronico|celular|fone|cabo/, 'eletronico'],
  ];
  for (const [re, id] of map) {
    if (re.test(name) && getWasteClass(id)) {
      return [{ id, confidence: 0.93 }, { id: NO_OBJECT_ID, confidence: 0.03 }, { id: 'papel', confidence: 0.02 }];
    }
  }
  return null;
}

/** Heurística por cor — só com REACT_APP_ENABLE_SIMULATED=true (dev). */
export function classifyByColorSimulated(imageElement) {
  if (!isSimulatedEnabled() || !imageElement) return null;
  return estimateFromColors(imageElement);
}

export function calculatePointsFromConfidence(confidence) {
  if (confidence >= 0.9) return 10;
  if (confidence >= 0.7) return 5;
  return 2;
}
