type ExerciseFigureProps = {
  exerciseName: string;
};

/**
 * Guia visual do exercício. Estático de propósito: a antiga animação em loop
 * infinito ficava pulsando na tela que o usuário encara durante a série —
 * distrai e não informa nada. Aqui as setas indicam a direção do movimento.
 */
export function ExerciseFigure({ exerciseName }: ExerciseFigureProps) {
  return (
    <div className="exercise-figure">
      <svg
        viewBox="0 0 200 150"
        role="img"
        aria-label={`Guia visual do movimento: ${exerciseName}`}
      >
        <g
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* figura */}
          <circle cx="86" cy="34" r="12" />
          <path d="M86 46v34" />
          <path d="M86 56l-22 14M86 56l24 12" />
          <path d="M86 80l-16 22-4 24M86 80l18 20 6 26" />

          {/* direção do movimento */}
          <path
            d="M152 44v62"
            strokeDasharray="6 7"
            strokeWidth="2"
            opacity="0.5"
          />
          <path d="M145 52l7-8 7 8" strokeWidth="2" opacity="0.75" />
          <path d="M145 98l7 8 7-8" strokeWidth="2" opacity="0.75" />

          {/* solo */}
          <path d="M40 128h120" strokeWidth="2" opacity="0.28" />
        </g>
      </svg>
    </div>
  );
}
