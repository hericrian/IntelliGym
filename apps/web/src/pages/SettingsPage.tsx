export function SettingsPage() {
  return (
    <div className="app-page">
      <div className="page-title-row">
        <div>
          <span className="section-kicker">Configurações</span>
          <h1>Preferências da plataforma</h1>
        </div>
      </div>

      <section className="content-grid content-grid--two">
        <article className="panel-card">
          <h2>Notificações</h2>
          <div>
            <label className="toggle-row">
              <span>Lembretes de treino</span>
              <input type="checkbox" defaultChecked />
            </label>
            <label className="toggle-row">
              <span>Alertas de recuperação</span>
              <input type="checkbox" defaultChecked />
            </label>
          </div>
        </article>

        <article className="panel-card">
          <h2>Privacidade e plano</h2>
          <p>
            Autenticação, banco e armazenamento passam a ser a fonte real assim
            que as variáveis de ambiente forem preenchidas. Até lá, seus dados
            ficam apenas neste navegador.
          </p>
          <ul className="chip-row" aria-label="Planos">
            <li className="soft-chip">Plano Free</li>
            <li className="soft-chip">Premium em breve</li>
          </ul>
        </article>
      </section>
    </div>
  );
}
