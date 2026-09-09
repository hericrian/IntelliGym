import { achievements, painRecords, weeklyStats } from "../mocks/intelligym";

export function ProgressPage() {
  return (
    <div className="app-page">
      <div className="page-title-row">
        <div>
          <span className="section-kicker">Progresso</span>
          <h1>Evolucao visual do treino</h1>
        </div>
      </div>
      <section className="metric-grid">
        {[
          ["Frequencia semanal", "4/5"],
          ["Treinos no mes", "14"],
          ["Carga media", "+8%"],
          ["Duracao total", "12h 20m"],
          ["Peso corporal", "86 kg"],
          ["Sequencia", `${weeklyStats.streak} dias`]
        ].map(([label, value]) => (
          <article className="metric-card" key={label}><span>{label}</span><strong>{value}</strong></article>
        ))}
      </section>
      <section className="content-grid content-grid--two">
        <article className="panel-card">
          <h2>Dor antes e depois dos treinos</h2>
          <div className="bar-list">
            {painRecords.map((record) => (
              <div className="bar-row" key={record.day}>
                <span>{record.day}</span>
                <div><i style={{ width: `${record.before * 10}%` }} /><b style={{ width: `${record.after * 10}%` }} /></div>
                <small>{record.note}</small>
              </div>
            ))}
          </div>
        </article>
        <article className="panel-card">
          <h2>Metas e conquistas</h2>
          <div className="chip-row">
            {achievements.map((achievement) => <span className="soft-chip" key={achievement}>{achievement}</span>)}
          </div>
          <p>Proxima meta: concluir 5 sessoes sem aumento de dor acima de 4/10.</p>
        </article>
      </section>
    </div>
  );
}

