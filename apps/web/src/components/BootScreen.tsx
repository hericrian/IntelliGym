import { Logo } from "./Logo";

type BootScreenProps = {
  message?: string;
};

/**
 * O painel só aparece depois de 120ms (delay no CSS): em carregamentos
 * rápidos o usuário nunca chega a ver um flash de "carregando".
 */
export function BootScreen({
  message = "Preparando sua experiência."
}: BootScreenProps) {
  return (
    <main className="boot-shell">
      <div className="boot-panel">
        <h1 className="u-visually-hidden">IntelliGym</h1>
        <Logo height={30} priority />
        <p role="status">{message}</p>
        <span className="spinner" aria-hidden="true" />
      </div>
    </main>
  );
}
