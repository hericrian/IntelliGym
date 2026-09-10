import {
  angleAt,
  clamp,
  Debounced,
  lateralGap,
  LM,
  midpoint,
  progressBetween,
  Smoothed,
  tiltFromVertical,
  visible,
  type Landmark
} from "./geometry";

export type CueSeverity = "ok" | "warn" | "error";

export type Cue = {
  id: string;
  message: string;
  severity: CueSeverity;
  /** Pontos a destacar no esqueleto enquanto a dica estiver ativa. */
  joints?: number[];
};

export type Analysis = {
  /** Fase do movimento, para a barra de progresso e o contador. */
  phase: "aguardando" | "descendo" | "subindo" | "embaixo" | "em cima";
  /** 0–100: quanto do movimento já foi percorrido. */
  progress: number;
  reps: number;
  cues: Cue[];
  /** 0–100: qualidade da execução observada até agora. */
  score: number;
  /** Enquadramento insuficiente: nada de útil a dizer sobre a técnica. */
  framing: "ok" | "parcial";
};

export type Analyzer = {
  id: string;
  label: string;
  /** Como a pessoa deve se posicionar em relação à câmera. */
  setup: string;
  reset(): void;
  analyze(landmarks: Landmark[]): Analysis;
};

const FRAMING_CUE: Cue = {
  id: "framing",
  message: "Afaste o celular até aparecer o corpo inteiro no quadro.",
  severity: "warn"
};

/** Base comum: contagem de repetições por histerese num ângulo principal. */
class RepCounter {
  private down = false;
  reps = 0;

  constructor(
    private readonly enterDown: number,
    private readonly exitDown: number
  ) {}

  /** `angle` cai quando o movimento desce. Devolve true no quadro da repetição. */
  push(angle: number) {
    if (!this.down && angle <= this.enterDown) {
      this.down = true;
      return false;
    }

    if (this.down && angle >= this.exitDown) {
      this.down = false;
      this.reps += 1;
      return true;
    }

    return false;
  }

  get isDown() {
    return this.down;
  }

  reset() {
    this.down = false;
    this.reps = 0;
  }
}

/* ========================================================================
   Agachamento
   ======================================================================== */
function createSquatAnalyzer(): Analyzer {
  const kneeAngle = new Smoothed(0.4);
  const torso = new Smoothed(0.3);
  const counter = new RepCounter(120, 158);

  const shallow = new Debounced(6, 10);
  const leaning = new Debounced(6, 10);
  const valgus = new Debounced(6, 12);
  const uneven = new Debounced(8, 12);

  let bottomKnee = 180;
  let penalties = 0;
  let repsSeen = 0;
  let previousKnee = 180;

  return {
    id: "squat",
    label: "Agachamento",
    setup:
      "Fique de lado ou em diagonal para a câmera, com o corpo inteiro no quadro.",
    reset() {
      kneeAngle.reset();
      torso.reset();
      counter.reset();
      shallow.reset();
      leaning.reset();
      valgus.reset();
      uneven.reset();
      bottomKnee = 180;
      penalties = 0;
      repsSeen = 0;
      previousKnee = 180;
    },
    analyze(lm) {
      const needed = [
        LM.leftHip,
        LM.rightHip,
        LM.leftKnee,
        LM.rightKnee,
        LM.leftAnkle,
        LM.rightAnkle,
        LM.leftShoulder,
        LM.rightShoulder
      ];

      if (!visible(lm, needed, 0.45)) {
        return {
          phase: "aguardando",
          progress: 0,
          reps: counter.reps,
          cues: [FRAMING_CUE],
          score: 100,
          framing: "parcial"
        };
      }

      const leftKnee = angleAt(
        lm[LM.leftHip],
        lm[LM.leftKnee],
        lm[LM.leftAnkle]
      );
      const rightKnee = angleAt(
        lm[LM.rightHip],
        lm[LM.rightKnee],
        lm[LM.rightAnkle]
      );
      const knee = kneeAngle.push((leftKnee + rightKnee) / 2);

      const shoulders = midpoint(lm[LM.leftShoulder], lm[LM.rightShoulder]);
      const hips = midpoint(lm[LM.leftHip], lm[LM.rightHip]);
      const lean = torso.push(tiltFromVertical(hips, shoulders));

      if (counter.isDown) bottomKnee = Math.min(bottomKnee, knee);

      const completed = counter.push(knee);
      if (completed) {
        repsSeen += 1;
        if (bottomKnee > 110) penalties += 1;
        bottomKnee = 180;
      }

      const cues: Cue[] = [];

      // Profundidade: cobrada quando a pessoa estaciona no meio do caminho.
      // Não pode depender do estado "embaixo" do contador — quem agacha só
      // até 130° nunca chega lá, e é exatamente quem precisa do aviso.
      const descending = knee < previousKnee - 0.6;
      previousKnee = knee;

      const parkedHalfway = knee > 118 && knee < 152 && !descending;
      if (shallow.push(parkedHalfway)) {
        cues.push({
          id: "depth",
          message: "Desça um pouco mais, dentro do que não dói.",
          severity: "warn",
          joints: [LM.leftKnee, LM.rightKnee]
        });
      }

      const isLeaning = leaning.push(lean > 45 && counter.isDown);
      if (isLeaning) {
        cues.push({
          id: "torso",
          message:
            "Tronco muito à frente. Abra o peito e leve o quadril para trás.",
          severity: "error",
          joints: [LM.leftShoulder, LM.rightShoulder, LM.leftHip, LM.rightHip]
        });
      }

      // Valgo: joelhos entrando para dentro da linha quadril–tornozelo. Em
      // coordenadas de mundo o eixo x é a largura do corpo, então a medida
      // vale mesmo com a câmera na diagonal.
      const hipWidth = lateralGap(lm[LM.leftHip], lm[LM.rightHip]);
      const kneeWidth = lateralGap(lm[LM.leftKnee], lm[LM.rightKnee]);
      const ankleWidth = lateralGap(lm[LM.leftAnkle], lm[LM.rightAnkle]);
      const collapsing =
        counter.isDown &&
        hipWidth > 0.05 &&
        kneeWidth < Math.max(ankleWidth, hipWidth) * 0.72;

      if (valgus.push(collapsing)) {
        cues.push({
          id: "valgus",
          message: "Joelhos caindo para dentro. Empurre-os na direção dos pés.",
          severity: "error",
          joints: [LM.leftKnee, LM.rightKnee]
        });
      }

      if (uneven.push(counter.isDown && Math.abs(leftKnee - rightKnee) > 18)) {
        cues.push({
          id: "symmetry",
          message: "Peso desigual entre as pernas. Distribua nos dois pés.",
          severity: "warn",
          joints: [LM.leftKnee, LM.rightKnee]
        });
      }

      const errors = cues.filter((cue) => cue.severity === "error").length;
      const warns = cues.filter((cue) => cue.severity === "warn").length;
      const repPenalty = repsSeen > 0 ? (penalties / repsSeen) * 25 : 0;
      const score = clamp(100 - errors * 22 - warns * 9 - repPenalty, 0, 100);

      return {
        phase: counter.isDown
          ? knee < 105
            ? "embaixo"
            : "descendo"
          : knee > 165
            ? "em cima"
            : "subindo",
        progress: progressBetween(knee, 170, 90),
        reps: counter.reps,
        cues,
        score,
        framing: "ok"
      };
    }
  };
}

/* ========================================================================
   Ponte de glúteo
   ======================================================================== */
function createHipBridgeAnalyzer(): Analyzer {
  const hipAngle = new Smoothed(0.4);
  const counter = new RepCounter(140, 163);
  const shortRange = new Debounced(6, 10);
  const uneven = new Debounced(8, 12);
  const kneeDrift = new Debounced(8, 12);

  return {
    id: "hip-bridge",
    label: "Ponte de glúteo",
    setup:
      "Deite-se de lado para a câmera, com ombro, quadril e joelho visíveis.",
    reset() {
      hipAngle.reset();
      counter.reset();
      shortRange.reset();
      uneven.reset();
      kneeDrift.reset();
    },
    analyze(lm) {
      const needed = [
        LM.leftShoulder,
        LM.rightShoulder,
        LM.leftHip,
        LM.rightHip,
        LM.leftKnee,
        LM.rightKnee
      ];

      if (!visible(lm, needed, 0.4)) {
        return {
          phase: "aguardando",
          progress: 0,
          reps: counter.reps,
          cues: [FRAMING_CUE],
          score: 100,
          framing: "parcial"
        };
      }

      const left = angleAt(
        lm[LM.leftShoulder],
        lm[LM.leftHip],
        lm[LM.leftKnee]
      );
      const right = angleAt(
        lm[LM.rightShoulder],
        lm[LM.rightHip],
        lm[LM.rightKnee]
      );
      const hip = hipAngle.push((left + right) / 2);

      counter.push(hip);

      const cues: Cue[] = [];

      if (shortRange.push(!counter.isDown && hip > 145 && hip < 162)) {
        cues.push({
          id: "range",
          message: "Suba mais o quadril até alinhar joelho, quadril e ombro.",
          severity: "warn",
          joints: [LM.leftHip, LM.rightHip]
        });
      }

      if (uneven.push(Math.abs(left - right) > 15)) {
        cues.push({
          id: "symmetry",
          message: "Um lado sobe mais que o outro. Empurre igual nos dois pés.",
          severity: "warn",
          joints: [LM.leftHip, LM.rightHip]
        });
      }

      const kneeSpread = lateralGap(lm[LM.leftKnee], lm[LM.rightKnee]);
      const hipSpread = lateralGap(lm[LM.leftHip], lm[LM.rightHip]) || 0.001;
      if (kneeDrift.push(kneeSpread < hipSpread * 0.7)) {
        cues.push({
          id: "knees",
          message: "Joelhos fechando. Mantenha-os na largura do quadril.",
          severity: "error",
          joints: [LM.leftKnee, LM.rightKnee]
        });
      }

      const errors = cues.filter((cue) => cue.severity === "error").length;
      const warns = cues.filter((cue) => cue.severity === "warn").length;

      return {
        phase: counter.isDown ? "descendo" : hip > 168 ? "em cima" : "subindo",
        progress: progressBetween(hip, 130, 172),
        reps: counter.reps,
        cues,
        score: clamp(100 - errors * 22 - warns * 10, 0, 100),
        framing: "ok"
      };
    }
  };
}

/* ========================================================================
   Step-up (apoio unilateral)
   ======================================================================== */
function createStepUpAnalyzer(): Analyzer {
  const kneeAngle = new Smoothed(0.4);
  const counter = new RepCounter(125, 160);
  const pelvisDrop = new Debounced(8, 12);
  const torsoSway = new Debounced(8, 12);

  return {
    id: "step-up",
    label: "Step-up",
    setup:
      "Fique de frente para a câmera, com o degrau e o corpo inteiro no quadro.",
    reset() {
      kneeAngle.reset();
      counter.reset();
      pelvisDrop.reset();
      torsoSway.reset();
    },
    analyze(lm) {
      const needed = [
        LM.leftHip,
        LM.rightHip,
        LM.leftKnee,
        LM.rightKnee,
        LM.leftAnkle,
        LM.rightAnkle,
        LM.leftShoulder,
        LM.rightShoulder
      ];

      if (!visible(lm, needed, 0.45)) {
        return {
          phase: "aguardando",
          progress: 0,
          reps: counter.reps,
          cues: [FRAMING_CUE],
          score: 100,
          framing: "parcial"
        };
      }

      // A perna de apoio é a que está com o pé mais baixo na imagem.
      const leftIsSupport = lm[LM.leftAnkle].y > lm[LM.rightAnkle].y;
      const hip = leftIsSupport ? LM.leftHip : LM.rightHip;
      const knee = leftIsSupport ? LM.leftKnee : LM.rightKnee;
      const ankle = leftIsSupport ? LM.leftAnkle : LM.rightAnkle;

      const supportKnee = kneeAngle.push(angleAt(lm[hip], lm[knee], lm[ankle]));
      counter.push(supportKnee);

      const cues: Cue[] = [];

      // Trendelenburg: o quadril livre cai para o lado durante o apoio.
      const hipTilt = Math.abs(lm[LM.leftHip].y - lm[LM.rightHip].y);
      const shoulderWidth =
        lateralGap(lm[LM.leftShoulder], lm[LM.rightShoulder]) || 0.001;
      if (pelvisDrop.push(hipTilt > shoulderWidth * 0.28)) {
        cues.push({
          id: "pelvis",
          message: "Quadril caindo para o lado. Mantenha a bacia nivelada.",
          severity: "error",
          joints: [LM.leftHip, LM.rightHip]
        });
      }

      const shoulders = midpoint(lm[LM.leftShoulder], lm[LM.rightShoulder]);
      const hips = midpoint(lm[LM.leftHip], lm[LM.rightHip]);
      if (torsoSway.push(tiltFromVertical(hips, shoulders) > 18)) {
        cues.push({
          id: "sway",
          message:
            "Tronco jogando para o lado. Suba com a força da perna de apoio.",
          severity: "warn",
          joints: [LM.leftShoulder, LM.rightShoulder]
        });
      }

      const errors = cues.filter((cue) => cue.severity === "error").length;
      const warns = cues.filter((cue) => cue.severity === "warn").length;

      return {
        phase: counter.isDown
          ? "subindo"
          : supportKnee > 165
            ? "em cima"
            : "descendo",
        progress: progressBetween(supportKnee, 170, 100),
        reps: counter.reps,
        cues,
        score: clamp(100 - errors * 24 - warns * 10, 0, 100),
        framing: "ok"
      };
    }
  };
}

/* ========================================================================
   Empurrar (supino / desenvolvimento com halteres)
   ======================================================================== */
function createPressAnalyzer(): Analyzer {
  const elbowAngle = new Smoothed(0.4);
  const counter = new RepCounter(100, 155);
  const uneven = new Debounced(8, 12);
  const locked = new Debounced(6, 10);
  const shortRange = new Debounced(8, 12);

  return {
    id: "press",
    label: "Empurrar com halteres",
    setup:
      "Enquadre do quadril para cima, de lado ou em diagonal para a câmera.",
    reset() {
      elbowAngle.reset();
      counter.reset();
      uneven.reset();
      locked.reset();
      shortRange.reset();
    },
    analyze(lm) {
      const needed = [
        LM.leftShoulder,
        LM.rightShoulder,
        LM.leftElbow,
        LM.rightElbow,
        LM.leftWrist,
        LM.rightWrist
      ];

      if (!visible(lm, needed, 0.4)) {
        return {
          phase: "aguardando",
          progress: 0,
          reps: counter.reps,
          cues: [FRAMING_CUE],
          score: 100,
          framing: "parcial"
        };
      }

      const left = angleAt(
        lm[LM.leftShoulder],
        lm[LM.leftElbow],
        lm[LM.leftWrist]
      );
      const right = angleAt(
        lm[LM.rightShoulder],
        lm[LM.rightElbow],
        lm[LM.rightWrist]
      );
      const elbow = elbowAngle.push((left + right) / 2);

      counter.push(elbow);

      const cues: Cue[] = [];

      if (uneven.push(Math.abs(left - right) > 20)) {
        cues.push({
          id: "symmetry",
          message: "Um braço está à frente do outro. Suba os dois juntos.",
          severity: "warn",
          joints: [LM.leftElbow, LM.rightElbow]
        });
      }

      if (locked.push(elbow > 176)) {
        cues.push({
          id: "lock",
          message: "Não trave o cotovelo no topo. Pare um pouco antes.",
          severity: "warn",
          joints: [LM.leftElbow, LM.rightElbow]
        });
      }

      if (shortRange.push(counter.isDown && elbow > 105 && elbow < 130)) {
        cues.push({
          id: "range",
          message: "Amplitude curta. Desça até o cotovelo formar cerca de 90°.",
          severity: "warn",
          joints: [LM.leftElbow, LM.rightElbow]
        });
      }

      const warns = cues.filter((cue) => cue.severity === "warn").length;

      return {
        phase: counter.isDown ? "embaixo" : elbow > 165 ? "em cima" : "subindo",
        progress: progressBetween(elbow, 90, 170),
        reps: counter.reps,
        cues,
        score: clamp(100 - warns * 11, 0, 100),
        framing: "ok"
      };
    }
  };
}

/* ========================================================================
   Genérico: sem regras de técnica, só enquadramento
   ======================================================================== */
function createGenericAnalyzer(): Analyzer {
  return {
    id: "generic",
    label: "Enquadramento",
    setup: "Posicione o corpo inteiro no quadro e execute no seu ritmo.",
    reset() {},
    analyze(lm) {
      const ok = visible(
        lm,
        [LM.leftShoulder, LM.rightShoulder, LM.leftHip, LM.rightHip],
        0.4
      );

      return {
        phase: "aguardando",
        progress: 0,
        reps: 0,
        cues: ok
          ? [
              {
                id: "generic",
                message:
                  "Ainda não temos correção automática para este exercício. Use o espelho e o guia ao lado.",
                severity: "ok"
              }
            ]
          : [FRAMING_CUE],
        score: 100,
        framing: ok ? "ok" : "parcial"
      };
    }
  };
}

const factories: Record<string, () => Analyzer> = {
  squat: createSquatAnalyzer,
  "hip-bridge": createHipBridgeAnalyzer,
  "step-up": createStepUpAnalyzer,
  press: createPressAnalyzer,
  generic: createGenericAnalyzer
};

/** Palavras no nome do exercício que apontam para cada analisador. */
const keywords: Array<[RegExp, string]> = [
  [/agachament|squat|afundo|avanç|lunge|cadeira extensora/i, "squat"],
  [/ponte|bridge|elevaç(ão|ao) de quadril|hip thrust/i, "hip-bridge"],
  [/step[- ]?up|subida|degrau/i, "step-up"],
  [
    /supino|press|desenvolvimento|flex(ão|ao) de bra(ç|c)o|push[- ]?up/i,
    "press"
  ]
];

/** Ids exatos da biblioteca do app têm prioridade sobre a busca por nome. */
const byExerciseId: Record<string, string> = {
  "box-squat": "squat",
  "hip-bridge": "hip-bridge",
  "step-up-low": "step-up",
  "incline-db-press": "press"
};

export function resolveAnalyzerKey(exerciseId?: string, exerciseName?: string) {
  if (exerciseId && byExerciseId[exerciseId]) return byExerciseId[exerciseId];

  const haystack = `${exerciseName ?? ""} ${exerciseId ?? ""}`;
  for (const [pattern, key] of keywords) {
    if (pattern.test(haystack)) return key;
  }

  return "generic";
}

export function createAnalyzer(key: string): Analyzer {
  return (factories[key] ?? createGenericAnalyzer)();
}

/** Rótulo e instrução de posicionamento, sem instanciar um analisador. */
export function describeAnalyzer(key: string) {
  const { id, label, setup } = createAnalyzer(key);
  return { id, label, setup, supported: isSupported(key) };
}

export function isSupported(key: string) {
  return key !== "generic";
}
