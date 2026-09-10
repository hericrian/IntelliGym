import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { SyncBadge } from "../components/SyncBadge";
import { useUserData } from "../hooks/useUserData";
import { generateWorkoutFromApi } from "../lib/api";
import { generateMockWorkout, type WorkoutPlan } from "../mocks/intelligym";

const initialForm = {
  objective: "fortalecimento",
  location: "casa",
  duration: "45",
  level: "intermediario",
  muscleGroup: "inferiores",
  equipment: "",
  limitations: "",
  intensity: "moderada",
  notes: "evitar impacto alto e priorizar controle"
};

export function GenerateWorkoutPage() {
  const { equipment, plans, savePlan } = useUserData();
  const [form, setForm] = useState(() => ({ ...initialForm, equipment: "" }));

  // O inventário chega depois da sincronização; o campo acompanha enquanto a
  // pessoa não tiver editado nada.
  const [equipmentTouched, setEquipmentTouched] = useState(false);
  useEffect(() => {
    if (!equipmentTouched) {
      setForm((current) => ({ ...current, equipment: equipment.join(", ") }));
    }
  }, [equipment, equipmentTouched]);
  const [result, setResult] = useState<WorkoutPlan | null>(null);
  const [apiNotice, setApiNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setApiNotice(null);
    setLoading(true);

    try {
      const plan = await generateWorkoutFromApi(form).catch(() => {
        setApiNotice(
          "A API ficou indisponível; usamos um plano local para você não perder o treino."
        );
        return generateMockWorkout(form);
      });
      await savePlan(plan);
      setResult(plan);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-page">
      <div className="page-title-row">
        <div>
          <span className="section-kicker">Gerador</span>
          <h1>Criar treino personalizado</h1>
          <p>
            O plano fica salvo na sua conta e aparece na aba Treinos
            {plans.length > 0 ? `, hoje com ${plans.length} plano(s).` : "."}
          </p>
        </div>
        <SyncBadge />
      </div>

      <form className="form-grid panel-card" onSubmit={handleSubmit}>
        <div className="generator-context field--wide">
          <strong>Equipamentos disponíveis</strong>
          <span>{form.equipment || "Somente peso corporal"}</span>
          <button
            type="button"
            className="ghost-button"
            onClick={() => {
              setEquipmentTouched(false);
              setForm((current) => ({
                ...current,
                equipment: equipment.join(", ")
              }));
            }}
          >
            Atualizar inventário
          </button>
        </div>

        <label className="field">
          <span>Objetivo</span>
          <select
            value={form.objective}
            onChange={(event) => update("objective", event.target.value)}
          >
            <option value="fortalecimento">Fortalecimento</option>
            <option value="condicionamento">Condicionamento</option>
            <option value="mobilidade">Mobilidade</option>
          </select>
        </label>

        <label className="field">
          <span>Onde vai treinar?</span>
          <select
            value={form.location}
            onChange={(event) => update("location", event.target.value)}
          >
            <option value="casa">Em casa</option>
            <option value="academia">Na academia</option>
          </select>
        </label>

        <label className="field">
          <span>Duração</span>
          <select
            value={form.duration}
            onChange={(event) => update("duration", event.target.value)}
          >
            <option value="20">20 minutos</option>
            <option value="30">30 minutos</option>
            <option value="45">45 minutos</option>
            <option value="60">60 minutos</option>
          </select>
        </label>

        <label className="field">
          <span>Nível</span>
          <select
            value={form.level}
            onChange={(event) => update("level", event.target.value)}
          >
            <option value="iniciante">Iniciante</option>
            <option value="intermediario">Intermediário</option>
            <option value="avancado">Avançado</option>
          </select>
        </label>

        <label className="field">
          <span>Foco</span>
          <select
            value={form.muscleGroup}
            onChange={(event) => update("muscleGroup", event.target.value)}
          >
            <option value="full body">Corpo inteiro</option>
            <option value="inferiores">Pernas e glúteos</option>
            <option value="superiores">Braços e costas</option>
            <option value="core">Core</option>
          </select>
        </label>

        <label className="field">
          <span>Intensidade</span>
          <select
            value={form.intensity}
            onChange={(event) => update("intensity", event.target.value)}
          >
            <option value="leve">Leve</option>
            <option value="moderada">Moderada</option>
            <option value="alta">Alta</option>
          </select>
        </label>

        <label className="field field--wide">
          <span>Limitações, dor ou recuperação</span>
          <input
            value={form.limitations}
            onChange={(event) => update("limitations", event.target.value)}
            placeholder="Ex.: dor no joelho ao agachar"
          />
        </label>

        <label className="field field--wide">
          <span>Observações</span>
          <textarea
            value={form.notes}
            onChange={(event) => update("notes", event.target.value)}
            rows={3}
            placeholder="Preferências, exercícios a evitar..."
          />
        </label>

        <button className="hero-button" type="submit" disabled={loading}>
          {loading ? (
            <>
              <span className="spinner" aria-hidden="true" />
              Gerando...
            </>
          ) : (
            "Gerar treino"
          )}
        </button>
      </form>

      {apiNotice ? (
        <p className="feedback feedback--warning" role="status">
          {apiNotice}
        </p>
      ) : null}

      {result ? (
        <section className="panel-card generated-plan">
          <span className="section-kicker">Plano salvo</span>
          <h2>{result.title}</h2>
          <p>
            {result.focus} · {result.duration} minutos
          </p>

          <h3>Aquecimento</h3>
          <ul>
            {result.warmup.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <h3>Exercícios</h3>
          <div className="content-grid content-grid--two">
            {result.exercises.map((exercise) => (
              <article className="mini-card" key={exercise.id}>
                <strong>{exercise.name}</strong>
                <p>
                  {exercise.sets} séries · {exercise.reps} reps ·{" "}
                  {exercise.restSeconds}s de descanso
                </p>
                <p>{exercise.description}</p>
                <small>Alternativas: {exercise.alternatives.join(", ")}</small>
              </article>
            ))}
          </div>

          <h3>Avisos de segurança</h3>
          <ul>
            {result.instructions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          {form.limitations ? (
            <p className="feedback feedback--warning">
              Se houver dor aguda, inchaço, formigamento, travamento ou piora
              persistente, interrompa o treino e procure avaliação profissional.
            </p>
          ) : null}

          <Link className="hero-button" to={`/app/treino/${result.id}`}>
            Abrir execução
          </Link>
        </section>
      ) : null}
    </div>
  );
}
