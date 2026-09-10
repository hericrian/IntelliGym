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

/* Medidas da arte em public/logo.png. Ficam aqui, num só lugar, para o dia em
   que a marca for trocada. */
const ART_RATIO = 589 / 192;
/** O halter ocupa os ~36% iniciais da largura; o resto é o wordmark. */
const MARK_WIDTH_FRACTION = 0.362;

export function Logo({
  variant = "wordmark",
  height = 30,
  className,
  priority
}: LogoProps) {
  const fullWidth = height * ART_RATIO;

  if (variant === "compact") {
    return (
      <span
        className={`logo logo--compact ${className ?? ""}`}
        role="img"
        aria-label="IntelliGym"
        style={{
          width: Math.round(fullWidth * MARK_WIDTH_FRACTION),
          height,
          backgroundImage: `url(${logoUrl})`,
          // Encaixa a altura da arte na caixa e corta o wordmark à direita.
          backgroundSize: "auto 100%",
          backgroundPosition: "left center",
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
      width={Math.round(fullWidth)}
      height={height}
      decoding="async"
      loading={priority ? "eager" : "lazy"}
      // fetchpriority acelera o LCP da landing, onde o logo é o primeiro
      // elemento visual acima da dobra.
      fetchPriority={priority ? "high" : "auto"}
    />
  );
}
