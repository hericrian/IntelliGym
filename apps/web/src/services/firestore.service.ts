import {
  collection,
  doc,
  getDoc,
  getFirestore,
  serverTimestamp,
  setDoc,
  updateDoc,
  type CollectionReference
} from "firebase/firestore";

import { firebaseApp } from "../config/firebase";
import type { FirestoreCollections, UserDocument, UserProfileDocument } from "../types/firestore";

function requireDb() {
  if (!firebaseApp) {
    throw new Error("Firebase nao configurado.");
  }

  return getFirestore(firebaseApp);
}

export function getTypedCollection<K extends keyof FirestoreCollections>(
  name: K
): CollectionReference<FirestoreCollections[K]> {
  return collection(requireDb(), name) as CollectionReference<FirestoreCollections[K]>;
}

export async function createUserDocuments(payload: {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string | null;
}): Promise<void> {
  const db = requireDb();
  const now = serverTimestamp();

  const userDoc: UserDocument = {
    uid: payload.uid,
    email: payload.email,
    displayName: payload.displayName,
    photoURL: payload.photoURL ?? null,
    role: "user",
    onboardingCompleted: false,
    createdAt: now,
    updatedAt: now
  };

  const profileDoc: UserProfileDocument = {
    uid: payload.uid,
    nome: payload.displayName,
    email: payload.email,
    foto: payload.photoURL ?? null,
    idade: null,
    altura: null,
    peso: null,
    objetivo: null,
    nivel: null,
    localTreino: null,
    equipamentosDisponiveis: [],
    diasTreino: [],
    duracaoPreferida: null,
    limitacoes: [],
    createdAt: now,
    updatedAt: now
  };

  await Promise.all([
    setDoc(doc(db, "users", payload.uid), userDoc),
    setDoc(doc(db, "user_profiles", payload.uid), profileDoc)
  ]);
}

export async function getUserProfile(uid: string): Promise<UserProfileDocument | null> {
  const snapshot = await getDoc(doc(requireDb(), "user_profiles", uid));
  return snapshot.exists() ? (snapshot.data() as UserProfileDocument) : null;
}

export async function updateUserProfile(uid: string, updates: Partial<UserProfileDocument>): Promise<void> {
  await updateDoc(doc(requireDb(), "user_profiles", uid), {
    ...updates,
    updatedAt: serverTimestamp()
  });
}
