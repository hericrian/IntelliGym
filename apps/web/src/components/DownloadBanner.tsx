import type { MobilePlatform } from "../lib/device";

type DownloadBannerProps = {
  platform: MobilePlatform;
  downloadUrl: string | null;
};

function getBannerCopy(platform: MobilePlatform) {
  if (platform === "ios") {
    return {
      title: "Experiência completa no iPhone",
      text: "Abra o app da IntelliGym com instalação direta pela App Store assim que ele for publicado."
    };
  }

  if (platform === "android") {
    return {
      title: "Treine melhor no Android",
      text: "Baixe o app para uma experiência mais fluida, com foco em câmera, sensores e notificações."
    };
  }

  return {
    title: "Continue no aplicativo",
    text: "Use a versão mobile quando quiser treino guiado com a experiência mais imersiva."
  };
}

export function DownloadBanner({ platform, downloadUrl }: DownloadBannerProps) {
  const copy = getBannerCopy(platform);

  return (
    <aside className="download-banner">
      <div>
        <span className="section-kicker">Aplicativo mobile</span>
        <strong>{copy.title}</strong>
        <p>{copy.text}</p>
      </div>
      {downloadUrl ? (
        <a className="hero-button" href={downloadUrl}>
          Baixar o app
        </a>
      ) : (
        <button className="hero-button" type="button" disabled>
          Em breve nas lojas
        </button>
      )}
    </aside>
  );
}
