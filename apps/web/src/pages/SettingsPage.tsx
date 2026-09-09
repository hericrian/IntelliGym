export function SettingsPage() {
  return (
    <div className="app-page">
      <div className="page-title-row">
        <div>
          <span className="section-kicker">Configuracoes</span>
          <h1>Preferencias da plataforma</h1>
        </div>
      </div>
      <section className="content-grid content-grid--two">
        <article className="panel-card">
          <h2>Notificacoes</h2>
          <label className="toggle-row"><span>Lembretes de treino</span><input type="checkbox" defaultChecked /></label>
          <label className="toggle-row"><span>Alertas de recuperacao</span><input type="checkbox" defaultChecked /></label>
        </article>
        <article className="panel-card">
          <h2>Privacidade e plano</h2>
          <p>Firebase Auth, Firestore e Storage entram como fonte real quando as variaveis forem preenchidas.</p>
          <span className="soft-chip">Plano Free</span>
          <span className="soft-chip">Premium futuro</span>
        </article>
      </section>
    </div>
  );
}

