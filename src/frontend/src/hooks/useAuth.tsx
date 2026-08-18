import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api, ApiError } from "../lib/api";
import type { User } from "../types/auth";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, companyName: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    try {
      const data = await api.get<{ user: User }>("/users/me");
      setUser(data.user);
    } catch {
      setUser(null);
    }
  }

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string) {
    await api.post<{ user: User }>("/auth/login", { email, password });
    // La respuesta de login no incluye el tenant; /me trae el perfil completo.
    await refresh();
  }

  async function signup(email: string, password: string, name: string, companyName: string) {
    await api.post("/auth/signup", { email, password, name, companyName });
  }

  async function logout() {
    await api.post("/auth/logout");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}

export { ApiError };
