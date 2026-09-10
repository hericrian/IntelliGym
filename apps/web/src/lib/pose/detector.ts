import type { PoseLandmarker } from "@mediapipe/tasks-vision";

/**
 * Runtime do MediaPipe. O binário WebAssembly tem ~11 MB por variante, grande
 * demais para versionar no repositório, então vem da CDN com a versão fixada.
 * O service worker guarda a resposta no primeiro uso, e a partir daí o coach
 * funciona offline. Para auto-hospedar, copie
 * `node_modules/@mediapipe/tasks-vision/wasm` para `public/mediapipe/wasm`
 * e troque esta constante por "/mediapipe/wasm".
 */
const WASM_PATH =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm";

/** O modelo é pequeno (5,5 MB) e fica no próprio domínio. */
const MODEL_PATH = "/models/pose_landmarker_lite.task";

let instance: PoseLandmarker | null = null;
let pending: Promise<PoseLandmarker> | null = null;

async function build(): Promise<PoseLandmarker> {
  // Importação dinâmica: o bundle principal não carrega nada disso até a
  // pessoa ligar a câmera.
  const vision = await import("@mediapipe/tasks-vision");
  const fileset = await vision.FilesetResolver.forVisionTasks(WASM_PATH);

  const options = {
    baseOptions: { modelAssetPath: MODEL_PATH, delegate: "GPU" as const },
    runningMode: "VIDEO" as const,
    numPoses: 1,
    minPoseDetectionConfidence: 0.5,
    minPosePresenceConfidence: 0.5,
    minTrackingConfidence: 0.5,
    outputSegmentationMasks: false
  };

  try {
    return await vision.PoseLandmarker.createFromOptions(fileset, options);
  } catch {
    // Alguns aparelhos não expõem WebGL para o delegate; a CPU dá conta do
    // modelo "lite", só com mais latência.
    return vision.PoseLandmarker.createFromOptions(fileset, {
      ...options,
      baseOptions: { modelAssetPath: MODEL_PATH, delegate: "CPU" }
    });
  }
}

/** Carrega uma única vez por sessão e reaproveita entre exercícios. */
export function loadPoseLandmarker(): Promise<PoseLandmarker> {
  if (instance) return Promise.resolve(instance);
  if (pending) return pending;

  pending = build()
    .then((landmarker) => {
      instance = landmarker;
      return landmarker;
    })
    .catch((error) => {
      pending = null;
      throw error;
    });

  return pending;
}

export function isPoseLandmarkerReady() {
  return instance !== null;
}
