import { SKELETON, type Landmark } from "./geometry";
import type { Cue } from "./exercises";

type Palette = { line: string; joint: string; alert: string; warn: string };

/**
 * Desenha o esqueleto sobre o vídeo. O canvas é espelhado junto com a imagem,
 * então os pontos normalizados entram direto, sem inverter x.
 */
export function drawPose(
  ctx: CanvasRenderingContext2D,
  landmarks: Landmark[],
  cues: Cue[],
  palette: Palette
) {
  const { width, height } = ctx.canvas;
  ctx.clearRect(0, 0, width, height);
  if (landmarks.length === 0) return;

  const flagged = new Set<number>();
  let worst: "warn" | "error" | null = null;

  for (const cue of cues) {
    if (cue.severity === "ok") continue;
    if (cue.severity === "error") worst = "error";
    else if (worst !== "error") worst = "warn";
    cue.joints?.forEach((joint) => flagged.add(joint));
  }

  const alertColor = worst === "error" ? palette.alert : palette.warn;
  const point = (index: number) => {
    const lm = landmarks[index];
    return lm
      ? { x: lm.x * width, y: lm.y * height, v: lm.visibility ?? 1 }
      : null;
  };

  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  for (const [from, to] of SKELETON) {
    const a = point(from);
    const b = point(to);
    if (!a || !b || a.v < 0.35 || b.v < 0.35) continue;

    const highlighted = flagged.has(from) && flagged.has(to);
    ctx.strokeStyle = highlighted ? alertColor : palette.line;
    ctx.lineWidth = highlighted ? 6 : 4;
    ctx.globalAlpha = highlighted ? 1 : 0.85;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }

  ctx.globalAlpha = 1;

  for (let index = 0; index < landmarks.length; index += 1) {
    // Rosto (0–10) não acrescenta nada à leitura da técnica.
    if (index <= 10) continue;
    const p = point(index);
    if (!p || p.v < 0.35) continue;

    const highlighted = flagged.has(index);
    ctx.fillStyle = highlighted ? alertColor : palette.joint;
    ctx.beginPath();
    ctx.arc(p.x, p.y, highlighted ? 8 : 5, 0, Math.PI * 2);
    ctx.fill();

    if (highlighted) {
      ctx.strokeStyle = alertColor;
      ctx.globalAlpha = 0.35;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 15, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }
}
