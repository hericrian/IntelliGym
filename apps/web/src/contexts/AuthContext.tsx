import {
  createContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";

import { hasFirebaseConfig } from "../config/firebase";
import {
  loginWithEmail,
  loginWithGoogle,
  logoutUser,
  registerWithEmail,
  requestPasswordReset,
  subscribeToAuthState
} from "../services/auth.service";
import { getUserProfile } from "../services/firestore.service";
import type {
  AuthContextValue,
  AuthCredentials,
  RegisterPayload
} from "../types/auth";
import type { UserProfileDocument } from "../types/firestore";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const demoSessionKey = "intelligym.demoSession";

const demoProfile: UserProfileDocument = {
  uid: "demo-user",
  nome: "Heric",
  email: "demo@intelligym.app",
  foto: null,
  idade: 31,
  altura: 178,
  peso: 86,
  objetivo: "reabilitacao",
  nivel: "intermediario",
  localTreino: "hibrido",
  equipamentosDisponiveis: ["halteres", "mini band", "bike", "colchonete"],
  diasTreino: ["segunda", "quarta", "sexta", "sabado"],
  duracaoPreferida: 45,
  limitacoes: ["ruptura de menisco lateral direito"],
  createdAt: null,
  updatedAt: null
};

function createDemoUser(
  email = demoProfile.email,
  displayName = demoProfile.nome
) {
  return {
    uid: "demo-user",
    email,
    displayName,
    photoURL: null,
    getIdToken: async () => "demo-token"
  } as AuthContextValue["user"];
}

function saveDemoSession(profile: UserProfileDocument) {
  window.localStorage.setItem(
    demoSessionKey,
    JSON.stringify({ email: profile.email, name: profile.nome })
  );
}

function readDemoSession() {
  const stored = window.localStorage.getItem(demoSessionKey);

  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored) as { email: string; name: string };
  } catch {
    window.localStorage.removeItem(demoSessionKey);
    return null;
  }
}

const authErrorMessages: Record<string, string> = {
  "auth/email-already-in-use": "Este e-mail ja esta em uso.",
  "auth/invalid-credential": "E-mail ou senha invalidos.",
  "auth/invalid-email": "Digite um e-mail valido.",
  "auth/operation-not-allowed":
    "Este método de login ainda não foi habilitado no Firebase.",
  "auth/popup-closed-by-user": "O login com Google foi interrompido.",
  "auth/unauthorized-domain":
    "Este domínio ainda não está autorizado no Firebase Authentication.",
  "auth/too-many-requests": "Muitas tentativas. Tente novamente em instantes.",
  "auth/user-not-found": "Usuario nao encontrado.",
  "auth/weak-password": "A senha precisa ter pelo menos 6 caracteres."
};

function getFriendlyError(error: unknown): string {
  if (typeof error === "object" && error && "code" in error) {
    const code = String(error.code);
    return authErrorMessages[code] ?? "Nao foi possivel autenticar no momento.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Ocorreu um erro inesperado.";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthContextValue["user"]>(null);
  const [profile, setProfile] = useState<UserProfileDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const firebaseEnabled = hasFirebaseConfig();

  async function refreshProfile() {
    if (!user) {
      setProfile(null);
      return;
    }

    const nextProfile = await getUserProfile(user.uid);
    setProfile(nextProfile);
  }

  async function runAction<T>(action: () => Promise<T>): Promise<T> {
    setLoading(true);
    setError(null);

    try {
      return await action();
    } catch (caughtError) {
      const message = getFriendlyError(caughtError);
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!firebaseEnabled) {
      const demoSession = readDemoSession();

      if (demoSession) {
        setUser(createDemoUser(demoSession.email, demoSession.name));
        setProfile({
          ...demoProfile,
          email: demoSession.email,
          nome: demoSession.name
        });
      }

      setLoading(false);
      setInitialized(true);
      return;
    }

    const unsubscribe = subscribeToAuthState(async (nextUser) => {
      setUser(nextUser);
      setInitialized(true);

      if (nextUser) {
        const nextProfile = await getUserProfile(nextUser.uid).catch(
          () => null
        );
        setProfile(nextProfile);
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, [firebaseEnabled]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      loading,
      initialized,
      error,
      signUp: async (payload: RegisterPayload) => {
        if (!firebaseEnabled) {
          const nextProfile = {
            ...demoProfile,
            email: payload.email,
            nome: payload.name
          };
          setUser(createDemoUser(payload.email, payload.name));
          setProfile(nextProfile);
          saveDemoSession(nextProfile);
          return;
        }

        await runAction(() => registerWithEmail(payload));
      },
      signIn: async (payload: AuthCredentials) => {
        if (!firebaseEnabled) {
          const nextProfile = { ...demoProfile, email: payload.email };
          setUser(createDemoUser(payload.email));
          setProfile(nextProfile);
          saveDemoSession(nextProfile);
          return;
        }

        await runAction(() => loginWithEmail(payload));
      },
      signInWithGoogle: async () => {
        if (!firebaseEnabled) {
          setUser(createDemoUser());
          setProfile(demoProfile);
          saveDemoSession(demoProfile);
          return;
        }

        await runAction(() => loginWithGoogle());
      },
      resetPassword: async (email: string) => {
        if (!firebaseEnabled) {
          setError(
            `Modo demo: simulamos o envio de recuperacao para ${email}.`
          );
          return;
        }

        await runAction(() => requestPasswordReset(email));
      },
      signOut: async () => {
        if (!firebaseEnabled) {
          window.localStorage.removeItem(demoSessionKey);
          setUser(null);
          setProfile(null);
          return;
        }

        await runAction(() => logoutUser());
      },
      refreshProfile: async () => {
        if (!firebaseEnabled) {
          setProfile((currentProfile) => currentProfile ?? demoProfile);
          return;
        }

        await runAction(() => refreshProfile());
      }
    }),
    [error, firebaseEnabled, initialized, loading, profile, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext };
