import React, { useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { wasteAPI } from '../services/api';
import { useWasteClassifier } from '../hooks/useWasteClassifier';
import LiveCameraClassifier from '../components/LiveCameraClassifier';
import { Check, Camera, Sparkles, AlertTriangle, Upload, MapPin, ExternalLink } from 'lucide-react';
import LoadingScreen from '../components/ui/LoadingScreen';
import { classifyWasteWithGemini, isGeminiConfigured } from '../services/geminiService';
import {
  OBJECT_CLASSES,
  NO_OBJECT_ID,
  getWasteClass,
  getBinColor,
} from '../data/wasteKnowledge';
import {
  getCollectionPoints,
  COLLECTION_POINTS_DISCLAIMER,
} from '../data/collectionPoints';
import { CONFIDENCE_THRESHOLD } from '../services/localClassifier';

const CLASSIFY_MIN_MS = 1100;

const BIN_STYLES = {
  Vermelha: { bg: 'bg-red-50', text: 'text-red-800', border: 'border-red-100' },
  Amarela: { bg: 'bg-yellow-50', text: 'text-yellow-800', border: 'border-yellow-100' },
  Verde: { bg: 'bg-green-50', text: 'text-green-800', border: 'border-green-100' },
  Azul: { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-100' },
  Marrom: { bg: 'bg-amber-50', text: 'text-amber-900', border: 'border-amber-100' },
  Laranja: { bg: 'bg-orange-50', text: 'text-orange-800', border: 'border-orange-100' },
};

const geminiSecondOpinionEnabled =
  process.env.REACT_APP_ENABLE_GEMINI_SECOND_OPINION === 'true' && isGeminiConfigured();

/** Destaque da % de confiança — deixa explícito que é estimativa. */
function ConfidenceMeter({ value, compact = false }) {
  const pct = Math.max(0, Math.min(100, Math.round((value || 0) * 100)));
  const barColor =
    pct >= 80 ? 'bg-amber-500' : pct >= 55 ? 'bg-orange-500' : 'bg-red-500';

  return (
    <div className={compact ? 'mt-2' : 'mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3'}>
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-amber-800/80">
            Confiança estimada
          </p>
          <p className={`font-black tabular-nums text-amber-950 ${compact ? 'text-2xl' : 'text-4xl'}`}>
            {pct}%
          </p>
        </div>
        {!compact && (
          <p className="max-w-[12rem] text-right text-xs font-medium leading-snug text-amber-900/80">
            Não é um resultado preciso — confirme ou corrija.
          </p>
        )}
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-amber-100">
        <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
      {compact && (
        <p className="mt-1.5 text-[11px] font-medium text-amber-900/70">
          Estimativa — não é precisa
        </p>
      )}
    </div>
  );
}

const WasteClassifier = () => {
  const navigate = useNavigate();
  const { addEcoPoints } = useUser();
  const {
    status,
    loading: modelLoading,
    modelReady,
    modelUnavailable,
    error: modelError,
    reload,
    classifyImageElement,
    calculatePoints,
    isMock,
  } = useWasteClassifier();

  const fileInputRef = useRef(null);
  const [mode, setMode] = useState('camera'); // camera | upload
  const [step, setStep] = useState('idle'); // idle | classifying | confirm | pick | result
  const [preview, setPreview] = useState(null);
  const [topPredictions, setTopPredictions] = useState([]);
  const [predictedLabel, setPredictedLabel] = useState(null);
  const [finalLabel, setFinalLabel] = useState(null);
  const [userCorrected, setUserCorrected] = useState(false);
  const [forceCorrected, setForceCorrected] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [points, setPoints] = useState(0);
  const [registered, setRegistered] = useState(false);
  const [saving, setSaving] = useState(false);
  const [geminiBusy, setGeminiBusy] = useState(false);
  const [geminiNote, setGeminiNote] = useState(null);

  const resetFlow = () => {
    setStep('idle');
    setPreview(null);
    setTopPredictions([]);
    setPredictedLabel(null);
    setFinalLabel(null);
    setUserCorrected(false);
    setForceCorrected(false);
    setConfidence(0);
    setPoints(0);
    setRegistered(false);
    setGeminiNote(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const openConfirmation = useCallback((predictions, imagePreview) => {
    const top = predictions[0] || { id: NO_OBJECT_ID, confidence: 0 };
    setPreview(imagePreview);
    setTopPredictions(predictions);
    setPredictedLabel(top.id);
    setConfidence(top.confidence || 0);
    setFinalLabel(null);
    setUserCorrected(false);
    setForceCorrected(false);
    setRegistered(false);
    setPoints(0);
    setGeminiNote(null);

    const confident =
      top.id !== NO_OBJECT_ID && (top.confidence || 0) >= CONFIDENCE_THRESHOLD;

    if (confident) {
      setStep('confirm');
    } else {
      setStep('pick');
    }
  }, []);

  const persistClassification = async ({
    classId,
    corrected,
    conf,
    source = 'local',
  }) => {
    const info = getWasteClass(classId);
    if (!info || !info.categoria) {
      throw new Error('Classe inválida para registro');
    }

    const pts = calculatePoints(conf, corrected);
    setPoints(pts);
    setFinalLabel(classId);
    setUserCorrected(corrected);
    setSaving(true);

    addEcoPoints(pts, `Classificação: ${info.nome}`);

    try {
      const saveRes = await wasteAPI.saveClassification({
        category: info.categoria,
        confidence: conf,
        points: pts,
        predicted_label: predictedLabel,
        final_label: classId,
        source,
        user_corrected: corrected,
      });

      const newBadges = saveRes?.data?.newBadges;
      if (Array.isArray(newBadges) && newBadges.length > 0) {
        window.dispatchEvent(new CustomEvent('badgesUnlocked', { detail: { badges: newBadges } }));
      }
      const newMissions = saveRes?.data?.newMissions;
      if (Array.isArray(newMissions) && newMissions.length > 0) {
        window.dispatchEvent(new CustomEvent('missionsCompleted', { detail: { missions: newMissions } }));
      }
      if (typeof saveRes?.data?.ecoPoints === 'number') {
        window.dispatchEvent(new CustomEvent('ecoPointsUpdated', {
          detail: {
            newPoints: saveRes.data.ecoPoints,
            addedPoints: pts,
            type: 'classification',
          },
        }));
      }
      setRegistered(true);
      setStep('result');
    } catch (err) {
      console.error('Erro ao salvar classificação:', err);
      alert('Não foi possível registrar a classificação. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmYes = async () => {
    if (!predictedLabel || predictedLabel === NO_OBJECT_ID) return;
    await persistClassification({
      classId: predictedLabel,
      corrected: false,
      conf: confidence,
      source: 'local',
    });
  };

  const handleConfirmNo = () => {
    setForceCorrected(true);
    setStep('pick');
  };

  const handlePickClass = async (classId) => {
    const wasCorrected =
      forceCorrected ||
      !predictedLabel ||
      predictedLabel === NO_OBJECT_ID ||
      classId !== predictedLabel ||
      confidence < CONFIDENCE_THRESHOLD;
    await persistClassification({
      classId,
      corrected: wasCorrected,
      conf: confidence,
      source: 'local',
    });
  };

  const runWithClassifyingScreen = async (imagePreview, classifyFn) => {
    setPreview(imagePreview);
    setStep('classifying');
    const started = Date.now();
    try {
      const predictions = await classifyFn();
      const elapsed = Date.now() - started;
      if (elapsed < CLASSIFY_MIN_MS) {
        await new Promise((r) => setTimeout(r, CLASSIFY_MIN_MS - elapsed));
      }
      openConfirmation(predictions, imagePreview);
    } catch (err) {
      console.error(err);
      setStep('idle');
      alert('Erro ao classificar o resíduo. Tente novamente.');
    }
  };

  const handleCapture = ({ preview: imagePreview, predictions, canvas }) => {
    runWithClassifyingScreen(imagePreview, async () => {
      // Reclassifica o quadro congelado para o loading fazer sentido
      if (canvas) {
        try {
          return await classifyImageElement(canvas);
        } catch (_) {
          /* usa predição ao vivo */
        }
      }
      return predictions;
    });
  };

  const handleFile = async (file) => {
    if (!file || !file.type.startsWith('image/') || !modelReady) return;
    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      await runWithClassifyingScreen(dataUrl, async () => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = dataUrl;
        });
        return classifyImageElement(img, file.name);
      });
    } catch (err) {
      console.error(err);
      alert('Erro ao ler a imagem. Tente novamente.');
    }
  };

  const askGeminiSecondOpinion = async () => {
    if (!preview || !geminiSecondOpinionEnabled) return;
    setGeminiBusy(true);
    setGeminiNote(null);
    try {
      const [header, data] = preview.split(',');
      const mimeType = header.match(/:(.*?);/)?.[1] || 'image/jpeg';
      const result = await classifyWasteWithGemini(data, mimeType);
      if (!result) {
        setGeminiNote('Não foi possível obter a segunda opinião (rede ou limite da API).');
        return;
      }
      // Mapeia categoria CONAMA → primeira classe OBJECT com essa categoria
      const match = OBJECT_CLASSES.find((c) => c.categoria === result.class);
      if (!match) {
        setGeminiNote(`Gemini sugeriu "${result.class}", sem correspondência local.`);
        return;
      }
      await persistClassification({
        classId: match.id,
        corrected: true,
        conf: result.confidence,
        source: 'legacy',
      });
      setGeminiNote(`Segunda opinião (Gemini): ${match.nome}`);
    } catch (err) {
      const msg = String(err?.message || err);
      setGeminiNote(
        msg.includes('429') || msg.toLowerCase().includes('quota')
          ? 'Limite da API atingido. Tente mais tarde.'
          : 'Erro de rede na segunda opinião.'
      );
    } finally {
      setGeminiBusy(false);
    }
  };

  const finalInfo = finalLabel ? getWasteClass(finalLabel) : null;
  const predictedInfo = predictedLabel ? getWasteClass(predictedLabel) : null;
  const binColor = finalInfo?.categoria ? getBinColor(finalInfo.categoria) : null;
  const styles = BIN_STYLES[binColor] || { bg: 'bg-stone-50', text: 'text-stone-800', border: 'border-stone-100' };
  const nearbyPoints = finalInfo?.categoria
    ? getCollectionPoints(finalInfo.categoria, 4)
    : [];

  const Icon = ({ name, className = 'w-5 h-5' }) => (
    <img
      src={require(`../assets/icons/${name}.svg`)}
      alt={name}
      className={className}
      style={{ filter: 'invert(40%) sepia(93%) saturate(500%) hue-rotate(100deg)' }}
    />
  );

  return (
    <div className="min-h-screen bg-surface-50 py-8 md:py-12">
      <div className="container mx-auto px-4">
        {isMock && (
          <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-center text-sm font-semibold text-amber-950 shadow-sm">
            Modo estimativa — sem rede neural treinada. A % de confiança mostra que o resultado não é preciso.
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center"
        >
          <h1 className="mb-4 text-3xl font-bold sm:text-4xl lg:text-5xl">
            <span className="flex items-center justify-center gap-3 bg-gradient-to-r from-eco-700 via-teal-600 to-eco-700 bg-clip-text pb-2 text-transparent">
              <div className="h-12 w-12 flex-shrink-0">
                <Icon name="IA" className="h-full w-full" />
              </div>
              <span>Classificador Inteligente</span>
            </span>
          </h1>
          <p className="text-lg text-gray-600 sm:text-xl">
            Aponte a câmera, confirme o objeto e ganhe EcoPoints
          </p>
          {modelLoading && (
            <div className="mt-4 flex items-center justify-center gap-2 text-blue-600">
              <LoadingScreen fullScreen={false} size={24} />
              <span className="text-sm">Carregando modelo local…</span>
            </div>
          )}
          {modelReady && (
            <div className="mt-4 flex items-center justify-center gap-2 text-green-600">
              <i className="bi bi-check-circle-fill" />
              <span className="text-sm">Modelo local pronto</span>
            </div>
          )}
        </motion.div>

        {modelUnavailable && (
          <div className="mx-auto max-w-lg rounded-3xl border border-stone-200 bg-white p-8 text-center shadow-soft">
            <AlertTriangle className="mx-auto mb-3 text-amber-500" size={40} />
            <h2 className="text-xl font-bold text-stone-800">Modelo indisponível</h2>
            <p className="mt-2 text-sm text-stone-500">
              {modelError ||
                'O modelo Teachable Machine ainda não foi publicado em /models/waste-classifier/.'}
            </p>
            <p className="mt-3 text-xs text-stone-400">
              Exporte o modelo do Teachable Machine (TensorFlow.js) para{' '}
              <code className="rounded bg-stone-100 px-1">public/models/waste-classifier/</code>
              {' '}ou, só em desenvolvimento, use{' '}
              <code className="rounded bg-stone-100 px-1">REACT_APP_USE_MOCK_MODEL=true</code>.
            </p>
            <button
              type="button"
              onClick={reload}
              className="mt-6 rounded-xl bg-stone-900 px-6 py-3 text-sm font-semibold text-white hover:bg-stone-800"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {modelReady && (
          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative flex flex-col overflow-hidden rounded-3xl border border-stone-100 bg-white p-5 shadow-soft-lg sm:p-6 lg:p-8"
            >
              <div className="absolute left-0 top-0 h-1.5 w-full bg-gradient-to-r from-eco-500 to-teal-500" />

              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-stone-800">Captura</h2>
                  <p className="mt-1 text-sm text-stone-500">Câmera ao vivo ou envio de imagem</p>
                </div>
                <div className="flex rounded-full border border-stone-200 p-1 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => { setMode('camera'); if (step !== 'idle') resetFlow(); }}
                    className={`rounded-full px-3 py-1.5 ${mode === 'camera' ? 'bg-stone-900 text-white' : 'text-stone-600'}`}
                  >
                    Câmera
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMode('upload'); if (step !== 'idle') resetFlow(); }}
                    className={`rounded-full px-3 py-1.5 ${mode === 'upload' ? 'bg-stone-900 text-white' : 'text-stone-600'}`}
                  >
                    Arquivo
                  </button>
                </div>
              </div>

              {step === 'idle' && mode === 'camera' && (
                <LiveCameraClassifier enabled={status === 'ready' && step === 'idle'} onCapture={handleCapture} />
              )}

              {step === 'idle' && mode === 'upload' && (
                <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50/50 px-6 py-10 text-center">
                  <Upload className="mb-3 text-eco-500" size={36} />
                  <p className="mb-4 text-sm text-stone-500">PNG, JPG ou WEBP</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFile(e.target.files?.[0])}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 rounded-xl border-2 border-stone-200 bg-white px-5 py-2.5 font-medium text-stone-700 hover:border-eco-500 hover:text-eco-600"
                  >
                    <Camera size={18} />
                    Escolher imagem
                  </button>
                </div>
              )}

              {(step === 'classifying' || (step !== 'idle' && preview)) && preview && (
                <div className="space-y-4">
                  <div className="relative">
                    <img
                      src={preview}
                      alt="Captura"
                      className={`h-56 w-full rounded-xl border border-stone-200 object-cover sm:h-64 ${
                        step === 'classifying' ? 'opacity-60' : ''
                      }`}
                    />
                    {step === 'classifying' && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl bg-stone-950/45 backdrop-blur-[2px]">
                        <LoadingScreen fullScreen={false} size={40} color="white" />
                        <p className="mt-3 text-sm font-bold text-white">IA classificando…</p>
                        <p className="mt-1 text-xs text-white/80">Analisando o resíduo</p>
                      </div>
                    )}
                  </div>
                  {step !== 'classifying' && (
                    <button
                      type="button"
                      onClick={resetFlow}
                      className="w-full rounded-xl border border-stone-200 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-50"
                    >
                      Nova captura
                    </button>
                  )}
                </div>
              )}
            </motion.div>

            <AnimatePresence mode="wait">
              {step === 'classifying' && (
                <motion.div
                  key="classifying"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  className="flex flex-col items-center justify-center rounded-3xl border border-stone-100 bg-white p-10 text-center shadow-soft-lg"
                >
                  <LoadingScreen fullScreen={false} size={56} />
                  <h2 className="mt-5 text-xl font-bold text-stone-800">IA classificando</h2>
                  <p className="mt-2 max-w-xs text-sm text-stone-500">
                    Estamos analisando a imagem. Em seguida você confirma ou corrige o resultado.
                  </p>
                  <div className="mt-6 h-1.5 w-48 overflow-hidden rounded-full bg-stone-100">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-eco-500 to-teal-500"
                      initial={{ x: '-100%' }}
                      animate={{ x: '100%' }}
                      transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
                      style={{ width: '55%' }}
                    />
                  </div>
                </motion.div>
              )}

              {step === 'confirm' && (
                <motion.div
                  key="confirm"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  className="rounded-3xl border border-stone-100 bg-white p-6 shadow-soft-lg"
                >
                  <h2 className="text-xl font-bold text-stone-800">Confirmação</h2>
                  <p className="mt-3 text-lg text-stone-700">
                    É <strong>{predictedInfo?.nome || predictedLabel}</strong>?
                  </p>
                  <ConfidenceMeter value={confidence} />
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      disabled={saving}
                      onClick={handleConfirmYes}
                      className="flex-1 rounded-xl bg-eco-600 py-3 font-semibold text-white hover:bg-eco-700 disabled:opacity-60"
                    >
                      {saving ? 'Registrando…' : 'Sim, é isso'}
                    </button>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={handleConfirmNo}
                      className="flex-1 rounded-xl border-2 border-stone-200 py-3 font-semibold text-stone-700 hover:bg-stone-50"
                    >
                      Não é isso
                    </button>
                  </div>
                  {geminiSecondOpinionEnabled && (
                    <button
                      type="button"
                      disabled={geminiBusy || saving}
                      onClick={askGeminiSecondOpinion}
                      className="mt-4 w-full rounded-xl border border-purple-200 bg-purple-50 py-2.5 text-sm font-semibold text-purple-700 hover:bg-purple-100 disabled:opacity-60"
                    >
                      {geminiBusy ? 'Consultando Gemini…' : 'Pedir segunda opinião'}
                    </button>
                  )}
                  {geminiNote && (
                    <p className="mt-2 text-center text-xs text-stone-500">{geminiNote}</p>
                  )}
                </motion.div>
              )}

              {step === 'pick' && (
                <motion.div
                  key="pick"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  className="rounded-3xl border border-stone-100 bg-white p-6 shadow-soft-lg"
                >
                  <h2 className="text-xl font-bold text-stone-800">
                    {confidence < CONFIDENCE_THRESHOLD || predictedLabel === NO_OBJECT_ID
                      ? 'Não tenho certeza'
                      : 'Qual é o objeto?'}
                  </h2>
                  <ConfidenceMeter value={confidence} />

                  {topPredictions.filter((p) => p.id !== NO_OBJECT_ID).length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">
                        Melhores hipóteses
                      </p>
                      {topPredictions
                        .filter((p) => p.id !== NO_OBJECT_ID)
                        .map((p) => {
                          const info = getWasteClass(p.id);
                          const pct = Math.round(p.confidence * 100);
                          return (
                            <button
                              key={p.id}
                              type="button"
                              disabled={saving}
                              onClick={() => handlePickClass(p.id)}
                              className="flex w-full items-center justify-between rounded-xl border border-stone-200 px-4 py-3 text-left hover:border-eco-400 hover:bg-eco-50"
                            >
                              <span className="font-medium text-stone-800">{info?.nome || p.id}</span>
                              <span className="text-sm font-bold tabular-nums text-amber-700">{pct}%</span>
                            </button>
                          );
                        })}
                    </div>
                  )}

                  <div className="mt-5 space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">
                      Todas as classes
                    </p>
                    <div className="max-h-64 space-y-1.5 overflow-y-auto pr-1">
                      {OBJECT_CLASSES.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          disabled={saving}
                          onClick={() => handlePickClass(c.id)}
                          className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm text-stone-700 hover:bg-stone-50"
                        >
                          <span>{c.nome}</span>
                          <span className="text-xs text-stone-400">{c.categoria}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  {geminiSecondOpinionEnabled && (
                    <button
                      type="button"
                      disabled={geminiBusy || saving}
                      onClick={askGeminiSecondOpinion}
                      className="mt-4 w-full rounded-xl border border-purple-200 bg-purple-50 py-2.5 text-sm font-semibold text-purple-700 hover:bg-purple-100 disabled:opacity-60"
                    >
                      {geminiBusy ? 'Consultando Gemini…' : 'Pedir segunda opinião'}
                    </button>
                  )}
                  {geminiNote && (
                    <p className="mt-2 text-center text-xs text-stone-500">{geminiNote}</p>
                  )}
                </motion.div>
              )}

              {step === 'result' && finalInfo && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  className="rounded-3xl border border-stone-100 bg-white p-6 shadow-soft-lg"
                >
                  {registered && (
                    <div className="mb-4 flex items-center gap-2 rounded-xl bg-green-50 px-3 py-2 text-sm font-semibold text-green-700">
                      <Check size={16} />
                      Registrado
                    </div>
                  )}
                  <h2 className="text-xl font-bold text-stone-800">Resultado</h2>
                  <div className={`mt-4 rounded-2xl border p-5 ${styles.bg} ${styles.border}`}>
                    <div className={`text-2xl font-black ${styles.text}`}>{finalInfo.nome}</div>
                    <div className="mt-2 text-sm font-medium text-stone-700">
                      Categoria: {finalInfo.categoria}
                    </div>
                    <div className="mt-1 text-sm font-medium text-stone-700">
                      Lixeira: {binColor}
                    </div>
                    <ConfidenceMeter value={confidence} compact />
                    <div className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-stone-100 bg-white px-3 py-1.5 shadow-sm">
                      <Sparkles size={16} className="text-amber-500" />
                      <span className="text-sm font-bold text-green-600">+{points} pts</span>
                    </div>
                    {userCorrected && (
                      <p className="mt-2 text-xs text-stone-500">Corrigido pelo usuário</p>
                    )}
                  </div>
                  <div className="mt-4 rounded-2xl border border-stone-100 bg-stone-50 p-4">
                    <h3 className="mb-1 font-semibold text-stone-800">Orientação de descarte</h3>
                    <p className="text-sm leading-relaxed text-stone-600">{finalInfo.dica}</p>
                  </div>

                  {nearbyPoints.length > 0 && (
                    <div className="mt-4 rounded-2xl border border-stone-100 bg-white p-4">
                      <h3 className="mb-1 flex items-center gap-2 font-semibold text-stone-800">
                        <MapPin size={18} className="text-blue-600" />
                        Pontos de coleta reais
                      </h3>
                      <p className="mb-3 text-[11px] leading-snug text-stone-400">
                        {COLLECTION_POINTS_DISCLAIMER}
                      </p>
                      <div className="space-y-2.5">
                        {nearbyPoints.map((place) => (
                          <a
                            key={`${place.name}-${place.address}`}
                            href={place.mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block rounded-xl border border-stone-100 bg-stone-50 p-3 transition-colors hover:border-blue-200 hover:bg-blue-50/40"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="text-sm font-bold text-stone-800">{place.name}</p>
                                <p className="mt-0.5 text-xs leading-relaxed text-stone-600">
                                  {place.address}
                                </p>
                                <p className="mt-1 text-[11px] text-stone-400">
                                  {place.city}
                                  {place.cep ? ` · CEP ${place.cep}` : ''}
                                  {' · '}
                                  {place.source}
                                </p>
                              </div>
                              <ExternalLink size={14} className="mt-0.5 shrink-0 text-blue-500" />
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => navigate('/guia')}
                    className="mt-4 w-full rounded-xl border-2 border-stone-200 py-3 text-sm font-medium text-stone-700 hover:border-eco-500 hover:text-eco-600"
                  >
                    Ver Guia Sustentável
                  </button>
                </motion.div>
              )}

              {step === 'idle' && (
                <motion.div
                  key="hint"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col justify-center rounded-3xl border border-dashed border-stone-200 bg-white/60 p-8 text-center text-stone-500"
                >
                  <p className="text-sm">
                    Capture um resíduo ou envie uma foto. Você confirma o resultado antes de
                    registrar os pontos.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default WasteClassifier;
