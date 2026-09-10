// Servido de public/ — sem processamento do bundler, com URL estável.
const logoUrl = "/logo.png";

type LogoProps = {
  /** "wordmark" usa a arte completa; "compact" mostra só o halter. */
  variant?: "wordmark" | "compact";
  /** Altura em px. A largura acompanha a proporção original da arte. */
  height?: number;
  className?: string;
  priority?: boolean;
};

// Proporção da arte original (589 x 192 após o recorte).
const RATIO = 589 / 192;
// O halter ocupa os primeiros ~36% da largura da arte.
const COMPACT_RATIO = 0.362;

export function Logo({
  variant = "wordmark",
  height = 30,
  className,
  priority
}: LogoProps) {
  const width = Math.round(height * RATIO);

  if (variant === "compact") {
    return (
      <span
        className={`logo logo--compact ${className ?? ""}`}
        style={{ width: Math.round(width * COMPACT_RATIO), height }}
        role="img"
        aria-label="IntelliGym"
      >
        <img
          src={logoUrl}
          alt=""
          width={width}
          height={height}
          decoding="async"
          loading={priority ? "eager" : "lazy"}
        />
      </span>
    );
  }

  return (
    <img
      className={`logo ${className ?? ""}`}
      src={logoUrl}
      alt="IntelliGym"
      width={width}
      height={height}
      decoding="async"
      loading={priority ? "eager" : "lazy"}
      // fetchpriority acelera o LCP da landing, onde o logo é o primeiro
      // elemento visual acima da dobra.
      fetchPriority={priority ? "high" : "auto"}
    />
  );
}
