import { motion } from "motion/react";

import type { MobilePlatform } from "../lib/device";

type DownloadBannerProps = {
  platform: MobilePlatform;
  downloadUrl: string | null;
};

function getBannerCopy(platform: MobilePlatform) {
  if (platform === "ios") {
    return {
      title: "Experiencia completa no iPhone",
      text: "Abra o app da IntelliGym com instalacao direta pela App Store assim que ele estiver publicado."
    };
  }

  if (platform === "android") {
    return {
      title: "Treine melhor no Android",
      text: "Baixe o app para ter uma experiencia mais fluida, com foco em camera, sensores e notificacoes."
    };
  }

  return {
    title: "Continue no aplicativo",
    text: "Use a versao mobile quando quiser treino guiado com a experiencia mais imersiva."
  };
}

export function DownloadBanner({ platform, downloadUrl }: DownloadBannerProps) {
  const copy = getBannerCopy(platform);

  return (
    <motion.aside
      className="download-banner"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <div>
        <span className="section-kicker">Aplicativo mobile</span>
        <strong>{copy.title}</strong>
        <p>{copy.text}</p>
      </div>
      <a className="hero-button" href={downloadUrl ?? "#download"} aria-disabled={!downloadUrl}>
        {downloadUrl ? "Baixar o app" : "Em breve nas lojas"}
      </a>
    </motion.aside>
  );
}
