import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode
} from "react";
import { createPortal } from "react-dom";

const CLOSE_DURATION = 200;

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  wide?: boolean;
  children: ReactNode;
  footer?: ReactNode;
};

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Modal acessível: Escape, clique no scrim, foco preso enquanto aberto e foco
 * devolvido ao gatilho ao fechar. A entrada vem do CSS (@starting-style) e a
 * saída mantém o nó montado por CLOSE_DURATION para a transição terminar.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  wide,
  children,
  footer
}: DialogProps) {
  const [mounted, setMounted] = useState(open);
  const [closing, setClosing] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (open) {
      setMounted(true);
      setClosing(false);
      return;
    }

    if (!mounted) return;

    if (prefersReducedMotion()) {
      setMounted(false);
      return;
    }

    setClosing(true);
    const timer = window.setTimeout(() => setMounted(false), CLOSE_DURATION);
    return () => window.clearTimeout(timer);
  }, [open, mounted]);

  useEffect(() => {
    if (!mounted || closing) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Foca o próprio contêiner, não o primeiro botão: assim o leitor de tela
    // anuncia o título e a descrição do diálogo antes de qualquer controle.
    cardRef.current?.focus();

    return () => {
      document.body.style.overflow = overflow;
      previouslyFocused.current?.focus();
    };
  }, [mounted, closing]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = Array.from(
        cardRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [onClose]
  );

  if (!mounted) return null;

  return createPortal(
    <div
      className="modal-backdrop"
      data-closing={closing ? "true" : undefined}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      onKeyDown={handleKeyDown}
    >
      <div
        className={wide ? "modal-card modal-card--wide" : "modal-card"}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        ref={cardRef}
        tabIndex={-1}
      >
        <div className="modal-card__header">
          <h2 id={titleId}>{title}</h2>
          <button
            className="ghost-button modal-card__close"
            type="button"
            onClick={onClose}
            aria-label="Fechar"
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        {description ? (
          <p id={descriptionId} className="modal-card__description">
            {description}
          </p>
        ) : null}
        {children}
        {footer ? <div className="modal-card__actions">{footer}</div> : null}
      </div>
    </div>,
    document.body
  );
}
