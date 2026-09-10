import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from "react";

import { useAuth } from "../hooks/useAuth";
import { apiRequest, isRemoteEnabled, isTransient } from "../lib/apiClient";
import {
  enqueue,
  localCache,
  type PainLog,
  type PendingWrite,
  type StoredProfile
} from "../lib/localCache";
import type { WorkoutPlan } from "../mocks/intelligym";

export type SyncState =
  /** Sem servidor configurado ou sem conta: só este aparelho. */
  | "local"
  | "syncing"
  | "synced"
  /** Há escritas na fila esperando a rede voltar. */
  | "pendente"
  | "erro";

export type DataContextValue = {
  profile: StoredProfile | null;
  equipment: string[];
  plans: WorkoutPlan[];
  painLogs: PainLog[];
  syncState: SyncState;
  syncError: string | null;
  pendingCount: number;
  saveProfile: (patch: Partial<StoredProfile>) => Promise<void>;
  saveEquipment: (items: string[]) => Promise<void>;
  savePlan: (plan: WorkoutPlan) => Promise<void>;
  removePlan: (id: string) => Promise<void>;
  savePainLog: (log: PainLog) => Promise<void>;
  retrySync: () => Promise<void>;
};

const DataContext = createContext<DataContextValue | undefined>(undefined);

type MeResponse = {
  profile: StoredProfile & { uid: string; updatedAt: string };
  equipment: string[];
};

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  // O estado nasce do cache: a tela pinta com dados antes de qualquer rede.
  const [profile, setProfile] = useState<StoredProfile | null>(() =>
    localCache.getProfile()
  );
  const [equipment, setEquipment] = useState<string[]>(() =>
    localCache.getEquipment()
  );
  const [plans, setPlans] = useState<WorkoutPlan[]>(() =>
    localCache.getPlans()
  );
  const [painLogs, setPainLogs] = useState<PainLog[]>(() =>
    localCache.getPainLogs()
  );

  const [syncState, setSyncState] = useState<SyncState>("local");
  const [syncError, setSyncError] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState(
    () => localCache.getOutbox().length
  );

  const remote = isRemoteEnabled() && Boolean(user);
  // Evita duas sincronizações simultâneas (montagem + evento "online").
  const syncing = useRef(false);

  const refreshPending = useCallback(() => {
    setPendingCount(localCache.getOutbox().length);
  }, []);

  /** Sobe uma escrita pendente. Devolve false se valer a pena tentar depois. */
  const push = useCallback(async (write: PendingWrite): Promise<boolean> => {
    try {
      switch (write.kind) {
        case "profile":
          await apiRequest("/api/me", { method: "PUT", body: write.payload });
          return true;
        case "equipment":
          await apiRequest("/api/equipment", {
            method: "PUT",
            body: { equipment: write.payload }
          });
          return true;
        case "plan":
          await apiRequest("/api/plans", {
            method: "POST",
            body: write.payload
          });
          return true;
        case "pain":
          await apiRequest("/api/pain-records", {
            method: "POST",
            body: write.payload
          });
          return true;
      }
    } catch (error) {
      // Erro definitivo (400, 403…) não melhora com retentativa: descarta para
      // a fila não travar para sempre num item impossível.
      if (!isTransient(error)) return true;
      throw error;
    }
  }, []);

  const flushOutbox = useCallback(async () => {
    const outbox = localCache.getOutbox();
    if (outbox.length === 0) return;

    const remaining: PendingWrite[] = [];
    for (let index = 0; index < outbox.length; index += 1) {
      try {
        await push(outbox[index]);
      } catch {
        // Rede caiu no meio: o resto continua na fila, na ordem.
        remaining.push(...outbox.slice(index));
        break;
      }
    }

    localCache.setOutbox(remaining);
    refreshPending();
    if (remaining.length > 0) throw new Error("fila-incompleta");
  }, [push, refreshPending]);

  const sync = useCallback(async () => {
    if (!remote || syncing.current) return;

    syncing.current = true;
    setSyncState("syncing");
    setSyncError(null);

    try {
      // A fila sobe primeiro: o que foi feito offline não pode ser
      // sobrescrito pelo estado antigo que está no servidor.
      await flushOutbox();

      const [me, planList, painList] = await Promise.all([
        apiRequest<MeResponse>("/api/me"),
        apiRequest<{ plans: Array<{ payload: WorkoutPlan }> }>("/api/plans"),
        apiRequest<{ records: PainLog[] }>("/api/pain-records")
      ]);

      setProfile(me.profile);
      localCache.setProfile(me.profile);

      setEquipment(me.equipment);
      localCache.setEquipment(me.equipment);

      const remotePlans = planList.plans.map((row) => row.payload);
      setPlans(remotePlans);
      localCache.setPlans(remotePlans);

      setPainLogs(painList.records);
      localCache.setPainLogs(painList.records);

      setSyncState("synced");
    } catch (error) {
      const pending = localCache.getOutbox().length;
      setSyncState(pending > 0 ? "pendente" : "erro");
      setSyncError(
        error instanceof Error && error.message !== "fila-incompleta"
          ? error.message
          : "Sem conexão com o servidor. Suas alterações estão salvas neste aparelho."
      );
    } finally {
      syncing.current = false;
      refreshPending();
    }
  }, [flushOutbox, remote, refreshPending]);

  useEffect(() => {
    if (!remote) {
      setSyncState("local");
      return;
    }

    void sync();

    const onOnline = () => void sync();
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, [remote, sync]);

  // Sair da conta não pode deixar os dados de quem saiu na próxima sessão.
  const previousUid = useRef<string | null>(null);
  useEffect(() => {
    const uid = user?.uid ?? null;
    if (previousUid.current && previousUid.current !== uid) {
      localCache.clearUserData();
      setProfile(null);
      setEquipment(localCache.getEquipment());
      setPlans([]);
      setPainLogs([]);
      refreshPending();
    }
    previousUid.current = uid;
  }, [user?.uid, refreshPending]);

  /**
   * Escrita otimista: estado e cache mudam na hora, o servidor vem depois.
   * Se a rede falhar, a operação entra na fila em vez de virar erro na cara
   * de quem está no meio do treino.
   */
  const commit = useCallback(
    async (write: PendingWrite) => {
      if (!remote) return;

      try {
        setSyncState("syncing");
        await push(write);
        setSyncState("synced");
        setSyncError(null);
      } catch {
        enqueue(write);
        refreshPending();
        setSyncState("pendente");
        setSyncError("Sem conexão. Enviaremos assim que a internet voltar.");
      }
    },
    [push, remote, refreshPending]
  );

  const value = useMemo<DataContextValue>(
    () => ({
      profile,
      equipment,
      plans,
      painLogs,
      syncState,
      syncError,
      pendingCount,

      saveProfile: async (patch) => {
        const next = { ...(profile ?? emptyProfile()), ...patch };
        setProfile(next);
        localCache.setProfile(next);
        await commit({ kind: "profile", payload: patch });
      },

      saveEquipment: async (items) => {
        setEquipment(items);
        localCache.setEquipment(items);
        await commit({ kind: "equipment", payload: items });
      },

      savePlan: async (plan) => {
        const next = [plan, ...plans.filter((item) => item.id !== plan.id)];
        setPlans(next);
        localCache.setPlans(next);
        await commit({ kind: "plan", payload: plan });
      },

      removePlan: async (id) => {
        const next = plans.filter((item) => item.id !== id);
        setPlans(next);
        localCache.setPlans(next);

        if (!remote) return;
        // Remoção não entra na fila: se falhar, a próxima sincronização
        // devolve o plano e a pessoa tenta de novo — melhor que sumir sem aviso.
        await apiRequest(`/api/plans/${id}`, { method: "DELETE" }).catch(() => {
          setSyncError(
            "Não foi possível remover no servidor. Tente novamente."
          );
        });
      },

      savePainLog: async (log) => {
        const next = [log, ...painLogs];
        setPainLogs(next);
        localCache.setPainLogs(next);
        await commit({ kind: "pain", payload: log });
      },

      retrySync: sync
    }),
    [
      commit,
      equipment,
      painLogs,
      pendingCount,
      plans,
      profile,
      remote,
      sync,
      syncError,
      syncState
    ]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

function emptyProfile(): StoredProfile {
  return {
    nome: null,
    email: null,
    idade: null,
    altura: null,
    peso: null,
    objetivo: null,
    nivel: null,
    localTreino: null,
    diasTreino: [],
    duracaoPreferida: null,
    limitacoes: [],
    onboardingDone: false
  };
}

export { DataContext };
