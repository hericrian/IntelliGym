import { useState } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";

const steps = [
  { key: "goal", title: "Objetivo principal", options: ["Fortalecer com seguranca", "Hipertrofia", "Emagrecimento", "Condicionamento"] },
  { key: "location", title: "Local de treino", options: ["Casa", "Academia", "Hibrido"] },
  { key: "equipment", title: "Equipamentos", options: ["Halteres", "Mini band", "Bike", "Maquinas", "Peso corporal"] },
  { key: "level", title: "Experiencia", options: ["Iniciante", "Intermediario", "Avancado"] },
  { key: "days", title: "Dias disponiveis", options: ["2 dias", "3 dias", "4 dias", "5 dias"] },
  { key: "duration", title: "Tempo por treino", options: ["30 min", "45 min", "60 min"] },
  { key: "limitations", title: "Dores ou limitacoes", options: ["Menisco lateral direito", "Lombar", "Ombro", "Sem limitacoes"] }
] as const;

export function OnboardingPage() {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const step = steps[index];
  const isLast = index === steps.length - 1;

  return (
    <div className="app-page app-page--center">
      <motion.section className="onboarding-card" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
        <span className="section-kicker">Onboarding {index + 1}/{steps.length}</span>
        <h1>{step.title}</h1>
        <p>Escolha a opcao que melhor representa seu momento. Voce pode ajustar tudo depois no perfil.</p>
        <div className="option-grid">
          {step.options.map((option) => (
            <button
              className={answers[step.key] === option ? "option-card option-card--active" : "option-card"}
              key={option}
              onClick={() => setAnswers((current) => ({ ...current, [step.key]: option }))}
            >
              {option}
            </button>
          ))}
        </div>
        <div className="wizard-footer">
          <button className="ghost-button" disabled={index === 0} onClick={() => setIndex((value) => value - 1)}>
            Voltar
          </button>
          <button
            className="hero-button"
            onClick={() => {
              if (isLast) {
                navigate("/app/dashboard");
              } else {
                setIndex((value) => value + 1);
              }
            }}
          >
            {isLast ? "Salvar e entrar" : "Continuar"}
          </button>
        </div>
      </motion.section>
    </div>
  );
}

