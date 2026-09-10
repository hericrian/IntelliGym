import { useState } from "react";

import { useInstallPrompt } from "../hooks/useInstallPrompt";
import { Dialog } from "./Dialog";
import { IconClose, IconDownload, IconShare } from "./Icons";

/**
 * Convite discreto para instalar. Aparece só quando faz sentido: fora do modo
 * standalone, em plataforma suportada e se o usuário não dispensou há pouco.
 * No iPhone não existe diálogo nativo, então abrimos as instruções do Safari.
 */
export function InstallBanner() {
  const { platform, canPrompt, installed, dismissed, promptInstall, dismiss } =
    useInstallPrompt();
  const [showIosHelp, setShowIosHelp] = useState(false);

  const isIos = platform === "ios";
  const canShow = !installed && !dismissed && (canPrompt || isIos);

  if (!canShow) return null;

  return (
    <>
      <aside className="install-banner" aria-label="Instalar o aplicativo">
        <img src="/icon-192.png" alt="" width={40} height={40} />
        <div className="install-banner__copy">
          <strong>Instalar o IntelliGym</strong>
          <span>
            Tela cheia, ícone próprio e acesso offline aos seus treinos.
          </span>
        </div>
        <button
          className="hero-button"
          type="button"
          onClick={() => {
            if (canPrompt) void promptInstall();
            else setShowIosHelp(true);
          }}
        >
          {isIos && !canPrompt ? <IconShare /> : <IconDownload />}
          Instalar
        </button>
        <button
          className="icon-button install-banner__close"
          type="button"
          aria-label="Agora não"
          onClick={dismiss}
        >
          <IconClose />
        </button>
      </aside>

      <Dialog
        open={showIosHelp}
        onClose={() => setShowIosHelp(false)}
        title="Adicionar à Tela de Início"
        description="No iPhone e no iPad a instalação é feita pelo Safari, em três toques."
      >
        <ol className="install-steps">
          <li>
            <span className="install-steps__index" aria-hidden="true">
              <IconShare />
            </span>
            <span>
              Toque em <strong>Compartilhar</strong>, na barra inferior do
              Safari.
            </span>
          </li>
          <li>
            <span className="install-steps__index" aria-hidden="true">
              2
            </span>
            <span>
              Role a lista e escolha <strong>Adicionar à Tela de Início</strong>
              .
            </span>
          </li>
          <li>
            <span className="install-steps__index" aria-hidden="true">
              3
            </span>
            <span>
              Toque em <strong>Adicionar</strong>. O IntelliGym passa a abrir em
              tela cheia.
            </span>
          </li>
        </ol>
      </Dialog>
    </>
  );
}
