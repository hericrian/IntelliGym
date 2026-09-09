import type { User } from "firebase/auth";

import type { UserProfileDocument } from "./firestore";

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload extends AuthCredentials {
  name: string;
}

export interface AuthContextValue {
  user: User | null;
  profile: UserProfileDocument | null;
  loading: boolean;
  initialized: boolean;
  error: string | null;
  signUp: (payload: RegisterPayload) => Promise<void>;
  signIn: (payload: AuthCredentials) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}
