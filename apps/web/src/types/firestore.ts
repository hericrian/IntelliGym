export type UserRole = "user" | "trainer" | "physiotherapist" | "admin";

export type TrainingGoal =
  | "hipertrofia"
  | "emagrecimento"
  | "mobilidade"
  | "reabilitacao"
  | "condicionamento";

export type TrainingLevel = "iniciante" | "intermediario" | "avancado";

export type TrainingLocation = "casa" | "academia" | "hibrido";

export interface TimestampFields {
  createdAt: unknown;
  updatedAt: unknown;
}

export interface UserDocument extends TimestampFields {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  role: UserRole;
  onboardingCompleted: boolean;
}

export interface UserProfileDocument extends TimestampFields {
  uid: string;
  nome: string;
  email: string;
  foto: string | null;
  idade: number | null;
  altura: number | null;
  peso: number | null;
  objetivo: TrainingGoal | null;
  nivel: TrainingLevel | null;
  localTreino: TrainingLocation | null;
  equipamentosDisponiveis: string[];
  diasTreino: string[];
  duracaoPreferida: number | null;
  limitacoes: string[];
}

export interface EquipmentDocument extends TimestampFields {
  id: string;
  nome: string;
  categoria: string;
  publico: boolean;
}

export interface LimitationDocument extends TimestampFields {
  id: string;
  nome: string;
  descricao: string;
  intensidade: "leve" | "moderada" | "alta";
}

export interface ExerciseDocument extends TimestampFields {
  id: string;
  nome: string;
  categoria: string;
  publico: boolean;
  equipamentos: string[];
}

export interface WorkoutPlanDocument extends TimestampFields {
  id: string;
  userId: string;
  titulo: string;
  objetivo: TrainingGoal | null;
  exercicios: string[];
  status: "rascunho" | "ativo" | "arquivado";
}

export interface WorkoutSessionDocument extends TimestampFields {
  id: string;
  userId: string;
  planId: string;
  startedAt: unknown;
  completedAt: unknown | null;
  notes: string | null;
}

export interface PainRecordDocument extends TimestampFields {
  id: string;
  userId: string;
  intensidade: number;
  local: string;
  observacoes: string | null;
}

export interface ProgressRecordDocument extends TimestampFields {
  id: string;
  userId: string;
  peso: number | null;
  percentualGordura: number | null;
  observacoes: string | null;
}

export interface AIConversationDocument extends TimestampFields {
  id: string;
  userId: string;
  provider: string;
  model: string;
  summary: string;
}

export interface SubscriptionDocument extends TimestampFields {
  id: string;
  userId: string;
  plan: "free" | "premium";
  status: "active" | "inactive" | "trialing" | "past_due";
}

export interface FirestoreCollections {
  users: UserDocument;
  user_profiles: UserProfileDocument;
  equipments: EquipmentDocument;
  limitations: LimitationDocument;
  workout_plans: WorkoutPlanDocument;
  workout_sessions: WorkoutSessionDocument;
  exercises: ExerciseDocument;
  pain_records: PainRecordDocument;
  progress_records: ProgressRecordDocument;
  ai_conversations: AIConversationDocument;
  subscriptions: SubscriptionDocument;
}
