export function StaticHeroFallback() {
  return (
    <div className="hero-fallback" aria-hidden="true">
      <div className="hero-fallback__pulse" />
      <div className="hero-fallback__ring" />
      <div className="hero-fallback__body" />
      <div className="hero-fallback__column" />
    </div>
  );
}
