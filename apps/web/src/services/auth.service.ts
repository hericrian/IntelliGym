import {
  GoogleAuthProvider,
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  updateProfile,
  type User
} from "firebase/auth";

import { firebaseAuth } from "../config/firebase";
import { createUserDocuments } from "./firestore.service";

const googleProvider = new GoogleAuthProvider();

function requireAuth() {
  if (!firebaseAuth) {
    throw new Error("Firebase Authentication nao configurado.");
  }

  return firebaseAuth;
}

export async function ensureSessionPersistence(): Promise<void> {
  await setPersistence(requireAuth(), browserLocalPersistence);
}

export async function registerWithEmail(payload: {
  name: string;
  email: string;
  password: string;
}): Promise<void> {
  const auth = requireAuth();
  await ensureSessionPersistence();
  const credentials = await createUserWithEmailAndPassword(auth, payload.email, payload.password);
  await updateProfile(credentials.user, { displayName: payload.name });
  await createUserDocuments({
    uid: credentials.user.uid,
    email: credentials.user.email ?? payload.email,
    displayName: payload.name,
    photoURL: credentials.user.photoURL
  });
}

export async function loginWithEmail(payload: { email: string; password: string }): Promise<void> {
  await ensureSessionPersistence();
  await signInWithEmailAndPassword(requireAuth(), payload.email, payload.password);
}

export async function loginWithGoogle(): Promise<void> {
  const auth = requireAuth();
  await ensureSessionPersistence();

  const isMobile = /Android|iPhone|iPad|iPod/i.test(window.navigator.userAgent);

  if (isMobile) {
    await signInWithRedirect(auth, googleProvider);
    return;
  }

  const credentials = await signInWithPopup(auth, googleProvider);
  await createUserDocuments({
    uid: credentials.user.uid,
    email: credentials.user.email ?? "",
    displayName: credentials.user.displayName ?? "Usuario IntelliGym",
    photoURL: credentials.user.photoURL
  }).catch(() => undefined);
}

export async function requestPasswordReset(email: string): Promise<void> {
  await sendPasswordResetEmail(requireAuth(), email);
}

export async function logoutUser(): Promise<void> {
  await signOut(requireAuth());
}

export function subscribeToAuthState(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(requireAuth(), callback);
}
