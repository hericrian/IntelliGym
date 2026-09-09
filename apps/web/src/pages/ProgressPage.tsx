import { PainBars } from "../components/PainBars";
import { achievements, painRecords, weeklyStats } from "../mocks/intelligym";

const metrics = [
  { label: "Frequência semanal", value: "4/5" },
  { label: "Treinos no mês", value: "14" },
  { label: "Carga média", value: "+8%", accent: true },
  { label: "Duração total", value: "12h 20m" },
  { label: "Peso corporal", value: "86 kg" },
  { label: "Sequência", value: `${weeklyStats.streak} dias`, accent: true }
];

export function ProgressPage() {
  return (
    <div className="app-page">
      <div className="page-title-row">
        <div>
          <span className="section-kicker">Progresso</span>
          <h1>Evolução visual do treino</h1>
          <p>Números do mês e a resposta da dor a cada sessão registrada.</p>
        </div>
      </div>

      <section
        className="metric-grid u-stagger"
        aria-label="Indicadores do mês"
      >
        {metrics.map((metric) => (
          <article
            className={
              metric.accent ? "metric-card metric-card--accent" : "metric-card"
            }
            key={metric.label}
          >
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
          </article>
        ))}
      </section>

      <section className="content-grid content-grid--two">
        <article className="panel-card">
          <h2>Dor antes e depois dos treinos</h2>
          <PainBars records={painRecords} />
        </article>
        <article className="panel-card">
          <h2>Metas e conquistas</h2>
          <ul className="chip-row" aria-label="Conquistas">
            {achievements.map((achievement) => (
              <li className="soft-chip" key={achievement}>
                {achievement}
              </li>
            ))}
          </ul>
          <p>
            Próxima meta: concluir 5 sessões sem aumento de dor acima de 4/10.
          </p>
        </article>
      </section>
    </div>
  );
}
