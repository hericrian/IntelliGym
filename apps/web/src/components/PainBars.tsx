type PainRecord = {
  day: string;
  before?: number;
  after: number;
  note: string;
};

type PainBarsProps = {
  records: PainRecord[];
  showBefore?: boolean;
};

/** Escala de dor 0–10 convertida para a fração da barra revelada. */
function clip(score: number) {
  const percent = Math.min(Math.max(score, 0), 10) * 10;
  return { clipPath: `inset(0 ${100 - percent}% 0 0 round 999px)` };
}

export function PainBars({ records, showBefore = true }: PainBarsProps) {
  return (
    <>
      <div className="legend">
        {showBefore ? (
          <span>
            <i
              style={{ background: "var(--data-before)" }}
              aria-hidden="true"
            />
            Antes do treino
          </span>
        ) : null}
        <span>
          <i style={{ background: "var(--data-after)" }} aria-hidden="true" />
          Depois do treino
        </span>
        <span>Escala 0–10</span>
      </div>

      <div className="bar-list">
        {records.map((record, index) => (
          <div className="bar-row" key={record.day}>
            <span className="bar-row__day">{record.day}</span>
            <div className="bar-row__track">
              {showBefore && record.before !== undefined ? (
                <span
                  className="bar-row__bar bar-row__bar--before"
                  style={{
                    ...clip(record.before),
                    animationDelay: `${index * 45}ms`
                  }}
                >
                  <span className="u-visually-hidden">
                    {record.day}, antes do treino: {record.before} de 10
                  </span>
                </span>
              ) : null}
              <span
                className="bar-row__bar bar-row__bar--after"
                style={{
                  ...clip(record.after),
                  animationDelay: `${index * 45 + 20}ms`
                }}
              >
                <span className="u-visually-hidden">
                  {record.day}, depois do treino: {record.after} de 10
                </span>
              </span>
            </div>
            <small>{record.note}</small>
          </div>
        ))}
      </div>
    </>
  );
}
