import { motion } from "motion/react";
import { Link } from "react-router-dom";

import { achievements, weeklyStats, workouts } from "../mocks/intelligym";

export function AppDashboardPage() {
  const todayWorkout = workouts[0];

  return (
    <div className="app-page">
      <section className="dashboard-hero">
        <div>
          <span className="section-kicker">Hoje</span>
          <h1>Seu plano esta pronto para uma sessao segura e produtiva.</h1>
          <p>
            Foco em fortalecimento, controle de impacto e consistencia semanal. Use o botao de dor se qualquer
            desconforto passar do esperado.
          </p>
          <div className="hero-actions">
            <Link className="hero-button" to={`/app/treino/${todayWorkout.id}`}>
              Iniciar treino
            </Link>
            <Link className="hero-button hero-button--secondary" to="/app/gerar-treino">
              Gerar novo treino
            </Link>
          </div>
        </div>
        <article className="today-card">
          <span>{todayWorkout.focus}</span>
          <strong>{todayWorkout.title}</strong>
          <p>{todayWorkout.duration} min · {todayWorkout.location} · intensidade {todayWorkout.intensity}</p>
        </article>
      </section>

      <section className="metric-grid">
        {[
          ["Sequencia", `${weeklyStats.streak} dias`],
          ["Progresso da semana", `${weeklyStats.weeklyProgress}%`],
          ["Tempo treinado", `${weeklyStats.trainedMinutes} min`],
          ["Treinos concluidos", `${weeklyStats.completed}`]
        ].map(([label, value], index) => (
          <motion.article
            className="metric-card"
            key={label}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <span>{label}</span>
            <strong>{value}</strong>
          </motion.article>
        ))}
      </section>

      <section className="content-grid content-grid--two">
        <article className="panel-card">
          <div className="panel-card__header">
            <div>
              <span className="section-kicker">Semana</span>
              <h2>Sequencia planejada</h2>
            </div>
            <strong>{weeklyStats.completed}/5</strong>
          </div>
          <div className="week-strip">
            {weeklyStats.sequence.map((item) => (
              <span className={item.done ? "week-day week-day--done" : item.planned ? "week-day" : "week-day week-day--off"} key={item.day}>
                {item.day}
              </span>
            ))}
          </div>
        </article>

        <article className="panel-card">
          <div className="panel-card__header">
            <div>
              <span className="section-kicker">Saude</span>
              <h2>Evolucao da dor</h2>
            </div>
            <strong>{weeklyStats.painTrend}%</strong>
          </div>
          <p>Registro inicial considera historico de menisco lateral direito como contexto informado pelo usuario.</p>
          <Link className="text-link" to="/app/dor-e-recuperacao">Abrir recuperacao</Link>
        </article>
      </section>

      <section className="content-grid content-grid--three">
        <article className="panel-card">
          <span className="section-kicker">Objetivo</span>
          <h2>{weeklyStats.goal}</h2>
          <p>Prioridade: tecnica, amplitude tolerada e progressao semanal controlada.</p>
        </article>
        <article className="panel-card">
          <span className="section-kicker">Equipamentos</span>
          <h2>Halteres, mini band, bike</h2>
          <Link className="text-link" to="/app/equipamentos">Editar equipamentos</Link>
        </article>
        <article className="panel-card">
          <span className="section-kicker">IA</span>
          <h2>Assistente pronto</h2>
          <p>Adapte treino, troque exercicio ou explique desconforto em linguagem natural.</p>
          <Link className="text-link" to="/app/assistente">Conversar agora</Link>
        </article>
      </section>

      <section className="panel-card">
        <div className="panel-card__header">
          <div>
            <span className="section-kicker">Conquistas</span>
            <h2>Marco da semana</h2>
          </div>
        </div>
        <div className="chip-row">
          {achievements.map((achievement) => <span className="soft-chip" key={achievement}>{achievement}</span>)}
        </div>
      </section>
    </div>
  );
}

