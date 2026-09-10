import { useUserData } from "../hooks/useUserData";
import { IconAlert, IconCheck } from "./Icons";

const labels = {
  local: "Somente neste aparelho",
  syncing: "Sincronizando...",
  synced: "Salvo na sua conta",
  pendente: "Aguardando conexão",
  erro: "Falha ao sincronizar"
} as const;

/**
 * Diz onde os dados estão parando. Sem isto a pessoa não tem como saber se o
 * que ela acabou de salvar sobreviveria a trocar de aparelho.
 */
export function SyncBadge() {
  const { syncState, syncError, pendingCount, retrySync } = useUserData();

  const failing = syncState === "erro" || syncState === "pendente";
  const suffix = pendingCount > 0 ? ` (${pendingCount})` : "";

  return (
    <span
      className={`sync-badge sync-badge--${syncState}`}
      title={syncError ?? undefined}
    >
      {syncState === "syncing" ? (
        <span className="spinner" aria-hidden="true" />
      ) : failing ? (
        <IconAlert />
      ) : (
        <IconCheck />
      )}
      {labels[syncState]}
      {suffix}
      {failing ? (
        <button
          className="sync-badge__retry"
          type="button"
          onClick={() => void retrySync()}
        >
          Tentar de novo
        </button>
      ) : null}
    </span>
  );
}
