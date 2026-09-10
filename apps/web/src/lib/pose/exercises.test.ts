import { describe, expect, it } from "vitest";

import { createAnalyzer, resolveAnalyzerKey } from "./exercises";
import { angleAt, LM, tiltFromVertical, type Landmark } from "./geometry";

/* ------------------------------------------------------------------------
   Gerador de corpos sintéticos em coordenadas de mundo.

   Reproduz o formato que o MediaPipe entrega em `worldLandmarks`: metros,
   origem no centro do quadril, x = largura do corpo, y = altura (positivo
   para baixo), z = profundidade. Assim dá para exercitar os analisadores sem
   câmera e sem o modelo de visão.
   ------------------------------------------------------------------------ */

type Body = {
  /** Ângulo do joelho em graus: 180 = perna estendida, 90 = coxa paralela. */
  knee: number;
  /** Inclinação do tronco à frente, em graus (0 = ereto). */
  torsoLean?: number;
  /** Metade da distância entre os joelhos, em metros. */
  kneeHalfSpread?: number;
  /** Diferença de ângulo entre a perna direita e a esquerda. */
  kneeAsymmetry?: number;
  visibility?: number;
};

const HIP_HALF = 0.09; // meia largura do quadril
const SHIN = 0.42;
const THIGH = 0.42;
const TORSO = 0.5;

const toRad = (degrees: number) => (degrees * Math.PI) / 180;

function buildBody({
  knee,
  torsoLean = 0,
  kneeHalfSpread = HIP_HALF,
  kneeAsymmetry = 0,
  visibility = 0.95
}: Body): Landmark[] {
  const points: Landmark[] = Array.from({ length: 33 }, () => ({
    x: 0,
    y: 0,
    z: 0,
    visibility
  }));

  const set = (index: number, x: number, y: number, z: number) => {
    points[index] = { x, y, z, visibility };
  };

  const sides = [
    {
      sign: -1,
      hip: LM.leftHip,
      knee: LM.leftKnee,
      ankle: LM.leftAnkle,
      shoulder: LM.leftShoulder,
      delta: 0
    },
    {
      sign: 1,
      hip: LM.rightHip,
      knee: LM.rightKnee,
      ankle: LM.rightAnkle,
      shoulder: LM.rightShoulder,
      delta: kneeAsymmetry
    }
  ];

  for (const side of sides) {
    const hipX = side.sign * HIP_HALF;
    set(side.hip, hipX, 0, 0);

    // Coxa: sai do quadril para baixo e para a frente conforme o joelho dobra.
    // O desvio fica em z (profundidade), que é o plano sagital.
    const flex = toRad(180 - (knee + side.delta));
    const kneeX = side.sign * kneeHalfSpread;
    const kneeY = THIGH * Math.cos(flex / 2);
    const kneeZ = -THIGH * Math.sin(flex / 2);
    set(side.knee, kneeX, kneeY, kneeZ);

    // Canela: espelha o ângulo da coxa, deixando o tornozelo sob o quadril.
    const ankleX = side.sign * HIP_HALF;
    const ankleY = kneeY + SHIN * Math.cos(flex / 2);
    const ankleZ = kneeZ + SHIN * Math.sin(flex / 2);
    set(side.ankle, ankleX, ankleY, ankleZ);

    // Tronco: sobe do quadril, inclinando para a frente (−z).
    const lean = toRad(torsoLean);
    set(side.shoulder, hipX, -TORSO * Math.cos(lean), -TORSO * Math.sin(lean));
  }

  return points;
}

/** Repete o mesmo quadro várias vezes, para os debounces acumularem. */
function feed(
  analyzer: ReturnType<typeof createAnalyzer>,
  body: Body,
  frames: number
) {
  let last = analyzer.analyze(buildBody(body));
  for (let index = 1; index < frames; index += 1) {
    last = analyzer.analyze(buildBody(body));
  }
  return last;
}

/** Uma repetição completa: em pé -> fundo -> em pé. */
function performRep(
  analyzer: ReturnType<typeof createAnalyzer>,
  bottom: Partial<Body> = {},
  framesPerStep = 4
) {
  for (const knee of [175, 150, 120]) {
    feed(analyzer, { knee, ...bottom }, framesPerStep);
  }
  feed(analyzer, { knee: 92, ...bottom }, framesPerStep * 3);
  for (const knee of [120, 150, 175]) {
    feed(analyzer, { knee, ...bottom }, framesPerStep * 2);
  }
}

/* ------------------------------------------------------------------------ */

describe("geometria do corpo sintético", () => {
  it("reproduz o ângulo de joelho pedido", () => {
    for (const target of [180, 150, 120, 90]) {
      const body = buildBody({ knee: target });
      const measured = angleAt(
        body[LM.leftHip],
        body[LM.leftKnee],
        body[LM.leftAnkle]
      );
      expect(measured).toBeCloseTo(target, 0);
    }
  });

  it("reproduz a inclinação de tronco pedida", () => {
    const body = buildBody({ knee: 120, torsoLean: 60 });
    const lean = tiltFromVertical(body[LM.leftHip], body[LM.leftShoulder]);
    expect(lean).toBeCloseTo(60, 0);
  });

  it("mede o mesmo ângulo com a câmera em qualquer posição", () => {
    // Girar o corpo em torno do eixo vertical simula mudar o ponto de vista:
    // em coordenadas de mundo, o ângulo medido não pode mudar.
    const body = buildBody({ knee: 100 });
    const rotate = (p: Landmark, angle: number): Landmark => ({
      ...p,
      x: p.x * Math.cos(angle) - p.z * Math.sin(angle),
      z: p.x * Math.sin(angle) + p.z * Math.cos(angle)
    });

    const front = angleAt(
      body[LM.leftHip],
      body[LM.leftKnee],
      body[LM.leftAnkle]
    );
    const turned = body.map((p) => rotate(p, toRad(75)));
    const side = angleAt(
      turned[LM.leftHip],
      turned[LM.leftKnee],
      turned[LM.leftAnkle]
    );

    expect(side).toBeCloseTo(front, 3);
  });
});

describe("mapeamento de exercício para analisador", () => {
  it("reconhece os exercícios da biblioteca pelo id", () => {
    expect(resolveAnalyzerKey("box-squat")).toBe("squat");
    expect(resolveAnalyzerKey("hip-bridge")).toBe("hip-bridge");
    expect(resolveAnalyzerKey("step-up-low")).toBe("step-up");
    expect(resolveAnalyzerKey("incline-db-press")).toBe("press");
  });

  it("reconhece exercícios novos pelo nome", () => {
    expect(resolveAnalyzerKey("custom-1", "Agachamento livre")).toBe("squat");
    expect(resolveAnalyzerKey("custom-2", "Ponte de glúteo unilateral")).toBe(
      "hip-bridge"
    );
    expect(resolveAnalyzerKey("custom-3", "Desenvolvimento militar")).toBe(
      "press"
    );
  });

  it("cai no genérico quando não conhece o movimento", () => {
    expect(resolveAnalyzerKey("custom-9", "Rosca direta")).toBe("generic");
  });
});

describe("analisador de agachamento", () => {
  it("conta uma repetição por ciclo completo", () => {
    const analyzer = createAnalyzer("squat");

    performRep(analyzer);
    expect(analyzer.analyze(buildBody({ knee: 175 })).reps).toBe(1);

    performRep(analyzer);
    performRep(analyzer);
    expect(analyzer.analyze(buildBody({ knee: 175 })).reps).toBe(3);
  });

  it("não conta repetição quando a pessoa apenas oscila em pé", () => {
    const analyzer = createAnalyzer("squat");

    for (let index = 0; index < 6; index += 1) {
      feed(analyzer, { knee: 175 }, 4);
      feed(analyzer, { knee: 158 }, 4);
    }

    expect(analyzer.analyze(buildBody({ knee: 175 })).reps).toBe(0);
  });

  it("pede mais profundidade quando o agachamento para no meio", () => {
    const analyzer = createAnalyzer("squat");

    feed(analyzer, { knee: 170 }, 4);
    const shallow = feed(analyzer, { knee: 132 }, 16);

    expect(shallow.cues.map((cue) => cue.id)).toContain("depth");
  });

  it("avisa quando o tronco cai muito à frente", () => {
    const analyzer = createAnalyzer("squat");

    feed(analyzer, { knee: 170 }, 4);
    const leaning = feed(analyzer, { knee: 100, torsoLean: 62 }, 18);

    const torso = leaning.cues.find((cue) => cue.id === "torso");
    expect(torso).toBeDefined();
    expect(torso?.severity).toBe("error");
  });

  it("não confunde inclinação natural do agachamento com erro", () => {
    const analyzer = createAnalyzer("squat");

    feed(analyzer, { knee: 170 }, 4);
    const normal = feed(analyzer, { knee: 95, torsoLean: 30 }, 18);

    expect(normal.cues.map((cue) => cue.id)).not.toContain("torso");
  });

  it("avisa quando os joelhos caem para dentro", () => {
    const analyzer = createAnalyzer("squat");

    feed(analyzer, { knee: 170 }, 4);
    const valgus = feed(analyzer, { knee: 100, kneeHalfSpread: 0.025 }, 18);

    const cue = valgus.cues.find((item) => item.id === "valgus");
    expect(cue).toBeDefined();
    expect(cue?.severity).toBe("error");
    expect(cue?.joints).toContain(LM.leftKnee);
  });

  it("aponta assimetria entre as pernas", () => {
    const analyzer = createAnalyzer("squat");

    feed(analyzer, { knee: 170 }, 4);
    const uneven = feed(analyzer, { knee: 100, kneeAsymmetry: 30 }, 20);

    expect(uneven.cues.map((cue) => cue.id)).toContain("symmetry");
  });

  it("não reclama de nada numa execução limpa", () => {
    const analyzer = createAnalyzer("squat");

    feed(analyzer, { knee: 172 }, 4);
    const clean = feed(analyzer, { knee: 95 }, 18);

    expect(clean.cues).toHaveLength(0);
    expect(clean.score).toBe(100);
  });

  it("derruba a nota quando há erro de execução", () => {
    const analyzer = createAnalyzer("squat");

    feed(analyzer, { knee: 170 }, 4);
    const bad = feed(
      analyzer,
      { knee: 100, torsoLean: 62, kneeHalfSpread: 0.025 },
      20
    );

    expect(bad.score).toBeLessThan(70);
  });

  it("pede enquadramento quando o corpo não aparece inteiro", () => {
    const analyzer = createAnalyzer("squat");
    const result = analyzer.analyze(buildBody({ knee: 120, visibility: 0.1 }));

    expect(result.framing).toBe("parcial");
    expect(result.cues.map((cue) => cue.id)).toContain("framing");
  });

  it("zera o contador ao reiniciar", () => {
    const analyzer = createAnalyzer("squat");

    performRep(analyzer);
    expect(analyzer.analyze(buildBody({ knee: 175 })).reps).toBe(1);

    analyzer.reset();
    expect(analyzer.analyze(buildBody({ knee: 175 })).reps).toBe(0);
  });
});

describe("analisador genérico", () => {
  it("não inventa correção para exercício sem regras", () => {
    const analyzer = createAnalyzer("generic");
    const result = analyzer.analyze(buildBody({ knee: 120 }));

    expect(result.reps).toBe(0);
    expect(result.cues.every((cue) => cue.severity !== "error")).toBe(true);
  });
});
