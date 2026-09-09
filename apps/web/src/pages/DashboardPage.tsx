import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import { apiRequest } from "../services/api.service";
import { uploadUserFile } from "../services/storage.service";

type MeResponse = {
  uid: string;
  email: string | null;
  claims: Record<string, unknown>;
};

type WorkoutsResponse = {
  workouts: Array<{
    id: string;
    title: string;
    focus: string;
    durationMinutes: number;
    equipment: string[];
  }>;
};

type GeneratedWorkoutResponse = WorkoutsResponse & {
  summary: string;
  generatedBy: string;
};

type PainRecordResponse = {
  id: string;
  saved: boolean;
};

export function DashboardPage() {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const [me, setMe] = useState<MeResponse | null>(null);
  const [workouts, setWorkouts] = useState<WorkoutsResponse["workouts"]>([]);
  const [apiError, setApiError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [objective, setObjective] = useState<string>(profile?.objetivo ?? "hipertrofia");
  const [level, setLevel] = useState<string>(profile?.nivel ?? "iniciante");
  const [location, setLocation] = useState<string>(profile?.localTreino ?? "casa");
  const [equipment, setEquipment] = useState("halteres, mini band");
  const [limitations, setLimitations] = useState(profile?.limitacoes.join(", ") ?? "");
  const [generatedSummary, setGeneratedSummary] = useState<string | null>(null);
  const [generatedBy, setGeneratedBy] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [painIntensity, setPainIntensity] = useState(0);
  const [painLocation, setPainLocation] = useState("joelho");
  const [painNotes, setPainNotes] = useState("");
  const [painMessage, setPainMessage] = useState<string | null>(null);

  useEffect(() => {
    void Promise.all([
      apiRequest<MeResponse>("/api/me").then(setMe),
      apiRequest<WorkoutsResponse>("/api/workouts").then((payload) => setWorkouts(payload.workouts))
    ]).catch((error: Error) => setApiError(error.message));
  }, []);

  return (
    <div className="page-shell dashboard-shell">
      <section className="dashboard-topbar">
        <div>
          <span className="section-kicker">Area autenticada</span>
          <h1 className="section-title">Painel IntelliGym</h1>
        </div>
        <div className="hero-actions">
          <Link className="hero-button hero-button--secondary" to="/">
            Voltar ao site
          </Link>
          <button className="hero-button" onClick={() => void signOut()}>
            Sair
          </button>
        </div>
      </section>

      <section className="feature-grid">
        <article className="feature-card">
          <span className="hero-pill feature-card__label">Sessao</span>
          <h3>{profile?.nome ?? user?.displayName ?? "Usuario IntelliGym"}</h3>
          <p>{user?.email ?? "Sem e-mail"}</p>
          <p>UID validado: {me?.uid ?? "Aguardando API..."}</p>
        </article>
        <article className="feature-card">
          <span className="hero-pill feature-card__label">Firestore</span>
          <h3>Perfil sincronizado</h3>
          <p>Objetivo atual: {profile?.objetivo ?? "Ainda nao definido"}</p>
          <button className="hero-button hero-button--secondary" onClick={() => void refreshProfile()}>
            Atualizar perfil
          </button>
        </article>
        <article className="feature-card">
          <span className="hero-pill feature-card__label">Storage</span>
          <h3>Upload de arquivo</h3>
          <p>{uploadMessage ?? "Envie uma imagem para testar o Firebase Storage."}</p>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={async (event) => {
              const file = event.target.files?.[0];

              if (!file || !user) {
                return;
              }

              try {
                setUploadMessage("Enviando arquivo...");
                const url = await uploadUserFile({
                  uid: user.uid,
                  folder: "profile",
                  file,
                  onProgress: setUploadProgress
                });
                setUploadMessage(`Upload concluido com sucesso: ${url}`);
              } catch (error) {
                setUploadMessage(error instanceof Error ? error.message : "Falha no upload.");
              }
            }}
          />
          {uploadProgress !== null ? <p>Progresso: {uploadProgress}%</p> : null}
        </article>
      </section>

      {apiError ? <div className="feedback feedback--error">{apiError}</div> : null}

      <section className="section">
        <div className="section-heading">
          <span className="section-kicker">IA autenticada</span>
          <h2 className="section-title">Gerar treino com FastAPI</h2>
        </div>
        <form
          className="dashboard-form"
          onSubmit={async (event) => {
            event.preventDefault();
            setGenerating(true);
            setApiError(null);

            try {
              const payload = await apiRequest<GeneratedWorkoutResponse>("/api/workouts/generate", {
                method: "POST",
                body: JSON.stringify({
                  objective,
                  level,
                  location,
                  available_equipment: equipment
                    .split(",")
                    .map((item) => item.trim())
                    .filter(Boolean),
                  limitations: limitations
                    .split(",")
                    .map((item) => item.trim())
                    .filter(Boolean)
                })
              });

              setGeneratedSummary(payload.summary);
              setGeneratedBy(payload.generatedBy);
              setWorkouts(payload.workouts);
            } catch (error) {
              setApiError(error instanceof Error ? error.message : "Nao foi possivel gerar o treino.");
            } finally {
              setGenerating(false);
            }
          }}
        >
          <label className="field">
            <span>Objetivo</span>
            <select value={objective} onChange={(event) => setObjective(event.target.value)}>
              <option value="hipertrofia">Hipertrofia</option>
              <option value="emagrecimento">Emagrecimento</option>
              <option value="mobilidade">Mobilidade</option>
              <option value="reabilitacao">Reabilitacao</option>
              <option value="condicionamento">Condicionamento</option>
            </select>
          </label>
          <label className="field">
            <span>Nivel</span>
            <select value={level} onChange={(event) => setLevel(event.target.value)}>
              <option value="iniciante">Iniciante</option>
              <option value="intermediario">Intermediario</option>
              <option value="avancado">Avancado</option>
            </select>
          </label>
          <label className="field">
            <span>Local</span>
            <select value={location} onChange={(event) => setLocation(event.target.value)}>
              <option value="casa">Casa</option>
              <option value="academia">Academia</option>
              <option value="hibrido">Hibrido</option>
            </select>
          </label>
          <label className="field">
            <span>Equipamentos</span>
            <input value={equipment} onChange={(event) => setEquipment(event.target.value)} />
          </label>
          <label className="field dashboard-form__wide">
            <span>Limitacoes</span>
            <input value={limitations} onChange={(event) => setLimitations(event.target.value)} />
          </label>
          <button className="hero-button" type="submit" disabled={generating}>
            {generating ? "Gerando..." : "Gerar treino"}
          </button>
        </form>
        {generatedSummary ? (
          <div className="api-card dashboard-result">
            <div>
              <strong>Resumo gerado</strong>
              <p>{generatedSummary}</p>
            </div>
            <code>{generatedBy ?? "api"}</code>
          </div>
        ) : null}
      </section>

      <section className="section">
        <div className="section-heading">
          <span className="section-kicker">Seguranca</span>
          <h2 className="section-title">Registrar dor</h2>
        </div>
        <form
          className="dashboard-form dashboard-form--compact"
          onSubmit={async (event) => {
            event.preventDefault();
            setPainMessage(null);
            setApiError(null);

            try {
              const payload = await apiRequest<PainRecordResponse>("/api/pain-records", {
                method: "POST",
                body: JSON.stringify({
                  intensity: painIntensity,
                  location: painLocation,
                  notes: painNotes || null
                })
              });

              setPainMessage(payload.saved ? `Registro criado: ${payload.id}` : "Registro nao confirmado.");
            } catch (error) {
              setApiError(error instanceof Error ? error.message : "Nao foi possivel registrar a dor.");
            }
          }}
        >
          <label className="field">
            <span>Intensidade: {painIntensity}/10</span>
            <input
              type="range"
              min="0"
              max="10"
              value={painIntensity}
              onChange={(event) => setPainIntensity(Number(event.target.value))}
            />
          </label>
          <label className="field">
            <span>Local</span>
            <input value={painLocation} onChange={(event) => setPainLocation(event.target.value)} required />
          </label>
          <label className="field dashboard-form__wide">
            <span>Observacoes</span>
            <textarea value={painNotes} onChange={(event) => setPainNotes(event.target.value)} rows={3} />
          </label>
          <button className="hero-button hero-button--secondary" type="submit">
            Salvar registro
          </button>
        </form>
        {painMessage ? <div className="feedback feedback--success">{painMessage}</div> : null}
      </section>

      <section className="section">
        <div className="section-heading">
          <span className="section-kicker">Treinos</span>
          <h2 className="section-title">Sugestoes protegidas pela API</h2>
        </div>
        <div className="feature-grid">
          {workouts.map((workout) => (
            <article className="feature-card" key={workout.id}>
              <span className="hero-pill feature-card__label">{workout.focus}</span>
              <h3>{workout.title}</h3>
              <p>{workout.durationMinutes} minutos</p>
              <p>Equipamentos: {workout.equipment.join(", ")}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
