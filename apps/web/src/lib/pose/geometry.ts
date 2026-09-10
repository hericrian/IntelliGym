export type Landmark = { x: number; y: number; z: number; visibility?: number };

/** Índices dos 33 pontos do PoseLandmarker que este app usa. */
export const LM = {
  nose: 0,
  leftShoulder: 11,
  rightShoulder: 12,
  leftElbow: 13,
  rightElbow: 14,
  leftWrist: 15,
  rightWrist: 16,
  leftHip: 23,
  rightHip: 24,
  leftKnee: 25,
  rightKnee: 26,
  leftAnkle: 27,
  rightAnkle: 28,
  leftHeel: 29,
  rightHeel: 30,
  leftFoot: 31,
  rightFoot: 32
} as const;

/** Pares de pontos que formam o esqueleto desenhado sobre o vídeo. */
export const SKELETON: Array<[number, number]> = [
  [11, 12],
  [11, 13],
  [13, 15],
  [12, 14],
  [14, 16],
  [11, 23],
  [12, 24],
  [23, 24],
  [23, 25],
  [25, 27],
  [24, 26],
  [26, 28],
  [27, 31],
  [28, 32],
  [27, 29],
  [28, 30]
];

/**
 * Ângulo ABC em graus, com B no vértice, calculado em 3D.
 *
 * Os analisadores trabalham sobre os *world landmarks* do MediaPipe — metros,
 * origem no centro do quadril — e não sobre os pontos da imagem. É o que
 * torna a medida independente do ângulo da câmera: de frente, de lado ou na
 * diagonal, o joelho dobrado a 90° mede 90°.
 */
export function angleAt(a: Landmark, b: Landmark, c: Landmark) {
  const ab = { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
  const cb = { x: c.x - b.x, y: c.y - b.y, z: c.z - b.z };

  const dot = ab.x * cb.x + ab.y * cb.y + ab.z * cb.z;
  const magnitude = Math.hypot(ab.x, ab.y, ab.z) * Math.hypot(cb.x, cb.y, cb.z);
  if (magnitude === 0) return 0;

  const cos = Math.min(1, Math.max(-1, dot / magnitude));
  return (Math.acos(cos) * 180) / Math.PI;
}

/**
 * Inclinação de um segmento em relação à vertical, em graus. Considera o
 * desvio nos dois eixos horizontais, então vale para inclinar à frente
 * (sagital) e para o lado (frontal).
 */
export function tiltFromVertical(from: Landmark, to: Landmark) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dz = to.z - from.z;
  return (Math.atan2(Math.hypot(dx, dz), Math.abs(dy)) * 180) / Math.PI;
}

export function midpoint(a: Landmark, b: Landmark): Landmark {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, z: (a.z + b.z) / 2 };
}

/** Distância no plano frontal (largura), ignorando profundidade e altura. */
export function lateralGap(a: Landmark, b: Landmark) {
  return Math.abs(a.x - b.x);
}

/**
 * Média móvel exponencial. Os pontos tremem entre quadros; sem suavizar, as
 * dicas piscariam a cada frame e o contador dispararia sozinho.
 */
export class Smoothed {
  private value: number | null = null;

  constructor(private readonly alpha = 0.35) {}

  push(next: number) {
    this.value =
      this.value === null
        ? next
        : this.value + this.alpha * (next - this.value);
    return this.value;
  }

  get current() {
    return this.value ?? 0;
  }

  reset() {
    this.value = null;
  }
}

/**
 * Só aponta um erro depois de ele se manter por alguns quadros seguidos, e só
 * o retira depois de sumir por outros tantos. Evita dicas piscando.
 */
export class Debounced {
  private onFrames = 0;
  private offFrames = 0;
  private state = false;

  constructor(
    private readonly framesToOn = 5,
    private readonly framesToOff = 8
  ) {}

  push(condition: boolean) {
    if (condition) {
      this.onFrames += 1;
      this.offFrames = 0;
      if (this.onFrames >= this.framesToOn) this.state = true;
    } else {
      this.offFrames += 1;
      this.onFrames = 0;
      if (this.offFrames >= this.framesToOff) this.state = false;
    }
    return this.state;
  }

  get active() {
    return this.state;
  }

  reset() {
    this.onFrames = 0;
    this.offFrames = 0;
    this.state = false;
  }
}

export function visible(
  landmarks: Landmark[],
  indices: number[],
  threshold = 0.5
) {
  return indices.every(
    (index) => (landmarks[index]?.visibility ?? 0) >= threshold
  );
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/** Converte um intervalo de ângulo em progresso de 0 a 100. */
export function progressBetween(value: number, start: number, end: number) {
  return clamp(((value - start) / (end - start)) * 100, 0, 100);
}
