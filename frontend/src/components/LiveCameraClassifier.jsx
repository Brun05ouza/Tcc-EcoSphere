import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Camera } from 'lucide-react';
import { classifyElement } from '../services/localClassifier';
import { getWasteClass, NO_OBJECT_ID } from '../data/wasteKnowledge';

const PREDICT_INTERVAL_MS = 300;
const SMOOTH_WINDOW = 5;

/** Região central padrão quando não há contraste suficiente. */
const DEFAULT_BOX = { x: 18, y: 16, w: 64, h: 58 };

function averageTopPredictions(history) {
  if (!history.length) return [];
  const totals = new Map();
  history.forEach((preds) => {
    preds.forEach(({ id, confidence }) => {
      totals.set(id, (totals.get(id) || 0) + confidence);
    });
  });
  const n = history.length;
  return [...totals.entries()]
    .map(([id, sum]) => ({ id, confidence: sum / n }))
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 3);
}

/**
 * Encontra uma região de interesse pela saturação/contraste
 * (marcação visual — não é bounding box de um detector YOLO).
 * Retorna { x, y, w, h } em % do frame.
 */
function findFocusBox(video) {
  try {
    const size = 48;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx || video.videoWidth < 16) return DEFAULT_BOX;

    ctx.drawImage(video, 0, 0, size, size);
    const { data } = ctx.getImageData(0, 0, size, size);

    let meanR = 0;
    let meanG = 0;
    let meanB = 0;
    const n = size * size;
    for (let i = 0; i < data.length; i += 4) {
      meanR += data[i];
      meanG += data[i + 1];
      meanB += data[i + 2];
    }
    meanR /= n;
    meanG /= n;
    meanB /= n;

    const grid = 8;
    const cell = size / grid;
    let best = { score: -1, gx: 2, gy: 2 };

    for (let gy = 0; gy < grid; gy += 1) {
      for (let gx = 0; gx < grid; gx += 1) {
        let score = 0;
        let count = 0;
        const x0 = Math.floor(gx * cell);
        const y0 = Math.floor(gy * cell);
        const x1 = Math.floor((gx + 1) * cell);
        const y1 = Math.floor((gy + 1) * cell);
        for (let y = y0; y < y1; y += 1) {
          for (let x = x0; x < x1; x += 1) {
            const i = (y * size + x) * 4;
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const sat = Math.max(r, g, b) - Math.min(r, g, b);
            const contrast =
              Math.abs(r - meanR) + Math.abs(g - meanG) + Math.abs(b - meanB);
            // Penaliza bordas extremas (muitas vezes fundo/mão)
            const edgePen =
              gx === 0 || gy === 0 || gx === grid - 1 || gy === grid - 1 ? 0.65 : 1;
            score += (sat * 0.55 + contrast * 0.45) * edgePen;
            count += 1;
          }
        }
        score /= count || 1;
        if (score > best.score) best = { score, gx, gy };
      }
    }

    // Caixa 3×3 células centrada no pico
    const span = 3;
    let x0 = Math.max(0, best.gx - 1);
    let y0 = Math.max(0, best.gy - 1);
    let x1 = Math.min(grid, x0 + span);
    let y1 = Math.min(grid, y0 + span);
    x0 = Math.max(0, x1 - span);
    y0 = Math.max(0, y1 - span);

    const pad = 2;
    return {
      x: (x0 / grid) * 100 + pad,
      y: (y0 / grid) * 100 + pad,
      w: ((x1 - x0) / grid) * 100 - pad * 2,
      h: ((y1 - y0) / grid) * 100 - pad * 2,
    };
  } catch (_) {
    return DEFAULT_BOX;
  }
}

function smoothBox(prev, next, alpha = 0.35) {
  if (!prev) return next;
  return {
    x: prev.x + (next.x - prev.x) * alpha,
    y: prev.y + (next.y - prev.y) * alpha,
    w: prev.w + (next.w - prev.w) * alpha,
    h: prev.h + (next.h - prev.h) * alpha,
  };
}

/**
 * Câmera ao vivo com predição a cada ~300ms, marcação do objeto e Capturar.
 */
export default function LiveCameraClassifier({ enabled = true, onCapture, onError }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const historyRef = useRef([]);
  const boxRef = useRef(null);
  const timerRef = useRef(null);
  const [permissionError, setPermissionError] = useState(null);
  const [liveTop, setLiveTop] = useState([]);
  const [focusBox, setFocusBox] = useState(DEFAULT_BOX);
  const [ready, setReady] = useState(false);

  const stopCamera = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    historyRef.current = [];
    boxRef.current = null;
    setReady(false);
  }, []);

  useEffect(() => {
    if (!enabled) {
      stopCamera();
      return undefined;
    }

    let cancelled = false;

    const start = async () => {
      setPermissionError(null);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
        setReady(true);
      } catch (err) {
        console.error('[LiveCameraClassifier]', err);
        const msg =
          err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError'
            ? 'Permissão da câmera negada. Libere o acesso nas configurações do navegador ou envie uma imagem.'
            : 'Não foi possível abrir a câmera. Verifique se outro app está usando o dispositivo ou envie uma imagem.';
        setPermissionError(msg);
        onError?.(msg);
      }
    };

    start();
    return () => {
      cancelled = true;
      stopCamera();
    };
  }, [enabled, onError, stopCamera]);

  useEffect(() => {
    if (!enabled || !ready || permissionError) return undefined;

    const tick = async () => {
      const video = videoRef.current;
      if (!video || video.readyState < 2 || video.videoWidth < 16) return;
      try {
        const preds = await classifyElement(video);
        historyRef.current = [...historyRef.current, preds].slice(-SMOOTH_WINDOW);
        setLiveTop(averageTopPredictions(historyRef.current));

        const nextBox = findFocusBox(video);
        const smoothed = smoothBox(boxRef.current, nextBox);
        boxRef.current = smoothed;
        setFocusBox(smoothed);
      } catch (err) {
        console.warn('[LiveCameraClassifier] predicao:', err?.message || err);
      }
    };

    timerRef.current = setInterval(tick, PREDICT_INTERVAL_MS);
    tick();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [enabled, ready, permissionError]);

  const handleCapture = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);

    const predictions = liveTop.length
      ? liveTop
      : averageTopPredictions(historyRef.current);

    const preview = canvas.toDataURL('image/jpeg', 0.92);
    onCapture?.({
      preview,
      canvas,
      predictions: predictions.length ? predictions : [{ id: NO_OBJECT_ID, confidence: 1 }],
    });
  };

  const top = liveTop[0];
  const waste = top ? getWasteClass(top.id) : null;
  const pct = top ? Math.round((top.confidence || 0) * 100) : 0;
  const isEmpty = !top || top.id === NO_OBJECT_ID;
  const boxColor = isEmpty ? 'border-white/50' : 'border-eco-400';
  const labelBg = isEmpty ? 'bg-stone-900/80' : 'bg-eco-600/95';

  if (permissionError) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-5 text-sm text-amber-900">
        {permissionError}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-2xl bg-black shadow-inner">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="h-56 w-full object-cover sm:h-64"
        />

        {/* Marcação do objeto detectado */}
        <div
          className="pointer-events-none absolute z-10 transition-[left,top,width,height] duration-300 ease-out"
          style={{
            left: `${focusBox.x}%`,
            top: `${focusBox.y}%`,
            width: `${focusBox.w}%`,
            height: `${focusBox.h}%`,
          }}
        >
          <div
            className={`relative h-full w-full rounded-xl border-2 ${boxColor} shadow-[0_0_0_9999px_rgba(0,0,0,0.18)]`}
          >
            {/* Cantos em L */}
            <span className="absolute -left-0.5 -top-0.5 h-4 w-4 rounded-tl-md border-l-[3px] border-t-[3px] border-white" />
            <span className="absolute -right-0.5 -top-0.5 h-4 w-4 rounded-tr-md border-r-[3px] border-t-[3px] border-white" />
            <span className="absolute -bottom-0.5 -left-0.5 h-4 w-4 rounded-bl-md border-b-[3px] border-l-[3px] border-white" />
            <span className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-br-md border-b-[3px] border-r-[3px] border-white" />

            {/* Label dentro da caixa (evita corte do overflow) */}
            <div
              className={`absolute left-1.5 top-1.5 flex max-w-[calc(100%-0.75rem)] items-center gap-1.5 truncate rounded-md px-2 py-1 text-[11px] font-bold text-white shadow-md ${labelBg}`}
            >
              <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-white" />
              <span className="truncate">
                {isEmpty ? 'Procurando objeto…' : waste?.nome || top.id}
              </span>
              {!isEmpty && (
                <span className="shrink-0 tabular-nums text-white/90">{pct}%</span>
              )}
            </div>

            {/* Linha de varredura suave */}
            {!isEmpty && (
              <div className="absolute inset-x-2 top-[15%] h-px animate-pulse bg-gradient-to-r from-transparent via-eco-300/80 to-transparent" />
            )}
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/80 to-transparent px-4 py-3">
          {isEmpty ? (
            <p className="text-center text-sm font-semibold text-white">
              Aponte a câmera para um resíduo
            </p>
          ) : (
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-white">{waste?.nome || top.id}</p>
                <p className="text-[11px] font-medium text-white/70">
                  área marcada · estimativa — não é precisa
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black tabular-nums leading-none text-amber-300">{pct}%</p>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-white/60">
                  confiança
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={handleCapture}
        disabled={!ready}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-eco-600 px-6 py-3 font-medium text-white shadow-md transition-all hover:bg-eco-700 disabled:opacity-60"
      >
        <Camera size={18} />
        Capturar
      </button>
    </div>
  );
}
