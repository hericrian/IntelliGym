import type { WorkoutPlan } from "../mocks/intelligym";

/**
 * Espelho local de tudo que o app guarda.
 *
 * Existe por dois motivos: a tela abre com dados na hora, sem esperar a rede,
 * e o app instalado continua funcionando offline. O servidor é a fonte da
 * verdade quando está acessível; isto aqui é cache e fila de saída.
 */

const KEYS = {
  profile: "intelligym.profile",
  equipment: "intelligym.equipment",
  plans: "intelligym.customPlans",
  pain: "intelligym.painLogs",
  outbox: "intelligym.outbox"
} as const;

export const defaultEquipment = [
  "Halteres ajustáveis",
  "Mini band",
  "Bike ergométrica",
  "Colchonete",
  "Banco"
];

export type StoredProfile = {
  nome: string | null;
  email: string | null;
  idade: number | null;
  altura: number | null;
  peso: number | null;
  objetivo: string | null;
  nivel: string | null;
  localTreino: string | null;
  diasTreino: string[];
  duracaoPreferida: number | null;
  limitacoes: string[];
  onboardingDone: boolean;
};

export type PainLog = {
  id?: string;
  score: number;
  region: string;
  trigger: string;
  createdAt: string;
};

/** Escrita ainda não confirmada pelo servidor. */
export type PendingWrite =
  | { kind: "profile"; payload: Partial<StoredProfile> }
  | { kind: "equipment"; payload: string[] }
  | { kind: "plan"; payload: WorkoutPlan }
  | { kind: "pain"; payload: PainLog };

function read<T>(key: string, fallback: T): T {
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Cota estourada ou modo privado: seguimos só com o estado em memória.
  }
}

export const localCache = {
  getProfile: () => read<StoredProfile | null>(KEYS.profile, null),
  setProfile: (profile: StoredProfile) => write(KEYS.profile, profile),

  getEquipment: () => read<string[]>(KEYS.equipment, defaultEquipment),
  setEquipment: (items: string[]) => write(KEYS.equipment, items),

  getPlans: () => read<WorkoutPlan[]>(KEYS.plans, []),
  setPlans: (plans: WorkoutPlan[]) => write(KEYS.plans, plans.slice(0, 40)),

  getPainLogs: () => read<PainLog[]>(KEYS.pain, []),
  setPainLogs: (logs: PainLog[]) => write(KEYS.pain, logs.slice(0, 60)),

  getOutbox: () => read<PendingWrite[]>(KEYS.outbox, []),
  setOutbox: (items: PendingWrite[]) => write(KEYS.outbox, items.slice(-50)),

  /** Limpa os dados do usuário ao sair, mantendo preferências do aparelho. */
  clearUserData() {
    for (const key of [
      KEYS.profile,
      KEYS.equipment,
      KEYS.plans,
      KEYS.pain,
      KEYS.outbox
    ]) {
      try {
        window.localStorage.removeItem(key);
      } catch {
        // Nada a fazer se o storage estiver bloqueado.
      }
    }
  }
};

/**
 * Enfileira uma escrita para reenvio. Perfil e equipamentos substituem a
 * entrada anterior do mesmo tipo — só o último estado importa. Planos e
 * registros de dor são acumulativos e todos precisam subir.
 */
export function enqueue(write: PendingWrite) {
  const outbox = localCache.getOutbox();
  const deduped =
    write.kind === "profile" || write.kind === "equipment"
      ? outbox.filter((item) => item.kind !== write.kind)
      : outbox;

  localCache.setOutbox([...deduped, write]);
}
