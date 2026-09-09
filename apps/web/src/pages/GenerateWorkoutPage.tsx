import { useState } from "react";
import { Link } from "react-router-dom";

import { generateMockWorkout, type WorkoutPlan } from "../mocks/intelligym";
import { getEquipment, savePlan } from "../lib/trainingStore";

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
  const [form, setForm] = useState(() => ({ ...initialForm, equipment: getEquipment().join(", ") }));
  const [result, setResult] = useState<WorkoutPlan | null>(null);

  function update(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  return (
    <div className="app-page">
      <div className="page-title-row">
        <div>
          <span className="section-kicker">Gerador</span>
          <h1>Criar treino personalizado</h1>
        </div>
      </div>
      <form
        className="form-grid panel-card"
        onSubmit={(event) => {
          event.preventDefault();
          const plan = generateMockWorkout(form);
          savePlan(plan);
          setResult(plan);
        }}
      >
        <div className="generator-context field--wide">
          <strong>Equipamentos disponíveis</strong><span>{form.equipment || "Somente peso corporal"}</span>
          <button type="button" className="text-link" onClick={() => setForm((current) => ({ ...current, equipment: getEquipment().join(", ") }))}>Atualizar inventário</button>
        </div>
        <label className="field"><span>Objetivo</span><select value={form.objective} onChange={(event) => update("objective", event.target.value)}><option value="fortalecimento">Fortalecimento</option><option value="emagrecimento">Condicionamento</option><option value="mobilidade">Mobilidade</option></select></label>
        <label className="field"><span>Onde vai treinar?</span><select value={form.location} onChange={(event) => update("location", event.target.value)}><option value="casa">Em casa</option><option value="academia">Na academia</option></select></label>
        <label className="field"><span>Duração</span><select value={form.duration} onChange={(event) => update("duration", event.target.value)}><option value="20">20 minutos</option><option value="30">30 minutos</option><option value="45">45 minutos</option><option value="60">60 minutos</option></select></label>
        <label className="field"><span>Nível</span><select value={form.level} onChange={(event) => update("level", event.target.value)}><option value="iniciante">Iniciante</option><option value="intermediario">Intermediário</option><option value="avancado">Avançado</option></select></label>
        <label className="field"><span>Foco</span><select value={form.muscleGroup} onChange={(event) => update("muscleGroup", event.target.value)}><option value="full body">Corpo inteiro</option><option value="inferiores">Pernas e glúteos</option><option value="superiores">Braços e costas</option><option value="core">Core</option></select></label>
        <label className="field"><span>Intensidade</span><select value={form.intensity} onChange={(event) => update("intensity", event.target.value)}><option value="leve">Leve</option><option value="moderada">Moderada</option><option value="alta">Alta</option></select></label>
        <label className="field field--wide"><span>Limitações, dor ou recuperação</span><input value={form.limitations} onChange={(event) => update("limitations", event.target.value)} placeholder="Ex.: dor no joelho ao agachar" /></label>
        <label className="field field--wide"><span>Observações</span><textarea value={form.notes} onChange={(event) => update("notes", event.target.value)} rows={3} placeholder="Preferências, exercícios a evitar..." /></label>
        {false && Object.entries(form).map(([key, value]) => (
          <label className={key === "notes" ? "field field--wide" : "field"} key={key}>
            <span>{key}</span>
            {key === "notes" ? (
              <textarea value={value} onChange={(event) => update(key as keyof typeof form, event.target.value)} rows={4} />
            ) : (
              <input value={value} onChange={(event) => update(key as keyof typeof form, event.target.value)} />
            )}
          </label>
        ))}
        <button className="hero-button" type="submit">Gerar treino</button>
      </form>

      {result ? (
        <section className="panel-card generated-plan">
          <span className="section-kicker">Plano salvo neste dispositivo</span>
          <h2>{result.title}</h2>
          <p>{result.focus} · {result.duration} minutos</p>
          <h3>Aquecimento</h3>
          <ul>{result.warmup.map((item) => <li key={item}>{item}</li>)}</ul>
          <h3>Exercicios</h3>
          <div className="content-grid content-grid--two">
            {result.exercises.map((exercise) => (
              <article className="mini-card" key={exercise.id}>
                <strong>{exercise.name}</strong>
                <p>{exercise.sets} series · {exercise.reps} reps · {exercise.restSeconds}s descanso</p>
                <p>{exercise.description}</p>
                <small>Alternativas: {exercise.alternatives.join(", ")}</small>
              </article>
            ))}
          </div>
          <h3>Avisos de seguranca</h3>
          <ul>{result.instructions.map((item) => <li key={item}>{item}</li>)}</ul>
          {form.limitations ? <p className="feedback feedback--warning">Se houver dor aguda, inchaço, formigamento, travamento ou piora persistente, interrompa o treino e procure avaliação profissional.</p> : null}
          <Link className="hero-button hero-button--secondary" to={`/app/treino/${result.id}`}>Abrir execucao simulada</Link>
        </section>
      ) : null}
    </div>
  );
}
