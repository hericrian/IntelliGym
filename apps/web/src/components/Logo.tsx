// Servido de public/ — sem processamento do bundler, com URL estável.
const logoUrl = "/logo.png";

type LogoProps = {
  /** "wordmark" usa a arte inteira; "compact" enquadra só o halter. */
  variant?: "wordmark" | "compact";
  /** Altura em px. A largura acompanha a proporção do enquadramento. */
  height?: number;
  className?: string;
  priority?: boolean;
};

/* Medidas da arte em public/logo.png (400 × 267). Ficam aqui, num só lugar,
   para o dia em que a marca for trocada. */
const ART_RATIO = 400 / 267;
/** Fração da altura da arte ocupada pelo halter, antes do wordmark começar. */
const MARK_HEIGHT_FRACTION = 0.655;
/** O halter usa a largura toda da arte, então o recorte fica largo e baixo. */
const COMPACT_RATIO = ART_RATIO / MARK_HEIGHT_FRACTION;

export function Logo({
  variant = "wordmark",
  height = 30,
  className,
  priority
}: LogoProps) {
  if (variant === "compact") {
    return (
      <span
        className={`logo logo--compact ${className ?? ""}`}
        role="img"
        aria-label="IntelliGym"
        style={{
          width: Math.round(height * COMPACT_RATIO),
          height,
          backgroundImage: `url(${logoUrl})`,
          // Encaixa a largura da arte na caixa e corta o wordmark embaixo.
          backgroundSize: "100% auto",
          backgroundPosition: "top center",
          backgroundRepeat: "no-repeat"
        }}
      />
    );
  }

  return (
    <img
      className={`logo ${className ?? ""}`}
      src={logoUrl}
      alt="IntelliGym"
      width={Math.round(height * ART_RATIO)}
      height={height}
      decoding="async"
      loading={priority ? "eager" : "lazy"}
      // fetchpriority acelera o LCP da landing, onde o logo é o primeiro
      // elemento visual acima da dobra.
      fetchPriority={priority ? "high" : "auto"}
    />
  );
}
