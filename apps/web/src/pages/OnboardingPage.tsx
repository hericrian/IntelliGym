import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useUserData } from "../hooks/useUserData";

const steps = [
  {
    key: "goal",
    title: "Objetivo principal",
    options: [
      "Fortalecer com segurança",
      "Hipertrofia",
      "Emagrecimento",
      "Condicionamento"
    ]
  },
  {
    key: "location",
    title: "Local de treino",
    options: ["Casa", "Academia", "Híbrido"]
  },
  {
    key: "equipment",
    title: "Equipamentos",
    options: ["Halteres", "Mini band", "Bike", "Máquinas", "Peso corporal"]
  },
  {
    key: "level",
    title: "Experiência",
    options: ["Iniciante", "Intermediário", "Avançado"]
  },
  {
    key: "days",
    title: "Dias disponíveis",
    options: ["2 dias", "3 dias", "4 dias", "5 dias"]
  },
  {
    key: "duration",
    title: "Tempo por treino",
    options: ["30 min", "45 min", "60 min"]
  },
  {
    key: "limitations",
    title: "Dores ou limitações",
    options: ["Menisco lateral direito", "Lombar", "Ombro", "Sem limitações"]
  }
] as const;

export function OnboardingPage() {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { saveProfile, saveEquipment } = useUserData();

  const step = steps[index];
  const isLast = index === steps.length - 1;
  const answered = answers[step.key] !== undefined;

  return (
    <div className="app-page app-page--center">
      <section className="onboarding-card" aria-labelledby="onboarding-title">
        <div className="onboarding-progress" aria-hidden="true">
          {steps.map((item, position) => (
            <span
              className={`onboarding-progress__step ${
                position <= index ? "onboarding-progress__step--done" : ""
              }`}
              key={item.key}
            />
          ))}
        </div>

        <span className="section-kicker">
          Passo {index + 1} de {steps.length}
        </span>
        <h1 id="onboarding-title">{step.title}</h1>
        <p>
          Escolha a opção que melhor representa seu momento. Você pode ajustar
          tudo depois no perfil.
        </p>

        <div
          className="option-grid"
          role="radiogroup"
          aria-labelledby="onboarding-title"
        >
          {step.options.map((option) => {
            const active = answers[step.key] === option;

            return (
              <button
                className={
                  active ? "option-card option-card--active" : "option-card"
                }
                type="button"
                role="radio"
                aria-checked={active}
                key={option}
                onClick={() =>
                  setAnswers((current) => ({ ...current, [step.key]: option }))
                }
              >
                {option}
              </button>
            );
          })}
        </div>

        <div className="wizard-footer">
          <button
            className="ghost-button"
            type="button"
            disabled={index === 0}
            onClick={() => setIndex((value) => value - 1)}
          >
            Voltar
          </button>
          <button
            className="hero-button"
            type="button"
            disabled={!answered || saving}
            onClick={async () => {
              if (!isLast) {
                setIndex((value) => value + 1);
                return;
              }

              // As respostas viram perfil de verdade: é o que o gerador lê
              // depois para montar o treino.
              setSaving(true);
              try {
                if (answers.equipment) await saveEquipment([answers.equipment]);
                await saveProfile({
                  objetivo: answers.goal ?? null,
                  localTreino: answers.location ?? null,
                  nivel: answers.level ?? null,
                  duracaoPreferida:
                    Number.parseInt(answers.duration ?? "", 10) || null,
                  diasTreino: answers.days ? [answers.days] : [],
                  limitacoes:
                    answers.limitations &&
                    answers.limitations !== "Sem limitações"
                      ? [answers.limitations]
                      : [],
                  onboardingDone: true
                });
              } finally {
                setSaving(false);
                navigate("/app/dashboard");
              }
            }}
          >
            {saving ? "Salvando..." : isLast ? "Salvar e entrar" : "Continuar"}
          </button>
        </div>
      </section>
    </div>
  );
}
