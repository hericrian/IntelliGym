import { useEffect, useRef, useState } from "react";

type CameraCoachProps = { exerciseName: string };

export function CameraCoach({ exerciseName }: CameraCoachProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [active, setActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
      if (videoRef.current) videoRef.current.srcObject = stream;
      setActive(true);
    } catch {
      setError("Não foi possível abrir a câmera. Verifique a permissão do navegador.");
    }
  }

  function stop() {
    const stream = videoRef.current?.srcObject;
    if (stream instanceof MediaStream) stream.getTracks().forEach((track) => track.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
    setActive(false);
  }

  useEffect(() => () => stop(), []);

  return (
    <section className="camera-coach">
      <div>
        <span className="section-kicker">Câmera opcional · beta</span>
        <h3>Confira a técnica de {exerciseName}</h3>
        <p>Posicione o corpo inteiro no quadro, treine sem dor e use o espelho/guia como referência. Nenhuma imagem é enviada ou gravada por este recurso.</p>
      </div>
      {active ? <video className="camera-coach__video" ref={videoRef} autoPlay muted playsInline /> : null}
      {error ? <p className="feedback feedback--error">{error}</p> : null}
      <div className="camera-coach__checks">
        <span>✓ Coluna neutra</span><span>✓ Movimento controlado</span><span>✓ Sem dor aguda</span>
      </div>
      <button className="ghost-button" onClick={active ? stop : () => void start()}>{active ? "Desligar câmera" : "Ligar câmera"}</button>
      <small>O feedback automático de postura exige validação por visão computacional e não substitui um profissional.</small>
    </section>
  );
}
