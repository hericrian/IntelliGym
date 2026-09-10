import { useState, type ReactNode } from "react";

import { useInstallPrompt } from "../hooks/useInstallPrompt";
import { isIosSafari } from "../lib/pwa";
import { IconCheck, IconDownload, IconMore, IconShare } from "./Icons";

type Platform = "android" | "ios" | "desktop";

const platformLabels: Record<Platform, string> = {
  android: "Android",
  ios: "iPhone e iPad",
  desktop: "Windows, Mac e Linux"
};

type Step = { icon?: ReactNode; text: ReactNode };

const steps: Record<Platform, Step[]> = {
  android: [
    {
      icon: <IconMore />,
      text: <>Abra o menu do Chrome (os três pontos no canto).</>
    },
    {
      text: (
        <>
          Toque em <strong>Instalar app</strong> ou{" "}
          <strong>Adicionar à tela inicial</strong>.
        </>
      )
    },
    {
      icon: <IconCheck />,
      text: <>Confirme. O IntelliGym aparece junto dos seus outros apps.</>
    }
  ],
  ios: [
    {
      text: (
        <>
          Abra este site no <strong>Safari</strong> — só ele instala no iPhone.
        </>
      )
    },
    {
      icon: <IconShare />,
      text: (
        <>
          Toque no botão <strong>Compartilhar</strong>, na barra inferior.
        </>
      )
    },
    {
      text: (
        <>
          Role e escolha <strong>Adicionar à Tela de Início</strong>.
        </>
      )
    },
    {
      icon: <IconCheck />,
      text: (
        <>
          Confirme em <strong>Adicionar</strong>. Pronto, abre em tela cheia.
        </>
      )
    }
  ],
  desktop: [
    {
      icon: <IconDownload />,
      text: (
        <>
          No Chrome ou Edge, clique no ícone de instalar na barra de endereço.
        </>
      )
    },
    {
      text: (
        <>
          Ou abra o menu do navegador e escolha{" "}
          <strong>Instalar IntelliGym</strong>.
        </>
      )
    },
    {
      icon: <IconCheck />,
      text: <>O app abre em janela própria, sem abas nem barra de endereço.</>
    }
  ]
};

const benefits = [
  "Abre em tela cheia, sem barra do navegador",
  "Ícone na tela de início junto dos seus apps",
  "Seus treinos e registros continuam disponíveis offline",
  "Atalhos rápidos para treinar e registrar dor"
];

/**
 * Guia de instalação com o passo a passo de cada plataforma. Quando o
 * navegador suporta o diálogo nativo (Chromium), o botão dispara direto e o
 * passo a passo vira apenas fallback.
 */
export function InstallGuide() {
  const { platform, canPrompt, installed, promptInstall } = useInstallPrompt();
  const initial: Platform =
    platform === "ios" || platform === "android" ? platform : "desktop";
  const [tab, setTab] = useState<Platform>(initial);
  const [feedback, setFeedback] = useState<string | null>(null);

  if (installed) {
    return (
      <div className="install-card install-card--done">
        <span className="hero-pill">
          <IconCheck /> Instalado
        </span>
        <h3>Você já está usando o app instalado</h3>
        <p>
          Tudo funciona offline: os treinos salvos, o registro de dor e o guia
          de execução continuam disponíveis mesmo sem internet.
        </p>
      </div>
    );
  }

  return (
    <div className="install-card">
      <div className="install-card__intro">
        <span className="section-kicker">Instalar</span>
        <h3>Leve o IntelliGym para a tela de início</h3>
        <ul className="install-benefits">
          {benefits.map((benefit) => (
            <li key={benefit}>
              <IconCheck />
              {benefit}
            </li>
          ))}
        </ul>

        {canPrompt ? (
          <button
            className="hero-button"
            type="button"
            onClick={async () => {
              const outcome = await promptInstall();
              if (outcome === "accepted")
                setFeedback("Instalação iniciada. Confira sua tela de início.");
              if (outcome === "dismissed")
                setFeedback(
                  "Sem problema — o passo a passo abaixo continua valendo."
                );
            }}
          >
            <IconDownload />
            Instalar agora
          </button>
        ) : null}

        {!canPrompt && platform === "ios" && !isIosSafari() ? (
          <p className="feedback feedback--warning" role="status">
            No iPhone, a instalação só acontece pelo Safari. Abra este endereço
            lá para continuar.
          </p>
        ) : null}

        {feedback ? (
          <p className="feedback feedback--success" role="status">
            {feedback}
          </p>
        ) : null}
      </div>

      <div className="install-card__steps">
        <div
          className="segmented"
          role="tablist"
          aria-label="Escolha seu dispositivo"
        >
          {(Object.keys(platformLabels) as Platform[]).map((key) => (
            <button
              className={`segmented__item ${tab === key ? "segmented__item--active" : ""}`}
              type="button"
              role="tab"
              id={`install-tab-${key}`}
              aria-selected={tab === key}
              aria-controls={`install-panel-${key}`}
              key={key}
              onClick={() => setTab(key)}
            >
              {platformLabels[key]}
            </button>
          ))}
        </div>

        <ol
          className="install-steps"
          role="tabpanel"
          id={`install-panel-${tab}`}
          aria-labelledby={`install-tab-${tab}`}
        >
          {steps[tab].map((step, index) => (
            <li key={index}>
              <span className="install-steps__index" aria-hidden="true">
                {step.icon ?? index + 1}
              </span>
              <span>{step.text}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
