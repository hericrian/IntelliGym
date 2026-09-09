import { Link } from "react-router-dom";

import { achievements, weeklyStats, workouts } from "../mocks/intelligym";

const metrics = [
  { label: "Sequência", value: `${weeklyStats.streak} dias`, accent: true },
  {
    label: "Progresso da semana",
    value: `${weeklyStats.weeklyProgress}%`,
    accent: false
  },
  {
    label: "Tempo treinado",
    value: `${weeklyStats.trainedMinutes} min`,
    accent: false
  },
  {
    label: "Treinos concluídos",
    value: `${weeklyStats.completed}`,
    accent: false
  }
];

const fullDayNames: Record<string, string> = {
  Seg: "Segunda-feira",
  Ter: "Terça-feira",
  Qua: "Quarta-feira",
  Qui: "Quinta-feira",
  Sex: "Sexta-feira",
  Sáb: "Sábado",
  Sab: "Sábado",
  Dom: "Domingo"
};

export function AppDashboardPage() {
  const todayWorkout = workouts[0];

  return (
    <div className="app-page">
      <section className="dashboard-hero">
        <div className="dashboard-hero__copy">
          <span className="section-kicker">Hoje</span>
          <h1>Seu plano está pronto para uma sessão segura e produtiva.</h1>
          <p>
            Foco em fortalecimento, controle de impacto e consistência semanal.
            Use o botão de dor se qualquer desconforto passar do esperado.
          </p>
          <div className="hero-actions">
            <Link className="hero-button" to={`/app/treino/${todayWorkout.id}`}>
              Iniciar treino
            </Link>
            <Link
              className="hero-button hero-button--secondary"
              to="/app/gerar-treino"
            >
              Gerar novo treino
            </Link>
          </div>
        </div>
        <article className="today-card">
          <span className="hero-pill">{todayWorkout.focus}</span>
          <strong>{todayWorkout.title}</strong>
          <p className="today-card__meta">
            <span>{todayWorkout.duration} min</span>
            <span aria-hidden="true">·</span>
            <span>{todayWorkout.location}</span>
            <span aria-hidden="true">·</span>
            <span>intensidade {todayWorkout.intensity}</span>
          </p>
        </article>
      </section>

      <section className="metric-grid u-stagger" aria-label="Resumo da semana">
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
          <div className="panel-card__header">
            <div>
              <span className="section-kicker">Semana</span>
              <h2>Sequência planejada</h2>
            </div>
            <strong>
              {weeklyStats.completed}/5
              <span className="u-visually-hidden"> treinos concluídos</span>
            </strong>
          </div>
          <ul className="week-strip" aria-label="Dias da semana">
            {weeklyStats.sequence.map((item) => {
              const state = item.done
                ? "concluído"
                : item.planned
                  ? "planejado"
                  : "descanso";
              const modifier = item.done
                ? " week-day--done"
                : item.planned
                  ? ""
                  : " week-day--off";

              return (
                <li className={`week-day${modifier}`} key={item.day}>
                  <span aria-hidden="true">{item.day}</span>
                  <span className="u-visually-hidden">
                    {fullDayNames[item.day] ?? item.day}: {state}
                  </span>
                </li>
              );
            })}
          </ul>
        </article>

        <article className="panel-card">
          <div className="panel-card__header">
            <div>
              <span className="section-kicker">Saúde</span>
              <h2>Evolução da dor</h2>
            </div>
            <strong>{weeklyStats.painTrend}%</strong>
          </div>
          <p>
            O registro inicial considera o histórico de menisco lateral direito
            informado por você — é contexto para adaptar o treino, não um
            diagnóstico.
          </p>
          <Link className="text-link" to="/app/dor-e-recuperacao">
            Abrir recuperação
          </Link>
        </article>
      </section>

      <section className="content-grid content-grid--three">
        <article className="panel-card">
          <span className="section-kicker">Objetivo</span>
          <h2>{weeklyStats.goal}</h2>
          <p>
            Prioridade: técnica, amplitude tolerada e progressão semanal
            controlada.
          </p>
        </article>
        <article className="panel-card">
          <span className="section-kicker">Equipamentos</span>
          <h2>Halteres, mini band, bike</h2>
          <p>O inventário define quais exercícios o gerador pode sugerir.</p>
          <Link className="text-link" to="/app/equipamentos">
            Editar equipamentos
          </Link>
        </article>
        <article className="panel-card">
          <span className="section-kicker">IA</span>
          <h2>Assistente pronto</h2>
          <p>
            Adapte o treino, troque um exercício ou descreva um desconforto em
            linguagem natural.
          </p>
          <Link className="text-link" to="/app/assistente">
            Conversar agora
          </Link>
        </article>
      </section>

      <section className="panel-card">
        <div className="panel-card__header">
          <div>
            <span className="section-kicker">Conquistas</span>
            <h2>Marcos da semana</h2>
          </div>
        </div>
        <div className="chip-row">
          {achievements.map((achievement) => (
            <span className="soft-chip" key={achievement}>
              {achievement}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
