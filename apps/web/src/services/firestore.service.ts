import { firebaseAuth } from "../config/firebase";
import type { FirestoreCollections, UserDocument, UserProfileDocument } from "../types/firestore";

type DataProfile = {
  firebase_uid: string;
  email: string;
  display_name: string;
  avatar_url: string | null;
  onboarding_completed: boolean;
  created_at: unknown;
  updated_at: unknown;
};

const dataApiUrl = import.meta.env.VITE_INTELLIGYM_DATA_API_URL;

function requireDataApi() {
  if (!dataApiUrl) throw new Error("A sincronização de dados ainda não está configurada.");
  return dataApiUrl.replace(/\/$/, "");
}

async function requestProfile(path: string, options: RequestInit = {}) {
  const user = firebaseAuth?.currentUser;
  if (!user) throw new Error("Faça login para sincronizar seus dados.");

  const response = await fetch(`${requireDataApi()}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${await user.getIdToken()}`,
      "Content-Type": "application/json",
      ...options.headers
    }
  });

  if (!response.ok) throw new Error("Não foi possível sincronizar seus dados agora.");
  return response.json() as Promise<{ profile: DataProfile | null }>;
}

function toUserProfile(profile: DataProfile): UserProfileDocument {
  return {
    uid: profile.firebase_uid, nome: profile.display_name, email: profile.email, foto: profile.avatar_url,
    idade: null, altura: null, peso: null, objetivo: null, nivel: null, localTreino: null,
    equipamentosDisponiveis: [], diasTreino: [], duracaoPreferida: null, limitacoes: [],
    createdAt: profile.created_at, updatedAt: profile.updated_at
  };
}

export function getTypedCollection<K extends keyof FirestoreCollections>(_name: K): never {
  throw new Error("Coleções diretas não são expostas ao navegador.");
}

export async function createUserDocuments(payload: {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string | null;
}): Promise<void> {
  await requestProfile("/profile", {
    method: "PUT",
    body: JSON.stringify({ displayName: payload.displayName, photoURL: payload.photoURL ?? null, onboardingCompleted: false })
  });
}

export async function getUserProfile(_uid: string): Promise<UserProfileDocument | null> {
  const response = await requestProfile("/profile");
  return response.profile ? toUserProfile(response.profile) : null;
}

export async function updateUserProfile(_uid: string, updates: Partial<UserProfileDocument>): Promise<void> {
  await requestProfile("/profile", {
    method: "PUT",
    body: JSON.stringify({ displayName: updates.nome, photoURL: updates.foto, onboardingCompleted: false })
  });
}
