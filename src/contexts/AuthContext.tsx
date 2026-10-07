import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth, isFirebaseConfigured } from "../services/firebase";
import { getUserProfile } from "../services/userService";
import type { UserProfile } from "../types/User";

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  configured: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(isFirebaseConfigured);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    return onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setProfile(null);
        setLoading(false);
        return;
      }
      try {
        setProfile(await getUserProfile(currentUser.uid));
      } catch {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    });
  }, []);

  async function refreshProfile() {
    if (!user) return;
    setProfile(await getUserProfile(user.uid));
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        configured: isFirebaseConfigured,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuth deve ser usado dentro de AuthProvider.");
  return context;
}
